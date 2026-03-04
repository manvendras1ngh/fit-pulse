import { TrendingUp } from "lucide-react";

export function NotEnoughData({ workoutCount }: { workoutCount: number }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-fp-border bg-fp-bg-card p-8">
      <TrendingUp className="h-10 w-10 text-fp-text-tertiary" />
      <p className="text-center font-manrope text-sm text-fp-text-secondary">
        Log <span className="font-semibold text-fp-accent">{7 - workoutCount} more</span> workouts
        to unlock progress charts
      </p>
      <p className="text-xs text-fp-text-tertiary">
        {workoutCount}/7 workouts logged
      </p>
    </div>
  );
}
