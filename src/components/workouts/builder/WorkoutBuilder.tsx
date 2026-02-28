'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ExerciseList } from './ExerciseList';
import { BuilderCanvas } from './BuilderCanvas';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export function WorkoutBuilder() {
  const router = useRouter();
  const t = useTranslations('Builder');
  const tCommon = useTranslations('Common');
  const { workoutBuilder, resetBuilder, setWorkoutName, setWorkoutDescription } = useWorkoutStore();
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  useEffect(() => {
    setMounted(true);
    
    // If editing, fetch workout data
    const fetchWorkoutForEdit = async () => {
      if (!editId) {
        // If not editing, reset builder to ensure fresh state
        resetBuilder();
        return;
      }
      
      const supabase = createClient();
      const { data: workout, error } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (
            *,
            exercise:exercises (*)
          )
        `)
        .eq('id', editId)
        .single();
        
      if (error) {
        console.error('Error fetching workout:', error);
        toast.error(t('errorLoad'));
        return;
      }
      
      if (workout) {
        // Reset first to clear any existing state
        resetBuilder();
        
        // Populate builder with fetched data
        setWorkoutName(workout.name);
        setWorkoutDescription(workout.description || '');
        
        // Add exercises
        // Note: We need a way to batch add exercises or add them one by one
        // Since we don't have a batch add action yet, we'll iterate
        // Ideally we should add a 'setBuilderState' action to the store
        
        // Sort exercises by order_index
        const sortedExercises = workout.workout_exercises?.sort((a: any, b: any) => a.order_index - b.order_index) || [];
        
        // This part is tricky because addExerciseToBuilder generates new IDs
        // and pushes to the end.
        // For a proper edit mode, we should update the store to accept a full state replacement.
        // For now, let's manually reconstruct the state using existing actions if possible,
        // or just accept that we are "cloning" the workout structure into the builder.
        
        // Since we can't easily batch set the exercises array via exposed actions without modifying the store,
        // let's modify the store to support this or loop.
        // Looping addExerciseToBuilder will work but might be slow and generate new IDs (which is fine for a builder, we create new on save anyway unless we want to update the existing workout).
        // If we want to UPDATE the existing workout, we need to track the workout ID in the builder state.
        
        sortedExercises.forEach((we: any) => {
           if (we.exercise) {
             useWorkoutStore.getState().addExerciseToBuilder(we.exercise);
             // Then we need to update the config (sets, reps, etc.)
             // The added exercise will be at the last index
             const currentIndex = useWorkoutStore.getState().workoutBuilder.exercises.length - 1;
             useWorkoutStore.getState().updateExerciseConfig(currentIndex, {
               sets_target: we.sets_target,
               reps_target: we.reps_target,
               weight_target: we.weight_target,
               rest_seconds: we.rest_seconds,
               is_circuit: we.is_circuit,
               circuit_id: we.circuit_id,
               circuit_rounds: we.circuit_rounds,
               order_in_circuit: we.order_in_circuit
             });
           }
        });
      }
    };

    fetchWorkoutForEdit();

    return () => {
      // Cleanup
    };
  }, [editId]); // Only run when editId changes (or on mount)

  if (!mounted) {
    return null;
  }

  const handleSave = async () => {
    if (!workoutBuilder.workoutName) {
      toast.error(t('errorName'));
      return;
    }

    if (workoutBuilder.exercises.length === 0) {
      toast.error(t('errorExercises'));
      return;
    }

    setIsSaving(true);
    const supabase = createClient();

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error(t('errorLogin'));
        setIsSaving(false);
        return;
      }

      // 1. Create or Update Workout
      let workout;
      let workoutError;

      if (editId) {
        // Update existing workout
        const { data, error } = await supabase
          .from('workouts')
          .update({
            name: workoutBuilder.workoutName,
            description: workoutBuilder.workoutDescription,
            updated_at: new Date().toISOString()
          })
          .eq('id', editId)
          .select()
          .single();
          
        workout = data;
        workoutError = error;

        // For exercises, it's easier to delete all and recreate for now
        // A more optimized approach would be diffing, but full replace is safer for MVP
        if (!error) {
           await supabase.from('workout_exercises').delete().eq('workout_id', editId);
        }

      } else {
        // Create new workout
        const { data, error } = await supabase
          .from('workouts')
          .insert({
            user_id: user.id,
            name: workoutBuilder.workoutName,
            description: workoutBuilder.workoutDescription,
            is_template: true
          })
          .select()
          .single();
          
        workout = data;
        workoutError = error;
      }

      if (workoutError) throw workoutError;

      // 2. Create Workout Exercises
      const exercisesToInsert = workoutBuilder.exercises.map((ex, index) => ({
        workout_id: workout.id,
        exercise_id: ex.exercise_id, 
        order_index: index,
        sets_target: ex.sets_target,
        reps_target: ex.reps_target,
        rest_seconds: ex.rest_seconds,
        weight_target: ex.weight_target,
        is_circuit: ex.is_circuit,
        circuit_id: ex.circuit_id,
        circuit_rounds: ex.circuit_rounds,
        order_in_circuit: ex.order_in_circuit
      }));
      
      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(exercisesToInsert);

      if (exercisesError) throw exercisesError;

      toast.success(t('successSave'));
      resetBuilder();
      router.push('/workouts');

    } catch (error: any) {
      console.error('Error saving workout:', error);
      toast.error(error.message || t('errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => resetBuilder()}>
              {t('reset')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? t('saving') : t('save')}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-80 border-r bg-background hidden md:block">
            <ExerciseList />
          </aside>
          
          <main className="flex-1 bg-muted/10 overflow-hidden">
            <BuilderCanvas />
          </main>
        </div>
      </div>
    </DndProvider>
  );
}
