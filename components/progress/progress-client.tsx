"use client";

import { useState, useEffect, useMemo } from "react";
import { VolumeChart } from "./volume-chart";
import { ExerciseProgressChart } from "./exercise-progress-chart";
import { ExerciseSelector } from "./exercise-selector";
import { NotEnoughData } from "./not-enough-data";
import { useUnit } from "@/lib/contexts/unit-context";
import type { Exercise } from "@/lib/types";

interface ProgressClientProps {
  workoutCount: number;
  exercises: Exercise[];
  volumeData: { date: string; volume: number }[];
  totalVolume: number;
  totalSessions: number;
  fetchExerciseProgress: (
    exerciseId: string,
  ) => Promise<{ date: string; estimated1RM: number }[]>;
}

export function ProgressClient({
  workoutCount,
  exercises,
  volumeData,
  totalVolume,
  totalSessions,
  fetchExerciseProgress,
}: ProgressClientProps) {
  const { unitLabel, toDisplayWeight } = useUnit();
  const [tab, setTab] = useState<"volume" | "exercise">("volume");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    exercises[0]?.id ?? null,
  );
  const [exerciseData, setExerciseData] = useState<
    { date: string; estimated1RM: number }[]
  >([]);

  const displayVolumeData = useMemo(
    () => volumeData.map((d) => ({ ...d, volume: toDisplayWeight(d.volume) })),
    [volumeData, toDisplayWeight],
  );

  const displayExerciseData = useMemo(
    () => exerciseData.map((d) => ({ ...d, estimated1RM: toDisplayWeight(d.estimated1RM) })),
    [exerciseData, toDisplayWeight],
  );

  useEffect(() => {
    if (tab !== "exercise" || !selectedExerciseId) return;
    let cancelled = false;
    fetchExerciseProgress(selectedExerciseId).then((data) => {
      if (!cancelled) setExerciseData(data);
    });
    return () => { cancelled = true; };
  }, [tab, selectedExerciseId, fetchExerciseProgress]);

  if (workoutCount < 7) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-6 p-5">
        <h1 className="font-space-grotesk text-2xl font-bold text-fp-text-primary">
          Progress
        </h1>
        <NotEnoughData workoutCount={workoutCount} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-5">
      <h1 className="font-space-grotesk text-2xl font-bold text-fp-text-primary">
        Progress
      </h1>

      {/* Tab Toggle */}
      <div className="flex h-10 items-center rounded-[10px] bg-fp-bg-card p-1">
        <button
          onClick={() => setTab("volume")}
          className={`flex-1 rounded-lg py-1.5 text-center text-sm font-medium transition-colors ${
            tab === "volume"
              ? "bg-fp-bg-elevated text-fp-text-primary"
              : "text-fp-text-tertiary"
          }`}
        >
          Volume
        </button>
        <button
          onClick={() => setTab("exercise")}
          className={`flex-1 rounded-lg py-1.5 text-center text-sm font-medium transition-colors ${
            tab === "exercise"
              ? "bg-fp-bg-elevated text-fp-text-primary"
              : "text-fp-text-tertiary"
          }`}
        >
          Exercise
        </button>
      </div>

      {tab === "volume" ? (
        <>
          <VolumeChart data={displayVolumeData} unitLabel={unitLabel} />
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-fp-border bg-fp-bg-card p-4">
              <p className="font-space-grotesk text-2xl font-bold text-fp-text-primary">
                {Math.round(toDisplayWeight(totalVolume)).toLocaleString()}
              </p>
              <p className="text-xs text-fp-text-tertiary">Total {unitLabel}</p>
            </div>
            <div className="rounded-xl border border-fp-border bg-fp-bg-card p-4">
              <p className="font-space-grotesk text-2xl font-bold text-fp-text-primary">
                {totalSessions}
              </p>
              <p className="text-xs text-fp-text-tertiary">Sessions</p>
            </div>
          </div>
        </>
      ) : (
        <>
          {exercises.length === 0 ? (
            <div className="rounded-xl border border-fp-border bg-fp-bg-card p-6 text-center">
              <p className="text-sm text-fp-text-tertiary">
                Log some exercises to see progress
              </p>
            </div>
          ) : (
            <>
              <ExerciseSelector
                exercises={exercises}
                selectedId={selectedExerciseId}
                onSelect={(id) => setSelectedExerciseId(id)}
              />
              <ExerciseProgressChart data={displayExerciseData} />
            </>
          )}
        </>
      )}
    </div>
  );
}
