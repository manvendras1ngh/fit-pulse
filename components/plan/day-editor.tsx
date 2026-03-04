"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, ChevronUp, X } from "lucide-react";
import { ExercisePicker } from "@/components/workout/exercise-picker";
import type { Exercise } from "@/lib/types";

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

interface DayEditorProps {
  dayOfWeek: number;
  name: string;
  exercises: Exercise[];
  onNameChange: (name: string) => void;
  onAddExercise: (exercise: Exercise) => void;
  onRemoveExercise: (index: number) => void;
  onMoveExercise: (fromIndex: number, toIndex: number) => void;
}

export function DayEditor({
  dayOfWeek,
  name,
  exercises,
  onNameChange,
  onAddExercise,
  onRemoveExercise,
  onMoveExercise,
}: DayEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const isRestDay = !name || name.toLowerCase() === "rest day";
  const dayLabel = DAY_LABELS[dayOfWeek];

  return (
    <div className="rounded-xl border border-fp-border bg-fp-bg-card">
      {/* Day Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <span
            className={`font-space-mono text-[11px] font-semibold ${
              isRestDay ? "text-fp-text-tertiary" : "text-fp-accent"
            }`}
          >
            {dayLabel}
          </span>
          {isRestDay ? (
            <span className="text-sm text-fp-text-tertiary">Rest Day</span>
          ) : (
            <span className="text-sm font-medium text-fp-text-primary">
              {name}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-fp-text-tertiary" />
        ) : (
          <ChevronRight className="h-4 w-4 text-fp-text-tertiary" />
        )}
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-fp-border px-4 py-3">
          <div className="flex flex-col gap-3">
            {/* Day Name Input */}
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Day name (e.g. Push Day)"
              className="h-9 w-full rounded-lg bg-fp-bg-elevated px-3 text-sm text-fp-text-primary outline-none placeholder:text-fp-text-tertiary focus:ring-1 focus:ring-fp-accent"
            />

            {/* Exercise List */}
            {exercises.map((ex, i) => (
              <div
                key={`${ex.id}-${i}`}
                className="flex items-center justify-between rounded-lg bg-fp-bg-elevated px-3 py-2"
              >
                <span className="text-sm text-fp-text-secondary">
                  {ex.name}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onMoveExercise(i, i - 1)}
                    disabled={i === 0}
                    className="p-0.5 disabled:opacity-30"
                  >
                    <ChevronUp className="h-3.5 w-3.5 text-fp-text-tertiary hover:text-fp-text-primary" />
                  </button>
                  <button
                    onClick={() => onMoveExercise(i, i + 1)}
                    disabled={i === exercises.length - 1}
                    className="p-0.5 disabled:opacity-30"
                  >
                    <ChevronDown className="h-3.5 w-3.5 text-fp-text-tertiary hover:text-fp-text-primary" />
                  </button>
                  <button
                    onClick={() => onRemoveExercise(i)}
                    className="p-0.5"
                  >
                    <X className="h-3.5 w-3.5 text-fp-text-tertiary hover:text-red-400" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add Exercise */}
            <button
              onClick={() => setPickerOpen(true)}
              className="text-left text-[13px] font-semibold text-fp-accent hover:opacity-80"
            >
              + Add Exercise
            </button>
          </div>

          <ExercisePicker
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onSelect={(exercise) => {
              onAddExercise(exercise);
              setPickerOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
