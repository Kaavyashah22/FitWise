import uuid
from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from db import get_db
from models import User, DailyMetric
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
