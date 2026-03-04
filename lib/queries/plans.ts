import { createClient } from "@/lib/supabase/server";
import type {
  WorkoutPlan,
  WorkoutPlanDay,
  PlanDayExercise,
  Exercise,
  PlanWithDays,
} from "@/lib/types";

export async function getActivePlan(): Promise<WorkoutPlan | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  return data;
}

export async function getPlanWithDays(
  planId: string,
): Promise<PlanWithDays | null> {
  const supabase = await createClient();

  const { data: plan } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (!plan) return null;

  const { data: days } = await supabase
    .from("workout_plan_days")
    .select("*")
    .eq("plan_id", planId)
    .order("day_of_week");

  const daysWithExercises = [];

  for (const day of days ?? []) {
    const { data: planExercises } = await supabase
      .from("plan_day_exercises")
      .select("*, exercise:exercises(*)")
      .eq("plan_day_id", day.id)
      .order("position");

    const exercises = (planExercises ?? []).map((pe) => ({
      ...pe,
      exercise: pe.exercise as unknown as Exercise,
    })) as (PlanDayExercise & { exercise: Exercise })[];

    daysWithExercises.push({ ...day, exercises });
  }

  return { ...plan, days: daysWithExercises };
}

export async function getTodayPlanDay(
  dayOfWeek: number,
): Promise<(WorkoutPlanDay & { exercises: (PlanDayExercise & { exercise: Exercise })[] }) | null> {
  const activePlan = await getActivePlan();
  if (!activePlan) return null;

  const supabase = await createClient();

  const { data: day } = await supabase
    .from("workout_plan_days")
    .select("*")
    .eq("plan_id", activePlan.id)
    .eq("day_of_week", dayOfWeek)
    .single();

  if (!day) return null;

  const { data: planExercises } = await supabase
    .from("plan_day_exercises")
    .select("*, exercise:exercises(*)")
    .eq("plan_day_id", day.id)
    .order("position");

  const exercises = (planExercises ?? []).map((pe) => ({
    ...pe,
    exercise: pe.exercise as unknown as Exercise,
  })) as (PlanDayExercise & { exercise: Exercise })[];

  return { ...day, exercises };
}

export async function getAllPlans(): Promise<WorkoutPlan[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}
