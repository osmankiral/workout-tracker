'use client';

import { useState, useEffect } from 'react';
import { WorkoutExercise } from '@/types/workout.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Play, CheckCircle2 } from 'lucide-react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface SetTrackerProps {
  exercise: WorkoutExercise;
  currentSetIndex: number;
  nextExerciseName?: string;
  isLastStation?: boolean;
  stationIndex?: number;
  totalStations?: number;
}

export function SetTracker({ 
  exercise, 
  currentSetIndex,
  nextExerciseName,
  isLastStation,
  stationIndex,
  totalStations
}: SetTrackerProps) {
  const t = useTranslations('ActiveWorkout');
  const { completeSet } = useWorkoutStore();
  const [reps, setReps] = useState<string>('');
  const [weight, setWeight] = useState<string>('');

  const currentSet = exercise.sets?.[currentSetIndex];

  // Initialize inputs - Don't autofill target reps to keep button hidden
  useEffect(() => {
    if (currentSet) {
      setReps(currentSet.reps_actual?.toString() || '');
      setWeight(currentSet.weight_actual?.toString() || '');
    }
  }, [currentSet?.id, currentSet?.reps_actual, currentSet?.weight_actual]);

  const handleComplete = () => {
    if (!reps) return;
    completeSet(parseInt(reps), parseFloat(weight) || 0);
  };

  const fillWithTarget = () => {
      if (exercise.reps_target) {
          setReps(exercise.reps_target.toString());
      }
  };

  // Determine button text and color based on context
  let buttonText = t('completeSet');
  let buttonColor = "default"; // default primary color

  if (exercise.is_circuit) {
    if (isLastStation) {
        // Last station of the round
        if (currentSetIndex < (exercise.circuit_rounds || 1) - 1) {
            buttonText = t('completeRound'); // Complete Round & Rest
        } else {
            buttonText = t('finishCircuit'); // Finish Circuit completely
            buttonColor = "success";
        }
    } else {
        // Normal station transition
        buttonText = nextExerciseName ? t('nextStationIs', { name: nextExerciseName }) : t('nextStation');
    }
  } else {
      // Normal Set
      if (currentSetIndex >= (exercise.sets_target || 1) - 1) {
          buttonText = t('finishExercise'); // Finish Exercise
      }
  }

  // Only show button if reps are entered (prevent accidental skips)
  const isInputValid = reps && parseInt(reps) > 0;

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-xl p-5 border border-border/50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl flex flex-col gap-1">
                {exercise.is_circuit ? (
                    <>
                        <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold uppercase tracking-wider">
                            {t('roundOf', { current: currentSetIndex + 1, total: exercise.circuit_rounds || 1 })}
                        </span>
                        <span className="text-foreground text-2xl font-extrabold">
                            {t('stationOf', { current: (stationIndex || 0) + 1, total: totalStations || 1 })}
                        </span>
                    </>
                ) : (
                    <>
                        <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
                            {t('set')} {currentSetIndex + 1} / {exercise.sets_target}
                        </span>
                    </>
                )}
            </h3>
            <div 
                className="text-sm bg-background px-4 py-2 rounded-lg border shadow-sm flex flex-col items-end cursor-pointer hover:bg-muted/50 transition-colors active:scale-95"
                onClick={fillWithTarget}
            >
                <span className="text-muted-foreground text-[10px] uppercase font-bold">{t('target')}</span>
                <span className="font-bold text-lg text-foreground leading-none">{exercise.reps_target} <span className="text-xs font-normal text-muted-foreground">{t('reps')}</span></span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">{t('reps')}</label>
                <div className="relative">
                    <Input 
                        type="number" 
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        className="h-14 text-2xl font-bold text-center bg-background border-border/50 focus:border-primary focus:ring-primary/20 transition-all rounded-xl shadow-inner"
                        placeholder={exercise.reps_target?.toString() || "0"}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">{t('weight')} (kg)</label>
                <div className="relative">
                    <Input 
                        type="number" 
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="h-14 text-2xl font-bold text-center bg-background border-border/50 focus:border-primary focus:ring-primary/20 transition-all rounded-xl shadow-inner"
                        placeholder="0"
                    />
                </div>
            </div>
        </div>

        <div className={`transition-all duration-300 overflow-hidden ${isInputValid ? 'max-h-24 opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}`}>
            <Button 
                onClick={handleComplete}
                disabled={!isInputValid}
                className={cn(
                    "w-full h-12 text-lg font-bold rounded-lg shadow-md transition-all active:scale-[0.98]",
                    buttonColor === "success" 
                        ? "bg-green-600 hover:bg-green-700 shadow-green-900/20" 
                        : "bg-primary hover:bg-primary/90 shadow-primary/20"
                )}
            >
                {exercise.is_circuit && !isLastStation ? (
                    <div className="flex items-center gap-2">
                        <span className="font-normal opacity-80 uppercase tracking-wide text-xs">{t('upNext')}:</span>
                        <span>{nextExerciseName || t('nextStation')}</span>
                        <Play className="h-4 w-4 fill-current ml-1" />
                    </div>
                ) : (
                    <span className="flex items-center gap-2">
                        {buttonText} {isLastStation ? <CheckCircle2 className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                    </span>
                )}
            </Button>
        </div>
      </div>

      {/* History / Previous Sets */}
      {exercise.sets && exercise.sets.length > 0 && (
          <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground px-1">{t('history')}</h4>
              <div className="space-y-2">
                  {exercise.sets.map((set, idx) => (
                      <div 
                        key={set.id}
                        className={cn(
                            "flex items-center justify-between p-3 rounded-lg text-sm transition-colors",
                            set.is_completed 
                                ? "bg-primary/5 border border-primary/10 text-foreground" 
                                : "bg-muted/10 border border-transparent text-muted-foreground opacity-50",
                            idx === currentSetIndex && "ring-2 ring-primary border-primary bg-background opacity-100 shadow-sm"
                        )}
                      >
                          <div className="flex items-center gap-3">
                              <span className={cn(
                                  "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                                  set.is_completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              )}>
                                  {idx + 1}
                              </span>
                              <span className="font-medium">
                                  {set.is_completed ? `${set.reps_actual} reps` : '-'}
                              </span>
                          </div>
                          <span className="text-muted-foreground">
                              {set.is_completed && set.weight_actual ? `${set.weight_actual} kg` : ''}
                          </span>
                          {set.is_completed && <Check className="h-4 w-4 text-primary" />}
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
}
