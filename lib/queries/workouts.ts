import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkoutLog, WorkoutSet, Exercise, WeeklySummary } from "@/lib/types";

interface AuthContext {
  supabase: SupabaseClient;
  userId: string;
}

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

export async function getTodayWorkout(workoutDate: string, ctx?: AuthContext): Promise<
  | (WorkoutLog & {
      exercises: { exercise: Exercise; sets: WorkoutSet[] }[];
    })
  | null
> {
  const supabase = ctx?.supabase ?? await createClient();
  const userId = ctx?.userId ?? (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return null;

  // Single query with nested select — no waterfall
  const { data: log } = await supabase
    .from("workout_logs")
    .select("*, workout_sets(*, exercise:exercises(*))")
    .eq("user_id", userId)
    .eq("workout_date", workoutDate)
    .single();

  if (!log) return null;

  const rawSets = (log.workout_sets ?? []) as (WorkoutSet & { exercise: Exercise })[];

  // Group sets by exercise
  const exerciseMap = new Map<
    string,
    { exercise: Exercise; sets: WorkoutSet[] }
  >();

  for (const set of rawSets) {
    const exerciseData = set.exercise as unknown as Exercise;
    const exerciseId = set.exercise_id;
    if (!exerciseMap.has(exerciseId)) {
      exerciseMap.set(exerciseId, { exercise: exerciseData, sets: [] });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { exercise: _exercise, ...setData } = set;
    exerciseMap.get(exerciseId)!.sets.push(setData as WorkoutSet);
  }

  const { workout_sets: _raw, ...logData } = log;

  return {
    ...logData,
    exercises: Array.from(exerciseMap.values()),
  };
}

export async function getRecentWorkouts(
  limit: number = 7,
  ctx?: AuthContext,
): Promise<WorkoutLog[]> {
  const supabase = ctx?.supabase ?? await createClient();
  const userId = ctx?.userId ?? (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return [];

  const { data } = await supabase
    .from("workout_logs")
    .select("*, workout_sets(id)")
    .eq("user_id", userId)
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
  ctx?: AuthContext,
): Promise<WeeklySummary> {
  const supabase = ctx?.supabase ?? await createClient();
  const userId = ctx?.userId ?? (await supabase.auth.getUser()).data.user?.id;
  if (!userId)
    return { workoutsThisWeek: 0, totalVolume: 0, totalSets: 0 };

  // Single query with nested select — no waterfall
  const { data: rawLogs } = await supabase
    .from("workout_logs")
    .select("id, workout_sets(weight, reps, is_warmup)")
    .eq("user_id", userId)
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

  let totalVolume = 0;
  let totalSets = 0;
  for (const log of logs) {
    for (const set of log.workout_sets as { weight: number; reps: number; is_warmup: boolean }[]) {
      if (!set.is_warmup) {
        totalVolume += Number(set.weight) * set.reps;
        totalSets++;
      }
    }
  }

  return {
    workoutsThisWeek: logs.length,
    totalVolume,
    totalSets,
  };
}
