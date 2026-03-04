import { WorkoutPageClient } from "@/components/workout/workout-page-client";
import { getTodayWorkout } from "@/lib/queries/workouts";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Exercise, PlanDayExercise } from "@/lib/types";

interface WorkoutPageProps {
  searchParams: Promise<{
    planId?: string;
    dayName?: string;
    planDayId?: string;
  }>;
}

export default async function WorkoutPage({ searchParams }: WorkoutPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;

  const serverDate = new Date().toLocaleDateString("en-CA");
  const existingWorkout = await getTodayWorkout(serverDate);

  // If plan context provided and no existing workout, fetch plan exercises
  let planExercises: Exercise[] | undefined;
  if (params.planDayId && !existingWorkout) {
    const { data: planDayExs } = await supabase
      .from("plan_day_exercises")
      .select("*, exercise:exercises(*)")
      .eq("plan_day_id", params.planDayId)
      .order("position");

    if (planDayExs) {
      planExercises = (planDayExs as (PlanDayExercise & { exercise: Exercise })[])
        .map((pde) => pde.exercise);
    }
  }

  return (
    <WorkoutPageClient
      existingWorkout={existingWorkout}
      planId={params.planId}
      dayName={params.dayName}
      planExercises={planExercises}
    />
  );
}
