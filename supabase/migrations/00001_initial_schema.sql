-- ============================================================
-- FitPulse: Initial Schema
-- ============================================================

-- Enum: unit preference
CREATE TYPE unit_preference AS ENUM ('kg', 'lbs');

-- ============================================================
-- 1. profiles (auto-created via trigger on auth.users)
-- ============================================================
CREATE TABLE profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text,
  email      text NOT NULL,
  avatar_url text,
  preferred_unit unit_preference NOT NULL DEFAULT 'kg',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. exercises
-- ============================================================
CREATE TABLE exercises (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name         text NOT NULL CHECK (length(name) <= 100),
  muscle_group text CHECK (muscle_group IN (
    'chest', 'back', 'shoulders', 'biceps', 'triceps',
    'legs', 'core', 'full_body', 'cardio'
  )),
  type         text NOT NULL DEFAULT 'strength' CHECK (type IN ('strength', 'cardio')),
  is_deleted   boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_exercises_user ON exercises(user_id);

-- ============================================================
-- 3. workout_plans
-- ============================================================
CREATE TABLE workout_plans (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       text NOT NULL CHECK (length(name) <= 100),
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;

-- Partial unique: one active plan per user
CREATE UNIQUE INDEX one_active_plan ON workout_plans(user_id) WHERE is_active = true;
CREATE INDEX idx_workout_plans_user_active ON workout_plans(user_id, is_active);

-- ============================================================
-- 4. workout_plan_days
-- ============================================================
CREATE TABLE workout_plan_days (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id     uuid NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  name        text NOT NULL CHECK (length(name) <= 100),
  UNIQUE(plan_id, day_of_week)
);

ALTER TABLE workout_plan_days ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_plan_days_lookup ON workout_plan_days(plan_id, day_of_week);

-- ============================================================
-- 5. plan_day_exercises
-- ============================================================
CREATE TABLE plan_day_exercises (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_day_id  uuid NOT NULL REFERENCES workout_plan_days(id) ON DELETE CASCADE,
  exercise_id  uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  position     integer NOT NULL CHECK (position > 0),
  UNIQUE(plan_day_id, position)
);

ALTER TABLE plan_day_exercises ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_plan_day_exercises_lookup ON plan_day_exercises(plan_day_id, position);

-- ============================================================
-- 6. workout_logs
-- ============================================================
CREATE TABLE workout_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id      uuid REFERENCES workout_plans(id) ON DELETE SET NULL,
  workout_date date NOT NULL,
  day_name     text,
  started_at   timestamptz,
  completed_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, workout_date)
);

ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_workout_logs_user ON workout_logs(user_id);

-- ============================================================
-- 7. workout_sets
-- ============================================================
CREATE TABLE workout_sets (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id uuid NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
  user_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id    uuid NOT NULL REFERENCES exercises(id) ON DELETE SET NULL,
  set_number     integer NOT NULL CHECK (set_number > 0),
  weight         numeric(7,2) NOT NULL CHECK (weight >= 0),
  reps           integer NOT NULL CHECK (reps > 0),
  is_warmup      boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workout_log_id, exercise_id, set_number)
);

ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_sets_log ON workout_sets(workout_log_id);
CREATE INDEX idx_sets_exercise ON workout_sets(exercise_id);
CREATE INDEX idx_sets_user ON workout_sets(user_id);
CREATE INDEX idx_sets_progress ON workout_sets(exercise_id, is_warmup, weight);
