import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status  # pyright: ignore[reportMissingImports]
from fastapi.security import OAuth2PasswordBearer  # pyright: ignore[reportMissingImports]
from jose import JWTError, jwt  # pyright: ignore[reportMissingModuleSource]
from passlib.context import CryptContext  # pyright: ignore[reportMissingModuleSource]
from sqlalchemy.orm import Session  # pyright: ignore[reportMissingImports]

from db import get_db
from models import User


SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY environment variable is not set.")


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# -------------------------
# Password utilities
# -------------------------

def hash_password(password: str) -> str:
    # bcrypt supports max 72 bytes
    password = password[:72]
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password[:72], hashed_password)


# -------------------------
# JWT utilities
# -------------------------

def create_access_token(*, data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# -------------------------
# User helpers
# -------------------------

def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: Optional[str] = payload.get("user_id")

        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = get_user_by_id(db, user_id=user_id)

    if user is None:
        raise credentials_exception

    return user