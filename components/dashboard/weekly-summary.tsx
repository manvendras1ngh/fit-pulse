import { Check, X, Minus } from "lucide-react";
import type { WorkoutLog } from "@/lib/types";

interface WeeklySummaryProps {
  recentWorkouts: WorkoutLog[];
  workoutsThisWeek: number;
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function WeeklySummary({
  recentWorkouts,
  workoutsThisWeek,
}: WeeklySummaryProps) {
  const today = new Date();
  const todayDay = today.getDay();

  // Build a set of days-of-week that have workouts this week
  // Parse dates as local time by using "/" separator instead of "-"
  const workedOutDays = new Set<number>();
  for (const log of recentWorkouts) {
    const logDate = new Date(log.workout_date.replace(/-/g, "/"));
    const dayDiff = Math.floor(
      (today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (dayDiff >= 0 && dayDiff < 7) {
      workedOutDays.add(logDate.getDay());
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="font-space-mono text-[13px] font-medium text-fp-text-tertiary">
          This Week
        </p>
        <p className="font-space-mono text-[13px] font-medium text-fp-text-tertiary">
          {workoutsThisWeek}/6
        </p>
      </div>
      <div className="flex items-center justify-around">
        {DAY_LABELS.map((label, i) => {
          const isPast = i < todayDay;
          const isToday = i === todayDay;
          const isFuture = i > todayDay;
          const workedOut = workedOutDays.has(i);

          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  workedOut
                    ? "border-fp-accent bg-fp-accent/10"
                    : isToday
                      ? "border-fp-accent"
                      : isPast
                        ? "border-fp-border-muted"
                        : "border-fp-border"
                }`}
              >
                {workedOut ? (
                  <Check className="h-4 w-4 text-fp-accent" />
                ) : isPast ? (
                  <X className="h-3 w-3 text-fp-text-tertiary" />
                ) : isFuture ? (
                  <Minus className="h-3 w-3 text-fp-border" />
                ) : null}
              </div>
              <span className="text-[10px] text-fp-text-tertiary">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
