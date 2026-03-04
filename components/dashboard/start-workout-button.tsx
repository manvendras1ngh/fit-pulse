"use client";

import { useRouter } from "next/navigation";

interface StartWorkoutButtonProps {
  hasExistingWorkout: boolean;
  planId?: string;
  dayName?: string;
  planDayId?: string;
}

export function StartWorkoutButton({
  hasExistingWorkout,
  planId,
  dayName,
  planDayId,
}: StartWorkoutButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    const params = new URLSearchParams();
    if (planId) params.set("planId", planId);
    if (dayName) params.set("dayName", dayName);
    if (planDayId) params.set("planDayId", planDayId);
    const query = params.toString();
    router.push(`/dashboard/workout${query ? `?${query}` : ""}`);
  };

  return (
    <button
      onClick={handleClick}
      className="flex h-11 w-full items-center justify-center rounded-[10px] bg-fp-accent font-manrope text-[15px] font-bold text-fp-text-on-accent transition-opacity hover:opacity-90"
    >
      {hasExistingWorkout ? "Continue Workout" : "Start Workout"}
    </button>
  );
}
