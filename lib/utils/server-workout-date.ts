import { cookies } from "next/headers";

/**
 * Compute today's workout date and day of week on the server
 * using the client's timezone from the `tz` cookie.
 * Falls back to UTC if the cookie is missing.
 */
export async function getServerWorkoutDate(): Promise<{
  workoutDate: string;
  dayOfWeek: number;
}> {
  const cookieStore = await cookies();
  const tz = cookieStore.get("tz")?.value || "UTC";

  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const workoutDate = formatter.format(now); // YYYY-MM-DD

  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
  });
  const dayName = dayFormatter.format(now);
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const dayOfWeek = dayMap[dayName] ?? now.getDay();

  return { workoutDate, dayOfWeek };
}

/**
 * Compute week boundaries (Sunday–Saturday) in the client's timezone.
 */
export async function getServerWeekBounds(): Promise<{
  weekStart: string;
  weekEnd: string;
}> {
  const { workoutDate, dayOfWeek } = await getServerWorkoutDate();

  const today = new Date(workoutDate + "T12:00:00"); // noon to avoid DST issues
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayOfWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return {
    weekStart: weekStart.toLocaleDateString("en-CA"),
    weekEnd: weekEnd.toLocaleDateString("en-CA"),
  };
}
