-- FitWise PostgreSQL schema
-- UUID primary keys, enums for activity_level and goal, indexes on user_id

-- Enable pgcrypto for gen_random_uuid (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ENUM types
CREATE TYPE activity_level_enum AS ENUM (
  'sedentary',
  'light',
  'moderate',
  'active',
  'very_active'
);

CREATE TYPE goal_enum AS ENUM (
  'lose_weight',
  'maintain',
  'gain_muscle'
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  password_hash TEXT,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User profiles (one-to-one with users)
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  activity_level activity_level_enum,
  goal goal_enum,
  date_of_birth DATE,
  height_cm NUMERIC(5, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Muscle groups catalog
CREATE TABLE muscle_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exercises catalog with media references
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  muscle_group_id UUID NOT NULL REFERENCES muscle_groups(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  image_url TEXT,
  is_bodyweight BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (muscle_group_id, name)
);

-- Index for faster exercise lookups by muscle group
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group_id);

-- Workouts (sessions)
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fetching workouts by user
CREATE INDEX idx_workouts_user_id ON workouts(user_id);

-- Exercises within a workout
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  order_index SMALLINT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fetching workout_exercises by workout
CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);

-- Individual sets for each workout exercise
CREATE TABLE sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
  set_number SMALLINT NOT NULL,
  reps SMALLINT NOT NULL,
  weight_kg NUMERIC(6, 2) NOT NULL,
  rpe NUMERIC(3, 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workout_exercise_id, set_number)
);

-- Index for fetching sets by workout_exercise
CREATE INDEX idx_sets_workout_exercise_id ON sets(workout_exercise_id);

-- Weight logs (progress tracking)
CREATE TABLE weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_kg NUMERIC(5, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

-- Index for fetching weight_logs by user
CREATE INDEX idx_weight_logs_user_id ON weight_logs(user_id);

-- Index for efficient weight history queries by user and date
CREATE INDEX idx_weight_logs_date ON weight_logs(user_id, date);

