import { createClient } from "@/lib/supabase/server";
import type { WorkoutLog, WorkoutSet, Exercise, WeeklySummary } from "@/lib/types";

export async function getTodayWorkout(workoutDate: string): Promise<
  | (WorkoutLog & {
      exercises: { exercise: Exercise; sets: WorkoutSet[] }[];
    })
  | null
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: log } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("workout_date", workoutDate)
    .single();

  if (!log) return null;

  const { data: sets } = await supabase
    .from("workout_sets")
    .select("*, exercise:exercises(*)")
    .eq("workout_log_id", log.id)
    .order("set_number");

  // Group sets by exercise
  const exerciseMap = new Map<
    string,
    { exercise: Exercise; sets: WorkoutSet[] }
  >();

  for (const set of sets ?? []) {
    const exerciseData = set.exercise as unknown as Exercise;
    const exerciseId = set.exercise_id;
    if (!exerciseMap.has(exerciseId)) {
      exerciseMap.set(exerciseId, { exercise: exerciseData, sets: [] });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { exercise: _exercise, ...setData } = set;
    exerciseMap.get(exerciseId)!.sets.push(setData as WorkoutSet);
  }

  return {
    ...log,
    exercises: Array.from(exerciseMap.values()),
  };
}

export async function getRecentWorkouts(
  limit: number = 7,
): Promise<WorkoutLog[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("workout_date", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getWeeklySummary(
  weekStart: string,
  weekEnd: string,
): Promise<WeeklySummary> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user)
    return { workoutsThisWeek: 0, totalVolume: 0, totalSets: 0 };

  const { data: logs } = await supabase
    .from("workout_logs")
    .select("id")
    .eq("user_id", user.id)
    .gte("workout_date", weekStart)
    .lte("workout_date", weekEnd);

  if (!logs || logs.length === 0) {
    return { workoutsThisWeek: 0, totalVolume: 0, totalSets: 0 };
  }

  const logIds = logs.map((l) => l.id);

  const { data: sets } = await supabase
    .from("workout_sets")
    .select("weight, reps")
    .in("workout_log_id", logIds);

  let totalVolume = 0;
  let totalSets = 0;
  for (const set of sets ?? []) {
    totalVolume += Number(set.weight) * set.reps;
    totalSets++;
  }

  return {
    workoutsThisWeek: logs.length,
    totalVolume,
    totalSets,
  };
}
