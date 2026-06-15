from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from uuid import UUID

class ProfileUpdate(BaseModel):
    age: Optional[int] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    gender: Optional[str] = None
    activity_level: Optional[str] = None
    goal: Optional[str] = None
    food_preference: Optional[str] = None
    medical_history: Optional[str] = None
    date_of_birth: Optional[date] = None

class ProfileResponse(ProfileUpdate):
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
