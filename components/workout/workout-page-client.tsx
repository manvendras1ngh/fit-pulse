"use client";

import { useReducer, useCallback, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ExerciseCard } from "./exercise-card";
import { ExercisePicker } from "./exercise-picker";
import {
  startWorkout,
  addSet,
  updateSet,
  deleteSet,
  completeWorkout,
} from "@/lib/actions/workouts";
import { getWorkoutDate } from "@/lib/utils/workout-date";
import { toast } from "sonner";
import type { Exercise, WorkoutLog, WorkoutSet } from "@/lib/types";

interface ExerciseWithSets {
  exercise: Exercise;
  sets: WorkoutSet[];
}

interface WorkoutState {
  log: WorkoutLog | null;
  exercises: ExerciseWithSets[];
  errorSetIds: Set<string>;
}

type WorkoutAction =
  | { type: "SET_LOG"; log: WorkoutLog }
  | { type: "SET_EXERCISES"; exercises: ExerciseWithSets[] }
  | { type: "ADD_EXERCISE"; exercise: Exercise }
  | { type: "REMOVE_EXERCISE"; exerciseId: string }
  | { type: "ADD_SET"; exerciseId: string; set: WorkoutSet }
  | { type: "INSERT_SET_AT"; exerciseId: string; set: WorkoutSet; index: number }
  | { type: "UPDATE_SET"; setId: string; updates: Partial<WorkoutSet> }
  | { type: "DELETE_SET"; setId: string }
  | { type: "SET_ERROR"; setId: string }
  | { type: "CLEAR_ERROR"; setId: string };

function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
  switch (action.type) {
    case "SET_LOG":
      return { ...state, log: action.log };
    case "SET_EXERCISES":
      return { ...state, exercises: action.exercises };
    case "ADD_EXERCISE":
      return {
        ...state,
        exercises: [
          ...state.exercises,
          { exercise: action.exercise, sets: [] },
        ],
      };
    case "REMOVE_EXERCISE":
      return {
        ...state,
        exercises: state.exercises.filter(
          (e) => e.exercise.id !== action.exerciseId,
        ),
      };
    case "ADD_SET": {
      return {
        ...state,
        exercises: state.exercises.map((e) =>
          e.exercise.id === action.exerciseId
            ? { ...e, sets: [...e.sets, action.set] }
            : e,
        ),
      };
    }
    case "INSERT_SET_AT": {
      return {
        ...state,
        exercises: state.exercises.map((e) =>
          e.exercise.id === action.exerciseId
            ? {
                ...e,
                sets: [
                  ...e.sets.slice(0, action.index),
                  action.set,
                  ...e.sets.slice(action.index),
                ],
              }
            : e,
        ),
      };
    }
    case "UPDATE_SET":
      return {
        ...state,
        exercises: state.exercises.map((e) => ({
          ...e,
          sets: e.sets.map((s) =>
            s.id === action.setId ? { ...s, ...action.updates } : s,
          ),
        })),
      };
    case "DELETE_SET":
      return {
        ...state,
        exercises: state.exercises.map((e) => ({
          ...e,
          sets: e.sets.filter((s) => s.id !== action.setId),
        })),
      };
    case "SET_ERROR": {
      const newErrors = new Set(state.errorSetIds);
      newErrors.add(action.setId);
      return { ...state, errorSetIds: newErrors };
    }
    case "CLEAR_ERROR": {
      const newErrors = new Set(state.errorSetIds);
      newErrors.delete(action.setId);
      return { ...state, errorSetIds: newErrors };
    }
    default:
      return state;
  }
}

interface WorkoutPageClientProps {
  existingWorkout:
    | (WorkoutLog & { exercises: ExerciseWithSets[] })
    | null;
  planId?: string;
  dayName?: string;
  planExercises?: Exercise[];
}

export function WorkoutPageClient({
  existingWorkout,
  planId,
  dayName,
  planExercises,
}: WorkoutPageClientProps) {
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const initialExercises = existingWorkout?.exercises ??
    (planExercises?.map((ex) => ({ exercise: ex, sets: [] })) ?? []);

  const [state, dispatch] = useReducer(workoutReducer, {
    log: existingWorkout ?? null,
    exercises: initialExercises,
    errorSetIds: new Set<string>(),
  });

  // Initialize workout log if needed
  useEffect(() => {
    if (!state.log) {
      const workoutDate = getWorkoutDate();
      startWorkout(workoutDate, planId, dayName).then((result) => {
        if (result.success && result.data) {
          dispatch({ type: "SET_LOG", log: result.data as WorkoutLog });
        } else {
          toast.error("Failed to start workout");
        }
      });
    }
  }, [state.log, planId, dayName]);

  const handleAddExercise = useCallback(
    (exercise: Exercise) => {
      dispatch({ type: "ADD_EXERCISE", exercise });
    },
    [],
  );

  const handleRemoveExercise = useCallback(
    async (exerciseId: string) => {
      const entry = state.exercises.find((e) => e.exercise.id === exerciseId);
      if (!entry) return;

      // Optimistic remove
      dispatch({ type: "REMOVE_EXERCISE", exerciseId });

      // Delete all sets from DB in background
      const realSetIds = entry.sets
        .map((s) => s.id)
        .filter((id) => !id.startsWith("temp-"));
      const results = await Promise.all(realSetIds.map((id) => deleteSet(id)));
      const failed = results.some((r) => !r.success);
      if (failed) {
        toast.error("Some sets failed to delete");
      }
    },
    [state.exercises],
  );

  const handleAddSet = useCallback(
    async (exerciseId: string) => {
      if (!state.log) return;

      const exerciseEntry = state.exercises.find(
        (e) => e.exercise.id === exerciseId,
      );
      const setNumber = (exerciseEntry?.sets.length ?? 0) + 1;

      // Optimistic: create a temp set
      const tempId = `temp-${Date.now()}`;
      const tempSet: WorkoutSet = {
        id: tempId,
        workout_log_id: state.log.id,
        user_id: state.log.user_id,
        exercise_id: exerciseId,
        set_number: setNumber,
        weight: 0,
        reps: 1,
        is_warmup: false,
        created_at: new Date().toISOString(),
      };

      dispatch({ type: "ADD_SET", exerciseId, set: tempSet });

      const result = await addSet(
        state.log.id,
        exerciseId,
        setNumber,
        0,
        1, // Default 1 rep to satisfy DB constraint
      );

      if (result.success && result.data) {
        // Replace temp with real
        dispatch({
          type: "UPDATE_SET",
          setId: tempId,
          updates: {
            id: (result.data as WorkoutSet).id,
          },
        });
      } else {
        dispatch({ type: "DELETE_SET", setId: tempId });
        toast.error("Failed to add set");
      }
    },
    [state.log, state.exercises],
  );

  const handleUpdateWeight = useCallback(
    (setId: string, weight: number) => {
      dispatch({ type: "UPDATE_SET", setId, updates: { weight } });

      if (setId.startsWith("temp-")) return;

      const key = `weight-${setId}`;
      const existing = debounceTimers.current.get(key);
      if (existing) clearTimeout(existing);

      debounceTimers.current.set(
        key,
        setTimeout(async () => {
          debounceTimers.current.delete(key);
          const result = await updateSet(setId, { weight });
          if (!result.success) {
            dispatch({ type: "SET_ERROR", setId });
            toast.error("Failed to save weight");
            setTimeout(() => dispatch({ type: "CLEAR_ERROR", setId }), 2000);
          }
        }, 500),
      );
    },
    [],
  );

  const handleUpdateReps = useCallback(
    (setId: string, reps: number) => {
      dispatch({ type: "UPDATE_SET", setId, updates: { reps } });

      if (setId.startsWith("temp-")) return;

      const key = `reps-${setId}`;
      const existing = debounceTimers.current.get(key);
      if (existing) clearTimeout(existing);

      debounceTimers.current.set(
        key,
        setTimeout(async () => {
          debounceTimers.current.delete(key);
          const result = await updateSet(setId, { reps: reps || 1 });
          if (!result.success) {
            dispatch({ type: "SET_ERROR", setId });
            toast.error("Failed to save reps");
            setTimeout(() => dispatch({ type: "CLEAR_ERROR", setId }), 2000);
          }
        }, 500),
      );
    },
    [],
  );

  const handleToggleWarmup = useCallback(
    async (setId: string) => {
      const currentSet = state.exercises
        .flatMap((e) => e.sets)
        .find((s) => s.id === setId);
      if (!currentSet) return;

      const newWarmup = !currentSet.is_warmup;
      dispatch({
        type: "UPDATE_SET",
        setId,
        updates: { is_warmup: newWarmup },
      });

      if (setId.startsWith("temp-")) return;

      const result = await updateSet(setId, { is_warmup: newWarmup });
      if (!result.success) {
        dispatch({
          type: "UPDATE_SET",
          setId,
          updates: { is_warmup: !newWarmup },
        });
        toast.error("Failed to update warmup");
      }
    },
    [state.exercises],
  );

  const handleDeleteSet = useCallback(
    async (setId: string) => {
      const exerciseEntry = state.exercises.find((e) =>
        e.sets.some((s) => s.id === setId),
      );
      const deletedSet = exerciseEntry?.sets.find((s) => s.id === setId);
      const deletedIndex = exerciseEntry?.sets.findIndex((s) => s.id === setId) ?? -1;

      dispatch({ type: "DELETE_SET", setId });

      if (setId.startsWith("temp-") || !deletedSet) return;

      const result = await deleteSet(setId);
      if (!result.success) {
        if (exerciseEntry && deletedSet) {
          dispatch({
            type: "INSERT_SET_AT",
            exerciseId: exerciseEntry.exercise.id,
            set: deletedSet,
            index: deletedIndex,
          });
        }
        toast.error("Failed to delete set");
      }
    },
    [state.exercises],
  );

  const handleDone = async () => {
    if (!state.log || completing) return;
    setCompleting(true);
    try {
      const result = await completeWorkout(state.log.id);
      if (!result.success) {
        toast.error("Failed to complete workout");
        setCompleting(false);
        return;
      }
      router.push("/dashboard");
    } catch {
      toast.error("Failed to complete workout");
      setCompleting(false);
    }
  };

  const workoutDate = getWorkoutDate();
  const formattedDate = new Date(workoutDate + "T00:00:00").toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric" },
  );

  const subtitle = dayName
    ? `${dayName} — ${formattedDate}`
    : `Freestyle Workout — ${formattedDate}`;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-space-grotesk text-2xl font-bold text-fp-text-primary">
            Today&apos;s Workout
          </h1>
          <p className="mt-0.5 text-sm text-fp-text-tertiary">{subtitle}</p>
        </div>
        <button
          onClick={handleDone}
          disabled={completing}
          className="rounded-full bg-fp-accent px-4 py-1.5 font-manrope text-sm font-semibold text-fp-text-on-accent disabled:opacity-60"
        >
          {completing ? "Completing..." : "Done"}
        </button>
      </div>

      {/* Exercise Cards */}
      {state.exercises.map((entry) => (
        <ExerciseCard
          key={entry.exercise.id}
          exercise={entry.exercise}
          sets={entry.sets}
          errorSetIds={state.errorSetIds}
          onAddSet={() => handleAddSet(entry.exercise.id)}
          onUpdateWeight={handleUpdateWeight}
          onUpdateReps={handleUpdateReps}
          onToggleWarmup={handleToggleWarmup}
          onDeleteSet={handleDeleteSet}
          onRemoveExercise={() => handleRemoveExercise(entry.exercise.id)}
        />
      ))}

      {/* Add Exercise */}
      <button
        onClick={() => setPickerOpen(true)}
        className="flex h-11 w-full items-center justify-center rounded-xl border border-fp-border-muted text-sm font-medium text-fp-text-secondary hover:bg-fp-bg-card"
      >
        + Add Exercise
      </button>

      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddExercise}
        excludeIds={state.exercises.map((e) => e.exercise.id)}
      />
    </div>
  );
}
