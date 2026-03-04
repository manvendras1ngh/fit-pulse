import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getProfile } from "@/lib/queries/profile";
import { getTodayWorkout, getRecentWorkouts, getWeeklySummary } from "@/lib/queries/workouts";
import { getTodayPlanDay, getActivePlan } from "@/lib/queries/plans";
import { getWorkoutCount } from "@/lib/queries/progress";
import { redirect } from "next/navigation";

async function fetchDashboardData(workoutDate: string, dayOfWeek: number) {
  "use server";

  const [todayWorkout, todayPlanDay, activePlan, recentWorkouts, workoutCount] =
    await Promise.all([
      getTodayWorkout(workoutDate),
      getTodayPlanDay(dayOfWeek),
      getActivePlan(),
      getRecentWorkouts(7),
      getWorkoutCount(),
    ]);

  // Calculate week boundaries for weekly summary
  const today = new Date();
  const dayOfWeekToday = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayOfWeekToday);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weeklySummary = await getWeeklySummary(
    weekStart.toLocaleDateString("en-CA"),
    weekEnd.toLocaleDateString("en-CA"),
  );

  return {
    todayWorkout,
    todayPlanDay,
    activePlan,
    recentWorkouts,
    weeklySummary,
    workoutCount,
  };
}

export default async function DashboardPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  return <DashboardClient profile={profile} fetchData={fetchDashboardData} />;
}
