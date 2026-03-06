// ============================================================
// FitPulse: Application Types
// ============================================================

export type UnitPreference = "kg" | "lbs";

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "legs"
  | "core"
  | "full_body"
  | "cardio";

export type ExerciseType = "strength" | "cardio";

// ---- Row types (matching DB schema) ----

export interface Profile {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  preferred_unit: UnitPreference;
  created_at: string;
}

export interface Exercise {
  id: string;
  user_id: string | null;
  name: string;
  muscle_group: MuscleGroup | null;
  type: ExerciseType;
  is_deleted: boolean;
  created_at: string;
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface WorkoutPlanDay {
  id: string;
  plan_id: string;
  day_of_week: number;
  name: string;
}

export interface PlanDayExercise {
  id: string;
  plan_day_id: string;
  exercise_id: string;
  position: number;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  plan_id: string | null;
  workout_date: string;
  day_name: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface WorkoutSet {
  id: string;
  workout_log_id: string;
  user_id: string;
  exercise_id: string;
  set_number: number;
  weight: number;
  reps: number;
  is_warmup: boolean;
  is_completed: boolean;
  created_at: string;
}

// ---- Derived / Composite types ----

export interface WorkoutLogWithSets extends WorkoutLog {
  exercises: {
    exercise: Exercise;
    sets: WorkoutSet[];
  }[];
}

export interface PlanWithDays extends WorkoutPlan {
  days: (WorkoutPlanDay & {
    exercises: (PlanDayExercise & { exercise: Exercise })[];
  })[];
}

export interface WeeklySummary {
  workoutsThisWeek: number;
  totalVolume: number;
  totalSets: number;
}

export interface BestLift {
  exercise: Exercise;
  weight: number;
  reps: number;
}

// ---- Supabase Database type ----
// Matches the shape @supabase/supabase-js expects.
// Will be replaced by `supabase gen types` output when local Supabase is running.

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          name?: string | null;
          email: string;
          avatar_url?: string | null;
          preferred_unit?: UnitPreference;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string;
          avatar_url?: string | null;
          preferred_unit?: UnitPreference;
          created_at?: string;
        };
        Relationships: [];
      };
      exercises: {
        Row: Exercise;
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          muscle_group?: MuscleGroup | null;
          type?: ExerciseType;
          is_deleted?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          muscle_group?: MuscleGroup | null;
          type?: ExerciseType;
          is_deleted?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      workout_plans: {
        Row: WorkoutPlan;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      workout_plan_days: {
        Row: WorkoutPlanDay;
        Insert: {
          id?: string;
          plan_id: string;
          day_of_week: number;
          name: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          day_of_week?: number;
          name?: string;
        };
        Relationships: [];
      };
      plan_day_exercises: {
        Row: PlanDayExercise;
        Insert: {
          id?: string;
          plan_day_id: string;
          exercise_id: string;
          position: number;
        };
        Update: {
          id?: string;
          plan_day_id?: string;
          exercise_id?: string;
          position?: number;
        };
        Relationships: [];
      };
      workout_logs: {
        Row: WorkoutLog;
        Insert: {
          id?: string;
          user_id: string;
          plan_id?: string | null;
          workout_date: string;
          day_name?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string | null;
          workout_date?: string;
          day_name?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      workout_sets: {
        Row: WorkoutSet;
        Insert: {
          id?: string;
          workout_log_id: string;
          user_id: string;
          exercise_id: string;
          set_number: number;
          weight: number;
          reps: number;
          is_warmup?: boolean;
          is_completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          workout_log_id?: string;
          user_id?: string;
          exercise_id?: string;
          set_number?: number;
          weight?: number;
          reps?: number;
          is_warmup?: boolean;
          is_completed?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      unit_preference: UnitPreference;
    };
    CompositeTypes: Record<string, never>;
  };
}
