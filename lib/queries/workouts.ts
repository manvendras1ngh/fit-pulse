import { createClient } from "@/lib/supabase/server";
import type { WorkoutLog, WorkoutSet, Exercise, WeeklySummary } from "@/lib/types";

export interface HistoricalSet {
  weight: number;
  reps: number;
  is_warmup: boolean;
  set_number: number;
}

export async function getLastSessionSets(
  exerciseId: string,
): Promise<HistoricalSet[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Find the most recent completed workout that has sets for this exercise
  const { data: sets } = await supabase
    .from("workout_sets")
    .select("weight, reps, is_warmup, set_number, workout_log_id, workout_logs!inner(completed_at)")
    .eq("exercise_id", exerciseId)
    .eq("user_id", user.id)
    .not("workout_logs.completed_at", "is", null)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!sets || sets.length === 0) return [];

  // Group by workout_log_id, return only the most recent group
  const firstLogId = sets[0].workout_log_id;
  return sets
    .filter((s) => s.workout_log_id === firstLogId)
    .sort((a, b) => a.set_number - b.set_number)
    .map(({ weight, reps, is_warmup, set_number }) => ({
      weight,
      reps,
      is_warmup,
      set_number,
    }));
}

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
    .select("*, workout_sets(id)")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("workout_date", { ascending: false })
    .limit(limit);

  // Only include workouts that have at least one set
  return (data ?? [])
    .filter((log) => Array.isArray(log.workout_sets) && log.workout_sets.length > 0)
    .map(({ workout_sets: _sets, ...log }) => log) as WorkoutLog[];
}

export async function getWeeklySummary(
  weekStart: string,
  weekEnd: string,
): Promise<WeeklySummary> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user)
    return { workoutsThisWeek: 0, totalVolume: 0, totalSets: 0 };

  const { data: rawLogs } = await supabase
    .from("workout_logs")
    .select("id, workout_sets(id)")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .gte("workout_date", weekStart)
    .lte("workout_date", weekEnd);

  // Only include workouts that have at least one set
  const logs = (rawLogs ?? []).filter(
    (log) => Array.isArray(log.workout_sets) && log.workout_sets.length > 0,
  );

  if (logs.length === 0) {
    return { workoutsThisWeek: 0, totalVolume: 0, totalSets: 0 };
  }

  const logIds = logs.map((l) => l.id);

  const { data: sets } = await supabase
    .from("workout_sets")
    .select("weight, reps")
    .in("workout_log_id", logIds)
    .eq("is_warmup", false);

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
