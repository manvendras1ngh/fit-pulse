import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BestLift, Exercise } from "@/lib/types";

interface AuthContext {
  supabase: SupabaseClient;
  userId: string;
}

interface VolumeDataPoint {
  date: string;
  volume: number;
}

export async function getVolumeOverTime(
  weeks: number = 8,
): Promise<VolumeDataPoint[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);
  const startStr = startDate.toLocaleDateString("en-CA");

  const { data: logs } = await supabase
    .from("workout_logs")
    .select("id, workout_date")
    .eq("user_id", user.id)
    .gte("workout_date", startStr)
    .order("workout_date");

  if (!logs || logs.length === 0) return [];

  const logIds = logs.map((l) => l.id);
  const logDateMap = new Map(logs.map((l) => [l.id, l.workout_date]));

  const { data: sets } = await supabase
    .from("workout_sets")
    .select("workout_log_id, weight, reps")
    .in("workout_log_id", logIds)
    .eq("is_warmup", false);

  const volumeByDate = new Map<string, number>();

  for (const set of sets ?? []) {
    const date = logDateMap.get(set.workout_log_id)!;
    const current = volumeByDate.get(date) ?? 0;
    volumeByDate.set(date, current + Number(set.weight) * set.reps);
  }

  return Array.from(volumeByDate.entries())
    .map(([date, volume]) => ({ date, volume }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

interface ExerciseProgressPoint {
  date: string;
  estimated1RM: number;
}

export async function getExerciseProgress(
  exerciseId: string,
  weeks: number = 8,
): Promise<ExerciseProgressPoint[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);
  const startStr = startDate.toLocaleDateString("en-CA");

  const { data: sets } = await supabase
    .from("workout_sets")
    .select("weight, reps, is_warmup, workout_log_id, workout_log:workout_logs!inner(workout_date)")
    .eq("user_id", user.id)
    .eq("exercise_id", exerciseId)
    .eq("is_warmup", false)
    .gte("workout_log.workout_date", startStr);

  if (!sets || sets.length === 0) return [];

  // Group by date, find best 1RM per session
  const bestByDate = new Map<string, number>();

  for (const set of sets) {
    const log = set.workout_log as unknown as { workout_date: string } | null;
    if (!log) continue;
    const date = log.workout_date;
    const estimated1RM = Number(set.weight) * (1 + set.reps / 30); // Epley formula
    const current = bestByDate.get(date) ?? 0;
    if (estimated1RM > current) {
      bestByDate.set(date, estimated1RM);
    }
  }

  return Array.from(bestByDate.entries())
    .map(([date, estimated1RM]) => ({ date, estimated1RM: Math.round(estimated1RM * 100) / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getBestLifts(limit: number = 3): Promise<BestLift[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  const startStr = startDate.toLocaleDateString("en-CA");

  const { data: sets } = await supabase
    .from("workout_sets")
    .select("weight, reps, exercise_id, exercise:exercises(*), workout_log:workout_logs!inner(workout_date)")
    .eq("user_id", user.id)
    .eq("is_warmup", false)
    .gte("workout_log.workout_date", startStr);

  if (!sets || sets.length === 0) return [];

  // Find heaviest weight lifted per exercise
  const bestByExercise = new Map<
    string,
    { exercise: Exercise; weight: number; reps: number }
  >();

  for (const set of sets) {
    const exercise = set.exercise as unknown as Exercise;
    if (!exercise) continue;
    const weight = Number(set.weight);
    const current = bestByExercise.get(set.exercise_id);
    if (!current || weight > current.weight) {
      bestByExercise.set(set.exercise_id, {
        exercise,
        weight,
        reps: set.reps,
      });
    }
  }

  return Array.from(bestByExercise.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}

export async function getWorkoutCount(ctx?: AuthContext): Promise<number> {
  const supabase = ctx?.supabase ?? await createClient();
  const userId = ctx?.userId ?? (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return 0;

  const { data } = await supabase
    .from("workout_logs")
    .select("id, workout_sets(count)")
    .eq("user_id", userId)
    .not("completed_at", "is", null);

  // Only count workouts that have at least one set
  return (data ?? []).filter(
    (log) => {
      const sets = log.workout_sets as unknown as { count: number }[];
      return sets?.[0]?.count > 0;
    },
  ).length;
}
