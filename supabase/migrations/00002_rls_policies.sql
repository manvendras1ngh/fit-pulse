-- ============================================================
-- FitPulse: Row Level Security Policies
-- ============================================================

-- Helper function for plan_day_exercises RLS
-- Uses SECURITY DEFINER to avoid nested subquery performance issues
CREATE OR REPLACE FUNCTION public.owns_plan_day(p_plan_day_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM workout_plan_days wpd
    JOIN workout_plans wp ON wp.id = wpd.plan_id
    WHERE wpd.id = p_plan_day_id
      AND wp.user_id = (SELECT auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- profiles: user can only access their own profile
-- ============================================================
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = (SELECT auth.uid()));

-- ============================================================
-- exercises: see own + system, modify only own
-- ============================================================
CREATE POLICY "Users can view own and system exercises"
  ON exercises FOR SELECT
  USING (
    (user_id = (SELECT auth.uid()) OR user_id IS NULL)
    AND is_deleted = false
  );

CREATE POLICY "Users can create own exercises"
  ON exercises FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own exercises"
  ON exercises FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own exercises"
  ON exercises FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- ============================================================
-- workout_plans: user owns their plans
-- ============================================================
CREATE POLICY "Users can view own plans"
  ON workout_plans FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own plans"
  ON workout_plans FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own plans"
  ON workout_plans FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own plans"
  ON workout_plans FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- ============================================================
-- workout_plan_days: access through plan ownership
-- ============================================================
CREATE POLICY "Users can view own plan days"
  ON workout_plan_days FOR SELECT
  USING (plan_id IN (SELECT id FROM workout_plans WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can create own plan days"
  ON workout_plan_days FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM workout_plans WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can update own plan days"
  ON workout_plan_days FOR UPDATE
  USING (plan_id IN (SELECT id FROM workout_plans WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can delete own plan days"
  ON workout_plan_days FOR DELETE
  USING (plan_id IN (SELECT id FROM workout_plans WHERE user_id = (SELECT auth.uid())));

-- ============================================================
-- plan_day_exercises: access through security definer function
-- ============================================================
CREATE POLICY "Users can view own plan day exercises"
  ON plan_day_exercises FOR SELECT
  USING (public.owns_plan_day(plan_day_id));

CREATE POLICY "Users can create own plan day exercises"
  ON plan_day_exercises FOR INSERT
  WITH CHECK (public.owns_plan_day(plan_day_id));

CREATE POLICY "Users can update own plan day exercises"
  ON plan_day_exercises FOR UPDATE
  USING (public.owns_plan_day(plan_day_id));

CREATE POLICY "Users can delete own plan day exercises"
  ON plan_day_exercises FOR DELETE
  USING (public.owns_plan_day(plan_day_id));

-- ============================================================
-- workout_logs: user owns their logs
-- ============================================================
CREATE POLICY "Users can view own workout logs"
  ON workout_logs FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own workout logs"
  ON workout_logs FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own workout logs"
  ON workout_logs FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own workout logs"
  ON workout_logs FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- ============================================================
-- workout_sets: uses denormalized user_id for performance
-- ============================================================
CREATE POLICY "Users can view own workout sets"
  ON workout_sets FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own workout sets"
  ON workout_sets FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own workout sets"
  ON workout_sets FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own workout sets"
  ON workout_sets FOR DELETE
  USING (user_id = (SELECT auth.uid()));
