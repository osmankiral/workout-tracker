'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Progress } from '@/components/ui/progress';
import { useCircuitTimer } from '@/hooks/useCircuitTimer';

interface CircuitModeProps {
  onExit: () => void;
}

export function CircuitMode({ onExit }: CircuitModeProps) {
  const t = useTranslations('ActiveWorkout');
  const { 
    activeWorkout, 
    currentExerciseIndex, 
    currentSetIndex, 
    completeSet,
    completeWorkout,
    isResting
  } = useWorkoutStore();

  if (!activeWorkout) return null;

  const currentExercise = activeWorkout.exercises?.[currentExerciseIndex];
  
  // Timer Configuration
  // Default to 45s if not set, or use reps_target as seconds
  const targetTime = currentExercise?.reps_target || 45; 

  const handleComplete = useCallback(() => {
    if (!currentExercise) return;
    // Complete the set with duration as reps (seconds) and 0 weight
    completeSet(targetTime, 0);

    // If workout is complete after this set, trigger finish
    // We can't easily check 'isWorkoutComplete' here because it depends on updated state
    // But ActiveWorkoutSession has an effect for it.
  }, [completeSet, targetTime, currentExercise]);

  const { timeLeft, isPaused, togglePause, skip, progress } = useCircuitTimer({
    duration: targetTime,
    onComplete: handleComplete,
    key: currentExercise?.id // Force timer reset when exercise changes even if duration is same
  });

  // Circuit Info Calculation
  const circuitId = currentExercise?.circuit_id;
  const circuitExercises = activeWorkout?.exercises?.filter(e => e.circuit_id === circuitId)
      .sort((a, b) => (a.order_in_circuit || 0) - (b.order_in_circuit || 0)) || [];
  
  const currentStationIndex = circuitExercises.findIndex(e => e.id === currentExercise?.id);
  const totalStations = circuitExercises.length;
  const currentRound = currentSetIndex + 1;
  const totalRounds = currentExercise?.circuit_rounds || 1;
  
  const nextExercise = currentStationIndex < totalStations - 1 
      ? circuitExercises[currentStationIndex + 1] 
      : (currentRound < totalRounds ? circuitExercises[0] : null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate circle props for progress
  const radius = 120;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full relative bg-background text-foreground overflow-hidden font-sans">
      {/* Background Pattern - Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.4] dark:opacity-[0.1] pointer-events-none" />
      
      {/* Subtle Ambient Glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Bar - Compact & Clean */}
      <div className="flex justify-between items-center px-6 py-4 z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {t('circuit') !== 'ActiveWorkout.circuit' ? t('circuit') : 'TUR'}
            </span>
          </div>
          <span className="text-xl font-black text-foreground tracking-tight mt-0.5">
            {t('roundOf', { current: currentRound, total: totalRounds })}
          </span>
        </div>
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={onExit} 
            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content - Positioned towards top */}
      <div className="flex flex-col items-center justify-center relative z-0 pt-16 pb-8 space-y-6">
        
        {/* Circular Timer Section */}
        <div className="relative">
            {/* SVG Circle Timer */}
            <div className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] flex items-center justify-center">
               {/* Glow behind timer */}
               <div className={cn(
                    "absolute inset-0 rounded-full blur-[30px] transition-all duration-500",
                    timeLeft <= 5 ? "bg-destructive/20" : "bg-primary/10"
               )} />

               <svg
                  className="w-full h-full transform -rotate-90 drop-shadow-xl"
                  viewBox={`0 0 ${radius * 2} ${radius * 2}`}
               >
                  {/* Track */}
                  <circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="text-muted/20"
                  />
                  {/* Progress */}
                  <circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s linear' }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className={cn(
                        "transition-colors duration-300",
                        timeLeft <= 5 ? "text-destructive" : "text-primary"
                    )}
                  />
               </svg>
               
               {/* Time & Exercise Name Inside/Below */}
               <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <span className={cn(
                      "text-7xl md:text-8xl font-mono font-bold tracking-tighter tabular-nums leading-none mb-2",
                      timeLeft <= 5 ? "text-destructive animate-pulse" : "text-foreground"
                  )}>
                      {formatTime(timeLeft)}
                  </span>
                  
                  {/* Exercise Name inside circle for tight integration */}
                  <div className="flex flex-col items-center max-w-[200px]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                        {currentExercise?.exercise?.muscle_group || 'Core'}
                      </span>
                      <h1 className="text-lg md:text-xl font-bold leading-tight line-clamp-2 text-balance">
                        {currentExercise?.exercise?.name}
                      </h1>
                  </div>
               </div>
            </div>
        </div>
      </div>

      {/* Footer - Actionable & Structured */}
      <div className="w-full max-w-md mx-auto px-6 z-10 space-y-4">
         
         {/* Up Next Card - Glass Effect */}
         {nextExercise && (
             <div className="bg-background/60 backdrop-blur-md border rounded-xl p-3 flex items-center gap-3 shadow-sm">
                 <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-muted-foreground">
                        {currentStationIndex + 2 > totalStations ? 1 : currentStationIndex + 2}
                    </span>
                 </div>
                 <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {t('upNext') !== 'ActiveWorkout.upNext' ? t('upNext') : 'SIRADAKİ'}
                    </span>
                    <span className="text-sm font-bold truncate text-foreground">
                        {nextExercise.exercise?.name}
                    </span>
                 </div>
                 {currentRound < totalRounds && currentStationIndex === totalStations - 1 && (
                    <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold">
                        {t('nextRound') || 'Sonraki Tur'}
                    </span>
                 )}
             </div>
         )}

         {/* Control Grid */}
         <div className="grid grid-cols-2 gap-3">
            <Button 
                variant="outline" 
                size="lg" 
                className="h-14 rounded-xl border-2 hover:bg-muted/50 text-base font-bold transition-all active:scale-95"
                onClick={togglePause}
            >
                {isPaused ? <Play className="mr-2 h-5 w-5 fill-current" /> : <Pause className="mr-2 h-5 w-5 fill-current" />}
                {isPaused ? 'DEVAM' : 'DURAKLAT'}
            </Button>
            
            <Button 
                variant="default" 
                size="lg" 
                className="h-14 rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
                onClick={skip}
            >
                <SkipForward className="mr-2 h-5 w-5" /> 
                {t('skip') !== 'ActiveWorkout.skip' ? t('skip') : 'ATLA'}
            </Button>
         </div>
      </div>

      {/* Spacer to fill bottom area */}
      <div className="flex-1" />
    </div>
  );
}
