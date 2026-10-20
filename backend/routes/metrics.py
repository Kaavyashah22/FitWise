from datetime import date, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from db import get_db
from models import User, DailyMetric, Workout, WorkoutExercise, Set
from routes.auth import get_current_user
from schemas.metrics import DailyMetricCreate, DailyMetricResponse

router = APIRouter(prefix="/metrics", tags=["Metrics"])

@router.post("/daily", response_model=DailyMetricResponse)
def log_daily_metric(
    metric_in: DailyMetricCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Log or update daily metrics for the current user.
    If a record for the given date already exists, it updates it.
    """
    # Check if a record already exists for this date
    existing_metric = db.query(DailyMetric).filter(
        DailyMetric.user_id == current_user.id,
        DailyMetric.date == metric_in.date
    ).first()

    if existing_metric:
        # Update existing
        if metric_in.sleep_hours is not None:
            existing_metric.sleep_hours = metric_in.sleep_hours
        if metric_in.soreness_score is not None:
            existing_metric.soreness_score = metric_in.soreness_score
        if metric_in.caloric_adherence is not None:
            existing_metric.caloric_adherence = metric_in.caloric_adherence
        
        db.commit()
        db.refresh(existing_metric)
        return existing_metric

    # Create new
    new_metric = DailyMetric(
        user_id=current_user.id,
        date=metric_in.date,
        sleep_hours=metric_in.sleep_hours,
        soreness_score=metric_in.soreness_score,
        caloric_adherence=metric_in.caloric_adherence,
    )
    db.add(new_metric)
    try:
        db.commit()
        db.refresh(new_metric)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error.")
    
    return new_metric

@router.get("/daily", response_model=List[DailyMetricResponse])
def get_daily_metrics(
    limit: int = 14,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the user's trailing daily metrics. Default is last 14 days.
    """
    metrics = db.query(DailyMetric).filter(
        DailyMetric.user_id == current_user.id
    ).order_by(DailyMetric.date.desc()).limit(limit).all()
    
    return metrics


@router.get("/injury-risk")
def get_injury_risk(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Predict real-time injury risk for the current user using GBDT Machine Learning.
    Evaluates today's recovery metrics alongside trailing volume load.
    """
    from services.injury_predictor import predict_user_injury_risk

    # Fetch check-in metrics logged over the trailing 7 days
    import json
    seven_days_ago = date.today() - timedelta(days=7)
    recent_metrics = db.query(DailyMetric).filter(
        DailyMetric.user_id == current_user.id,
        DailyMetric.date >= seven_days_ago
    ).order_by(DailyMetric.date.desc()).all()

    # Most recent check-in (or latest overall if none in last 7 days)
    latest_metric = recent_metrics[0] if recent_metrics else db.query(DailyMetric).filter(
        DailyMetric.user_id == current_user.id
    ).order_by(DailyMetric.date.desc()).first()

    acute_sleep = float(latest_metric.sleep_hours) if latest_metric and latest_metric.sleep_hours is not None else 7.0
    acute_soreness = int(latest_metric.soreness_score) if latest_metric and latest_metric.soreness_score is not None else 3
    acute_nutrition = int(latest_metric.caloric_adherence) if latest_metric and latest_metric.caloric_adherence is not None else 85

    # Multi-day rolling evaluation
    valid_sleeps = [float(m.sleep_hours) for m in recent_metrics if m.sleep_hours is not None]
    valid_soreness = [int(m.soreness_score) for m in recent_metrics if m.soreness_score is not None]
    valid_nutritions = [int(m.caloric_adherence) for m in recent_metrics if m.caloric_adherence is not None]

    checkins_count = len(recent_metrics)

    if checkins_count > 1:
        # Hybrid blend: 50% acute shock (last night) + 50% chronic physiological baseline (7-day rolling average)
        avg_7d_sleep = sum(valid_sleeps) / len(valid_sleeps) if valid_sleeps else acute_sleep
        avg_7d_soreness = sum(valid_soreness) / len(valid_soreness) if valid_soreness else acute_soreness
        avg_7d_nutrition = sum(valid_nutritions) / len(valid_nutritions) if valid_nutritions else acute_nutrition

        effective_sleep = round(0.5 * acute_sleep + 0.5 * avg_7d_sleep, 1)
        effective_soreness = int(round(0.5 * acute_soreness + 0.5 * avg_7d_soreness))
        effective_nutrition = int(round(0.5 * acute_nutrition + 0.5 * avg_7d_nutrition))
        evaluation_mode = f"Hybrid 7-Day Rolling Window ({checkins_count} check-ins evaluated)"
    else:
        avg_7d_sleep = acute_sleep
        avg_7d_soreness = float(acute_soreness)
        avg_7d_nutrition = float(acute_nutrition)
        effective_sleep = acute_sleep
        effective_soreness = acute_soreness
        effective_nutrition = acute_nutrition
        evaluation_mode = "Acute Single-Day Check-in"

    # 1. Calculate actual volume load from real workouts logged by the user over the trailing 7 days
    recent_workouts = db.query(Workout).filter(
        Workout.user_id == current_user.id,
        Workout.date >= seven_days_ago
    ).all()

    total_actual_volume = 0.0
    workout_count = len(recent_workouts)
    for w in recent_workouts:
        volume_found = False
        if w.workout_exercises:
            for we in w.workout_exercises:
                for s in we.sets:
                    if s.reps and s.weight_kg:
                        total_actual_volume += float(s.reps) * float(s.weight_kg)
                        volume_found = True

        # FitWise stores sets, reps, and weight in w.notes as serialized JSON
        if not volume_found and w.notes:
            try:
                data = json.loads(w.notes)
                sets = float(data.get("sets", 0))
                reps = float(data.get("reps", 0))
                weight = float(data.get("weight", 0))
                total_actual_volume += sets * reps * weight
            except Exception:
                pass

    # If user logged real workouts, use average session volume; else fallback to metric or baseline
    if workout_count > 0 and total_actual_volume > 0:
        volume = total_actual_volume / workout_count
    elif latest_metric and latest_metric.volume_load is not None:
        volume = float(latest_metric.volume_load)
    else:
        volume = 2500.0

    prediction = predict_user_injury_risk(
        sleep_hours=effective_sleep,
        soreness_score=effective_soreness,
        caloric_adherence=effective_nutrition,
        volume_load=volume
    )

    return {
        "success": True,
        "has_logged_today": latest_metric is not None and latest_metric.date == date.today(),
        "logged_workouts_evaluated": workout_count,
        "seven_day_total_volume": round(total_actual_volume, 1),
        "checkins_evaluated_7d": checkins_count,
        "evaluation_mode": evaluation_mode,
        "acute_metrics": {
            "sleep_hours": acute_sleep,
            "soreness_score": acute_soreness,
            "caloric_adherence": acute_nutrition
        },
        "seven_day_avg_metrics": {
            "sleep_hours": round(avg_7d_sleep, 1),
            "soreness_score": round(avg_7d_soreness, 1),
            "caloric_adherence": round(avg_7d_nutrition, 1)
        },
        **prediction
    }

