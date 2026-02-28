'use client';

import { useEffect, useState } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { createClient } from '@/lib/supabase/client';
import { ActiveWorkoutSession } from './ActiveWorkoutSession';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ActiveWorkoutLoaderProps {
  workoutId: string;
}

import { useTranslations } from 'next-intl';

export function ActiveWorkoutLoader({ workoutId }: ActiveWorkoutLoaderProps) {
  const router = useRouter();
  const t = useTranslations('ActiveWorkout');
  const { activeWorkout, startWorkout } = useWorkoutStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initWorkout = async () => {
      // If we already have an active workout and it matches the ID (or we just assume the user wants to continue the current one if valid)
      // But here we specifically want to start workoutId.
      // If activeWorkout exists and comes from this workoutId, we can just show it.
      if (activeWorkout && activeWorkout.workout_id === workoutId && !activeWorkout.is_completed) {
        setLoading(false);
        return;
      }

      // Otherwise, fetch the workout template and start a new session
      try {
        const supabase = createClient();
        
        // Fetch workout with its exercises
        const { data: workout, error } = await supabase
          .from('workouts')
          .select(`
            *,
            workout_exercises (
              *,
              exercise:exercises (*)
            )
          `)
          .eq('id', workoutId)
          .single();

        if (error) throw error;
        if (!workout) throw new Error(t('notFound'));

        // Transform data to match the store's expected structure
        // The store expects a Workout object with an 'exercises' array which contains WorkoutExercise objects
        // The query returns workout_exercises as an array.
        // We need to map workout_exercises to match the Workout type structure if needed.
        // Let's check types.
        
        // We need to sort exercises by order_index
        const sortedExercises = (workout.workout_exercises || []).sort((a: any, b: any) => a.order_index - b.order_index);
        
        // Map the structure to flatten exercise details if necessary, but WorkoutExercise type usually has 'exercise' property.
        // Our query returns exactly that structure: workout_exercises includes 'exercise'.
        
        const workoutData = {
          ...workout,
          exercises: sortedExercises
        };

        startWorkout(workoutData);
      } catch (error: any) {
        console.error('Error loading workout:', error);
        toast.error(t('errorLoad'));
        router.push('/workouts');
      } finally {
        setLoading(false);
      }
    };

    initWorkout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutId, startWorkout, router]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">{t('loading')}</span>
      </div>
    );
  }

  return <ActiveWorkoutSession />;
}
