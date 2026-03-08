"use client";

import { useReducer, useCallback, useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ExerciseCard } from "./exercise-card";
import { ExercisePicker } from "./exercise-picker";
import {
  startWorkout,
  addSet,
  updateSet,
  deleteSet,
  completeWorkout,
  getExerciseHistory,
} from "@/lib/actions/workouts";
import { getWorkoutDate } from "@/lib/utils/workout-date";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { WorkoutData } from "@/app/dashboard/workout/page";
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
  | { type: "UPDATE_EXERCISE"; exercise: Exercise }
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
          sets: e.sets
            .filter((s) => s.id !== action.setId)
            .map((s, i) => ({ ...s, set_number: i + 1 })),
        })),
      };
    case "UPDATE_EXERCISE":
      return {
        ...state,
        exercises: state.exercises.map((e) =>
          e.exercise.id === action.exercise.id
            ? { ...e, exercise: action.exercise }
            : e,
        ),
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
  fetchWorkoutData: (
    workoutDate: string,
    planDayId?: string,
  ) => Promise<WorkoutData>;
  planId?: string;
  dayName?: string;
  planDayId?: string;
}

export function WorkoutPageClient({
  fetchWorkoutData,
  planId,
  dayName,
  planDayId,
}: WorkoutPageClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const [state, dispatch] = useReducer(workoutReducer, {
    log: null,
    exercises: [],
    errorSetIds: new Set<string>(),
  });

  const exercisesRef = useRef(state.exercises);
  exercisesRef.current = state.exercises;

  // Cleanup debounce timers on unmount
  useEffect(() => {
    const timers = debounceTimers.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // Fetch workout data using client-side date, then initialize workout log
  useEffect(() => {
    const workoutDate = getWorkoutDate();

    fetchWorkoutData(workoutDate, planDayId).then(async (data) => {
      const { existingWorkout, planExercises } = data;

      if (existingWorkout) {
        dispatch({ type: "SET_LOG", log: existingWorkout });
        dispatch({ type: "SET_EXERCISES", exercises: existingWorkout.exercises });
        setLoading(false);
      } else {
        // Set plan exercises if available
        if (planExercises && planExercises.length > 0) {
          dispatch({
            type: "SET_EXERCISES",
            exercises: planExercises.map((ex) => ({ exercise: ex, sets: [] })),
          });
        }

        // Create the workout log
        const result = await startWorkout(workoutDate, planId, dayName);
        if (result.success && result.data) {
          dispatch({ type: "SET_LOG", log: result.data as WorkoutLog });
        } else {
          toast.error("Failed to start workout");
        }
        setLoading(false);
      }
    }).catch(() => {
      toast.error("Failed to load workout data");
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddSet = useCallback(
    async (exerciseId: string, defaultWeight?: number, defaultReps?: number) => {
      if (!state.log) return;

      const exerciseEntry = exercisesRef.current.find(
        (e) => e.exercise.id === exerciseId,
      );
      const setNumber = (exerciseEntry?.sets.length ?? 0) + 1;
      const lastSet = exerciseEntry?.sets.at(-1);
      const weight = defaultWeight ?? lastSet?.weight ?? 0;
      const reps = defaultReps ?? lastSet?.reps ?? 1;

      // Optimistic: create a temp set
      const tempId = `temp-${Date.now()}-${setNumber}`;
      const tempSet: WorkoutSet = {
        id: tempId,
        workout_log_id: state.log.id,
        user_id: state.log.user_id,
        exercise_id: exerciseId,
        set_number: setNumber,
        weight,
        reps,
        is_warmup: false,
        is_completed: false,
        created_at: new Date().toISOString(),
      };

      dispatch({ type: "ADD_SET", exerciseId, set: tempSet });

      const result = await addSet(
        state.log.id,
        exerciseId,
        setNumber,
        weight,
        reps,
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
    [state.log],
  );

  const handleAddExercise = useCallback(
    async (exercise: Exercise) => {
      if (!state.log) return;
      dispatch({ type: "ADD_EXERCISE", exercise });

      // Fetch history and auto-populate sets
      const history = await getExerciseHistory(exercise.id);
      if (history.length === 0) return;

      const now = Date.now();
      const tempSets = history.map((h, i) => {
        const setNumber = i + 1;
        const tempId = `temp-${now}-${setNumber}`;
        const tempSet: WorkoutSet = {
          id: tempId,
          workout_log_id: state.log!.id,
          user_id: state.log!.user_id,
          exercise_id: exercise.id,
          set_number: setNumber,
          weight: h.weight,
          reps: h.reps,
          is_warmup: h.is_warmup,
          is_completed: false,
          created_at: new Date().toISOString(),
        };
        dispatch({ type: "ADD_SET", exerciseId: exercise.id, set: tempSet });
        return { tempId, h, setNumber };
      });

      // Fire all server calls in parallel
      const results = await Promise.all(
        tempSets.map(({ h, setNumber }) =>
          addSet(state.log!.id, exercise.id, setNumber, h.weight, h.reps, h.is_warmup),
        ),
      );

      results.forEach((result, i) => {
        const { tempId } = tempSets[i];
        if (result.success && result.data) {
          dispatch({
            type: "UPDATE_SET",
            setId: tempId,
            updates: { id: (result.data as WorkoutSet).id },
          });
        } else {
          dispatch({ type: "DELETE_SET", setId: tempId });
          toast.error("Failed to add set");
        }
      });
    },
    [state.log],
  );

  const handleRemoveExercise = useCallback(
    async (exerciseId: string) => {
      const entry = state.exercises.find((e) => e.exercise.id === exerciseId);
      if (!entry) return;

      // Snapshot for revert
      const snapshotExercise = entry.exercise;
      const snapshotSets = [...entry.sets];

      // Optimistic remove
      dispatch({ type: "REMOVE_EXERCISE", exerciseId });

      // Delete all sets from DB in background
      const realSetIds = entry.sets
        .map((s) => s.id)
        .filter((id) => !id.startsWith("temp-"));
      const results = await Promise.all(realSetIds.map((id) => deleteSet(id)));
      const failed = results.some((r) => !r.success);
      if (failed) {
        // Restore exercise and its sets
        dispatch({ type: "ADD_EXERCISE", exercise: snapshotExercise });
        for (const s of snapshotSets) {
          dispatch({ type: "ADD_SET", exerciseId: snapshotExercise.id, set: s });
        }
        toast.error("Some sets failed to delete");
      }
    },
    [state.exercises],
  );

  const handleUpdateField = useCallback(
    (setId: string, field: "weight" | "reps", value: number) => {
      dispatch({ type: "UPDATE_SET", setId, updates: { [field]: value } });

      if (setId.startsWith("temp-")) return;

      const key = `${field}-${setId}`;
      const existing = debounceTimers.current.get(key);
      if (existing) clearTimeout(existing);

      const serverValue = field === "reps" ? (value || 1) : value;
      debounceTimers.current.set(
        key,
        setTimeout(async () => {
          debounceTimers.current.delete(key);
          const result = await updateSet(setId, { [field]: serverValue });
          if (!result.success) {
            dispatch({ type: "SET_ERROR", setId });
            toast.error(`Failed to save ${field}`);
            setTimeout(() => dispatch({ type: "CLEAR_ERROR", setId }), 2000);
          }
        }, 500),
      );
    },
    [],
  );

  const handleUpdateWeight = useCallback(
    (setId: string, weight: number) => handleUpdateField(setId, "weight", weight),
    [handleUpdateField],
  );

  const handleUpdateReps = useCallback(
    (setId: string, reps: number) => handleUpdateField(setId, "reps", reps),
    [handleUpdateField],
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

  const handleLockExercise = useCallback(
    async (exerciseId: string) => {
      const entry = state.exercises.find((e) => e.exercise.id === exerciseId);
      if (!entry || entry.sets.length === 0) return;

      const allCompleted = entry.sets.every((s) => s.is_completed);
      const newCompleted = !allCompleted;

      // Optimistic: update all sets
      for (const s of entry.sets) {
        dispatch({
          type: "UPDATE_SET",
          setId: s.id,
          updates: { is_completed: newCompleted },
        });
      }

      // Server: update real sets
      const realSets = entry.sets.filter((s) => !s.id.startsWith("temp-"));
      const results = await Promise.all(
        realSets.map((s) => updateSet(s.id, { is_completed: newCompleted })),
      );

      if (results.some((r) => !r.success)) {
        // Revert all sets
        for (const s of entry.sets) {
          dispatch({
            type: "UPDATE_SET",
            setId: s.id,
            updates: { is_completed: !newCompleted },
          });
        }
        toast.error("Failed to update completion");
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

  const finishWorkout = async () => {
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

  const handleDone = () => {
    const totalSets = state.exercises.reduce((sum, e) => sum + e.sets.length, 0);
    if (totalSets === 0) {
      setShowEmptyConfirm(true);
      return;
    }
    finishWorkout();
  };

  const workoutDate = getWorkoutDate();
  const formattedDate = new Date(workoutDate + "T00:00:00").toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric" },
  );

  const sortedExercises = useMemo(() => {
    const incomplete: (ExerciseWithSets & { isLocked: boolean })[] = [];
    const completed: (ExerciseWithSets & { isLocked: boolean })[] = [];
    for (const entry of state.exercises) {
      const isLocked = entry.sets.length > 0 && entry.sets.every((s) => s.is_completed);
      if (isLocked) {
        completed.push({ ...entry, isLocked });
      } else {
        incomplete.push({ ...entry, isLocked });
      }
    }
    return [...incomplete, ...completed];
  }, [state.exercises]);

  const subtitle = dayName
    ? `${dayName} — ${formattedDate}`
    : `Freestyle Workout — ${formattedDate}`;

  if (loading) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-4 md:gap-5 p-5">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-48 animate-pulse rounded-md bg-fp-bg-card" />
            <div className="h-4 w-36 animate-pulse rounded-md bg-fp-bg-card" />
          </div>
          <div className="h-11 w-20 animate-pulse rounded-md bg-fp-bg-card" />
        </div>
        {/* Card skeletons */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl bg-fp-bg-card"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 md:gap-5 p-5">
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
          className="h-11 rounded-md bg-fp-accent px-4 font-manrope text-sm font-semibold text-fp-text-on-accent disabled:opacity-60"
        >
          {completing ? "Completing..." : "Done"}
        </button>
      </div>

      {/* Exercise Cards */}
      {sortedExercises.map((entry) => (
          <ExerciseCard
            key={entry.exercise.id}
            exercise={entry.exercise}
            sets={entry.sets}
            errorSetIds={state.errorSetIds}
            isLocked={entry.isLocked}
            onAddSet={() => handleAddSet(entry.exercise.id)}
            onUpdateWeight={handleUpdateWeight}
            onUpdateReps={handleUpdateReps}
            onToggleWarmup={handleToggleWarmup}
            onLockExercise={() => handleLockExercise(entry.exercise.id)}
            onDeleteSet={handleDeleteSet}
            onRemoveExercise={() => handleRemoveExercise(entry.exercise.id)}
            onExerciseUpdate={(ex) => dispatch({ type: "UPDATE_EXERCISE", exercise: ex })}
          />
      ))}

      {/* Add Exercise */}
      <button
        onClick={() => setPickerOpen(true)}
        className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-fp-border-muted text-sm font-medium text-fp-text-tertiary hover:bg-fp-bg-card"
      >
        <Plus className="h-4 w-4" />
        Add Exercise
      </button>

      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddExercise}
        excludeIds={state.exercises.map((e) => e.exercise.id)}
      />

      <AlertDialog open={showEmptyConfirm} onOpenChange={setShowEmptyConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Empty Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              You haven&apos;t logged any sets yet. Are you sure you want to finish?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Working Out</AlertDialogCancel>
            <AlertDialogAction onClick={finishWorkout}>
              Finish Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
