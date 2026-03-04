export type Level = "Beginner" | "Intermediate" | "Advanced" | "Elite";

/**
 * Compute user level based on total workout count, whether they are
 * trending up in volume, and workout consistency (3+ sessions/week avg).
 */
export function computeLevel(
  workoutCount: number,
  trendingUp: boolean,
  consistent: boolean,
): Level {
  if (workoutCount >= 100 && trendingUp && consistent) return "Elite";
  if (workoutCount >= 30 && consistent) return "Advanced";
  if (workoutCount >= 10) return "Intermediate";
  return "Beginner";
}
