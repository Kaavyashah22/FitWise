from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from uuid import UUID

class DailyMetricCreate(BaseModel):
    date: date
    sleep_hours: Optional[float] = Field(None, ge=0, le=24)
    soreness_score: Optional[int] = Field(None, ge=1, le=10)
    caloric_adherence: Optional[int] = Field(None, ge=0, le=200) # Percentage

class DailyMetricResponse(DailyMetricCreate):
    id: UUID
    user_id: UUID
    volume_load: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
