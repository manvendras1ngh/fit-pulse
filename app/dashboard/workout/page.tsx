import { WorkoutPageClient } from "@/components/workout/workout-page-client";
import { getTodayWorkout } from "@/lib/queries/workouts";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Exercise, PlanDayExercise, WorkoutLog, WorkoutSet } from "@/lib/types";

interface WorkoutPageProps {
  searchParams: Promise<{
    planId?: string;
    dayName?: string;
    planDayId?: string;
  }>;
}

export type WorkoutData = {
  existingWorkout:
    | (WorkoutLog & { exercises: { exercise: Exercise; sets: WorkoutSet[] }[] })
    | null;
  planExercises?: Exercise[];
};

export default async function WorkoutPage({ searchParams }: WorkoutPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;

  async function fetchWorkoutData(
    workoutDate: string,
    planDayId?: string,
  ): Promise<WorkoutData> {
    "use server";

    const existingWorkout = await getTodayWorkout(workoutDate);

    let planExercises: Exercise[] | undefined;
    if (planDayId && !existingWorkout) {
      const supabase = await createClient();
      const { data: planDayExs } = await supabase
        .from("plan_day_exercises")
        .select("*, exercise:exercises(*)")
        .eq("plan_day_id", planDayId)
        .order("position");

      if (planDayExs) {
        planExercises = (planDayExs as (PlanDayExercise & { exercise: Exercise })[])
          .map((pde) => pde.exercise);
      }
    }

    return { existingWorkout, planExercises };
  }

  return (
    <WorkoutPageClient
      fetchWorkoutData={fetchWorkoutData}
      planId={params.planId}
      dayName={params.dayName}
      planDayId={params.planDayId}
    />
  );
}
