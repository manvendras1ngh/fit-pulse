/**
 * Get today's workout date in YYYY-MM-DD format using the client's local timezone.
 * Must only be called from client components.
 */
export function getWorkoutDate(): string {
  return new Date().toLocaleDateString("en-CA");
}

/**
 * Get today's day of week (0 = Sunday, 6 = Saturday) using the client's timezone.
 * Must only be called from client components.
 */
export function getTodayDayOfWeek(): number {
  return new Date().getDay();
}
