import { Workout, WorkoutExercise } from "@/types/workout.types";

/**
 * Calculates the estimated duration of a workout in minutes.
 * 
 * Logic:
 * - Each set takes approximately 45 seconds to perform.
 * - Rest time is added after each set (except the last set of an exercise, usually, but let's simplify).
 * - Transition time between exercises is approximately 2 minutes.
 * 
 * @param workout The workout object containing exercises and their configuration
 * @returns Estimated duration in minutes
 */
export function calculateWorkoutDuration(workout: any | null | undefined): number {
  if (!workout) {
    return 0;
  }

  // Handle different property names for exercises array (e.g. Supabase returns workout_exercises)
  const exercises = workout.exercises || workout.workout_exercises;

  if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
    return 0; // Return 0 if no exercises
  }

  let totalSeconds = 0;
  const AVG_SET_DURATION_SECONDS = 45;
  const TRANSITION_DURATION_SECONDS = 120; // 2 minutes between exercises

  exercises.forEach((exercise: any, index: number) => {
    const sets = exercise.sets_target || 3; // Default to 3 sets if not specified
    const rest = exercise.rest_seconds || 60; // Default to 60s rest if not specified

    // Time for sets: (Time to perform + Rest time) * Number of sets
    // We subtract one rest period because you don't rest after the very last set of an exercise (you transition instead)
    // But for simplicity and to account for setup, let's keep it simple: Sets * (Work + Rest)
    const exerciseDuration = sets * (AVG_SET_DURATION_SECONDS + rest);
    
    totalSeconds += exerciseDuration;

    // Add transition time between exercises (not after the last one)
    if (index < exercises.length - 1) {
      totalSeconds += TRANSITION_DURATION_SECONDS;
    }
  });

  // Convert to minutes and round
  const totalMinutes = Math.ceil(totalSeconds / 60);

  // Return at least 15 minutes, and maybe round to nearest 5 for cleaner UI?
  // Let's just return the raw calculation for now, maybe clamped to minimum 10 mins.
  return Math.max(10, totalMinutes);
}
