from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, constr
from uuid import UUID


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserBase(BaseModel):
    id: UUID
    email: Optional[EmailStr] = None
    display_name: str
    created_at: datetime

    class Config:
        from_attributes = True


class RegisterRequest(BaseModel):
    email: EmailStr
    password: constr(min_length=8)
    display_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    token: str


class MeResponse(UserBase):
    pass

