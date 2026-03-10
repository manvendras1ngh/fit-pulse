import { headers } from "next/headers";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDashboardData } from "@/lib/queries/dashboard";
import { getServerWorkoutDate, getServerWeekBounds } from "@/lib/utils/server-workout-date";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const headerStore = await headers();
  const userId = headerStore.get("x-user-id");

  if (!userId) {
    redirect("/login");
  }

  const [{ workoutDate, dayOfWeek }, { weekStart, weekEnd }] =
    await Promise.all([getServerWorkoutDate(), getServerWeekBounds()]);

  const data = await getDashboardData(userId, workoutDate, dayOfWeek, weekStart, weekEnd);

  if (!data) {
    redirect("/login");
  }

  return (
    <DashboardClient
      profile={data.profile}
      todayWorkout={data.todayWorkout}
      todayPlanDay={data.todayPlanDay}
      activePlan={data.activePlan}
      recentWorkouts={data.recentWorkouts}
      weeklySummary={data.weeklySummary}
      workoutCount={data.workoutCount}
    />
  );
}
