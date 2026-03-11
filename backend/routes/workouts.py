from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db import get_db
from models import Workout, WorkoutExercise, Set, WeightLog, Exercise
from security import get_current_user


router = APIRouter()

from typing import Optional


class WorkoutCreate(BaseModel):
    date: date
    name: Optional[str] = None
    notes: Optional[str] = None


class WeightLogCreate(BaseModel):
    date: date
    weight_kg: float


@router.post("/workouts")
def create_workout(
    payload: WorkoutCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        workout = Workout(
            user_id=current_user.id,
            date=payload.date,
            name=payload.name,
            notes=payload.notes,
        )
        db.add(workout)
        db.commit()
        db.refresh(workout)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc))

    return {
        "id": str(workout.id),
        "user_id": str(workout.user_id),
        "date": workout.date.isoformat(),
        "name": workout.name,
        "notes": workout.notes,
        "created_at": workout.created_at.isoformat() if workout.created_at else None,
        "updated_at": workout.updated_at.isoformat() if workout.updated_at else None,
    }


@router.get("/workouts")
def list_workouts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    workouts: List[Workout] = (
        db.query(Workout)
        .filter(Workout.user_id == current_user.id)
        .order_by(Workout.date.desc())
        .all()
    )

    return [
        {
            "id": str(w.id),
            "user_id": str(w.user_id),
            "date": w.date.isoformat(),
            "name": w.name,
            "notes": w.notes,
            "created_at": w.created_at.isoformat() if w.created_at else None,
            "updated_at": w.updated_at.isoformat() if w.updated_at else None,
        }
        for w in workouts
    ]


@router.post("/weight-logs")
def create_weight_log(
    payload: WeightLogCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        weight_log = (
            db.query(WeightLog)
            .filter(WeightLog.user_id == current_user.id, WeightLog.date == payload.date)
            .first()
        )

        if weight_log:
            weight_log.weight_kg = payload.weight_kg
        else:
            weight_log = WeightLog(
                user_id=current_user.id,
                date=payload.date,
                weight_kg=payload.weight_kg,
            )
            db.add(weight_log)

        db.commit()
        db.refresh(weight_log)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc))

    return {
        "id": str(weight_log.id),
        "user_id": str(weight_log.user_id),
        "date": weight_log.date.isoformat(),
        "weight_kg": float(weight_log.weight_kg),
        "created_at": weight_log.created_at.isoformat() if weight_log.created_at else None,
    }


@router.get("/weight-logs")
def list_weight_logs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    logs: List[WeightLog] = (
        db.query(WeightLog)
        .filter(WeightLog.user_id == current_user.id)
        .order_by(WeightLog.date.asc())
        .all()
    )

    return [
        {
            "id": str(log.id),
            "user_id": str(log.user_id),
            "date": log.date.isoformat(),
            "weight_kg": float(log.weight_kg),
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in logs
    ]


@router.get("/exercises")
def list_exercises(db: Session = Depends(get_db)):
    exercises: List[Exercise] = db.query(Exercise).order_by(Exercise.name.asc()).all()

    return [
        {
            "id": str(ex.id),
            "name": ex.name,
            "muscle_group_id": str(ex.muscle_group_id),
            "description": ex.description,
            "video_url": ex.video_url,
            "image_url": ex.image_url,
            "is_bodyweight": ex.is_bodyweight,
        }
        for ex in exercises
    ]

