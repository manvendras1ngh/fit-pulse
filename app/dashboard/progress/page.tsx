import { ProgressClient } from "@/components/progress/progress-client";
import { getWorkoutCount, getVolumeOverTime, getExerciseProgress } from "@/lib/queries/progress";
import { getExercises } from "@/lib/queries/exercises";

async function fetchExerciseProgressAction(exerciseId: string) {
  "use server";
  return getExerciseProgress(exerciseId);
}

export default async function ProgressPage() {
  const [workoutCount, volumeData, exercises] = await Promise.all([
    getWorkoutCount(),
    getVolumeOverTime(8),
    getExercises(),
  ]);

  const totalVolume = volumeData.reduce((sum, d) => sum + d.volume, 0);

  return (
    <ProgressClient
      workoutCount={workoutCount}
      exercises={exercises}
      volumeData={volumeData}
      totalVolume={Math.round(totalVolume)}
      totalSessions={workoutCount}
      fetchExerciseProgress={fetchExerciseProgressAction}
    />
  );
}
