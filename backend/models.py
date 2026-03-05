import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID, ENUM as PgEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .db import Base


activity_level_enum = PgEnum(
    "sedentary",
    "light",
    "moderate",
    "active",
    "very_active",
    name="activity_level_enum",
    create_type=False,
)

goal_enum = PgEnum(
    "lose_weight",
    "maintain",
    "gain_muscle",
    name="goal_enum",
    create_type=False,
)


class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    email = Column(String, unique=True, nullable=True)
    password_hash = Column(Text, nullable=True)
    display_name = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    profile = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
    )
    workouts = relationship("Workout", back_populates="user", cascade="all, delete-orphan")
    weight_logs = relationship("WeightLog", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    activity_level = Column(activity_level_enum, nullable=True)
    goal = Column(goal_enum, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    height_cm = Column(Numeric(5, 2), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="profile")


class MuscleGroup(Base):
    __tablename__ = "muscle_groups"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    name = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    exercises = relationship("Exercise", back_populates="muscle_group", cascade="all, delete-orphan")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    muscle_group_id = Column(
        UUID(as_uuid=True),
        ForeignKey("muscle_groups.id", ondelete="RESTRICT"),
        nullable=False,
    )
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    video_url = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    is_bodyweight = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("muscle_group_id", "name", name="uq_exercises_muscle_group_name"),
    )

    muscle_group = relationship("MuscleGroup", back_populates="exercises")
    workout_exercises = relationship("WorkoutExercise", back_populates="exercise", cascade="all, delete-orphan")


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    date = Column(Date, nullable=False)
    name = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="workouts")
    workout_exercises = relationship("WorkoutExercise", back_populates="workout", cascade="all, delete-orphan")


class WorkoutExercise(Base):
    __tablename__ = "workout_exercises"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    workout_id = Column(
        UUID(as_uuid=True),
        ForeignKey("workouts.id", ondelete="CASCADE"),
        nullable=False,
    )
    exercise_id = Column(
        UUID(as_uuid=True),
        ForeignKey("exercises.id", ondelete="RESTRICT"),
        nullable=False,
    )
    order_index = Column(SmallInteger, nullable=False, default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    workout = relationship("Workout", back_populates="workout_exercises")
    exercise = relationship("Exercise", back_populates="workout_exercises")
    sets = relationship("Set", back_populates="workout_exercise", cascade="all, delete-orphan")


class Set(Base):
    __tablename__ = "sets"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    workout_exercise_id = Column(
        UUID(as_uuid=True),
        ForeignKey("workout_exercises.id", ondelete="CASCADE"),
        nullable=False,
    )
    set_number = Column(SmallInteger, nullable=False)
    reps = Column(SmallInteger, nullable=False)
    weight_kg = Column(Numeric(6, 2), nullable=False)
    rpe = Column(Numeric(3, 1), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    workout_exercise = relationship("WorkoutExercise", back_populates="sets")


class WeightLog(Base):
    __tablename__ = "weight_logs"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    date = Column(Date, nullable=False)
    weight_kg = Column(Numeric(5, 2), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "date", name="uq_weight_logs_user_date"),
    )

    user = relationship("User", back_populates="weight_logs")

