'use client';

import { useEffect, useState, useRef } from 'react';
import { WorkoutSession } from '@/types/workout.types';
import { useWorkoutStore } from '@/stores/workoutStore';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Loader2, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface WorkoutSummaryProps {
  session: WorkoutSession;
}

import { useTranslations } from 'next-intl';

export function WorkoutSummary({ session }: WorkoutSummaryProps) {
  const t = useTranslations('ActiveWorkout');
  const router = useRouter();
  const { cancelWorkout } = useWorkoutStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveAttempted = useRef(false);

  useEffect(() => {
    const saveSession = async () => {
      if (saveAttempted.current || saved || saving) return;
      saveAttempted.current = true;
      setSaving(true);

      try {
        const supabase = createClient();
        
        // 1. Save Workout Session
        const { data: sessionData, error: sessionError } = await supabase
          .from('workout_sessions')
          .insert({
            workout_id: session.workout_id,
            user_id: session.user_id,
            started_at: session.started_at,
            completed_at: new Date().toISOString(),
            is_completed: true,
            total_duration_seconds: session.total_duration_seconds || 0
          })
          .select()
          .single();

        if (sessionError) throw sessionError;

        // 2. Save Exercise Logs
        const logs = [];
        if (session.exercises) {
          for (const exercise of session.exercises) {
            if (exercise.sets) {
              for (const set of exercise.sets) {
                if (set.is_completed) {
                  logs.push({
                    user_id: session.user_id,
                    exercise_id: exercise.exercise_id,
                    workout_session_id: sessionData.id,
                    reps: set.reps_actual,
                    weight: set.weight_actual,
                    performed_at: set.completed_at || new Date().toISOString()
                  });
                }
              }
            }
          }
        }

        if (logs.length > 0) {
          const { error: logsError } = await supabase
            .from('exercise_logs')
            .insert(logs);
            
          if (logsError) throw logsError;
        }

        setSaved(true);
        toast.success(t('successSave'));
        
      } catch (error: any) {
        console.error('Error saving workout session:', error);
        toast.error(t('errorSave'));
      } finally {
        setSaving(false);
      }
    };

    saveSession();
  }, [session, saved, saving]);

  const handleFinish = () => {
    cancelWorkout();
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 space-y-4 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full" />
        <Trophy className="h-20 w-20 text-yellow-500 relative z-10" />
      </div>
      
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          {t('workoutComplete') !== 'ActiveWorkout.workoutComplete' ? t('workoutComplete') : 'Antrenman Tamamlandı!'}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('greatJob') !== 'ActiveWorkout.greatJob' ? t('greatJob') : 'Harika iş çıkardın!'}
        </p>
      </div>

      <Card className="w-full max-w-sm shadow-sm">
        <CardHeader className="py-4">
          <CardTitle className="text-center text-lg">
            {t('summary') !== 'ActiveWorkout.summary' ? t('summary') : 'Özet'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          <div className="flex justify-between items-center pb-2 border-b text-sm">
            <span className="text-muted-foreground">
              {t('exercisesCompleted') !== 'ActiveWorkout.exercisesCompleted' ? t('exercisesCompleted') : 'Tamamlanan Egzersiz'}
            </span>
            <span className="font-bold">{session.exercises?.length || 0}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b text-sm">
            <span className="text-muted-foreground">
              {t('totalSets') !== 'ActiveWorkout.totalSets' ? t('totalSets') : 'Toplam Set'}
            </span>
            <span className="font-bold">
              {session.exercises?.reduce((acc, ex) => acc + (ex.sets?.filter(s => s.is_completed).length || 0), 0)}
            </span>
          </div>
          
          {saving ? (
            <div className="flex items-center justify-center text-sm text-muted-foreground py-2">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('saving')}
            </div>
          ) : (
            <div className="text-center text-sm text-green-600 font-medium py-2">
              {t('savedSecurely') !== 'ActiveWorkout.savedSecurely' ? t('savedSecurely') : 'Antrenmanın güvenle kaydedildi.'}
            </div>
          )}
        </CardContent>
      </Card>

      <Button size="lg" onClick={handleFinish} className="w-full max-w-sm" disabled={saving}>
        <Home className="mr-2 h-4 w-4" />
        {t('backToDashboard') !== 'ActiveWorkout.backToDashboard' ? t('backToDashboard') : 'Panele Dön'}
      </Button>
    </div>
  );
}
