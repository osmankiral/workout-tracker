'use client';

import { useState, useEffect, useRef } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Button } from '@/components/ui/button';
import { X, Play, Pause, SkipForward, Timer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export function RestTimer() {
  const t = useTranslations('ActiveWorkout');
  const { 
    isResting, 
    restTimeRemaining, 
    updateRestTime, 
    completeRest,
    activeWorkout,
    currentExerciseIndex
  } = useWorkoutStore();

  const [timeLeft, setTimeLeft] = useState(restTimeRemaining);
  const [initialTime, setInitialTime] = useState(restTimeRemaining);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Keep a ref to access latest timeLeft inside setInterval without re-creating it
  const timeLeftRef = useRef(timeLeft);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Sync state when rest starts or store updates significantly (e.g. manual add time)
  useEffect(() => {
    if (isResting) {
        // If the store has a larger value (user added time), update local state
        // Or if local state is way off (more than 2s drift), resync
        if (Math.abs(restTimeRemaining - timeLeft) > 2) {
             setTimeLeft(restTimeRemaining);
        }
        
        // Update initial time if we just started or extended
        if (restTimeRemaining > initialTime) {
            setInitialTime(restTimeRemaining);
        }
    } else {
        // Reset when not resting
        setInitialTime(0);
        setTimeLeft(0);
        setIsPaused(false);
    }
  }, [isResting, restTimeRemaining]); 

  // Timer Logic (Local State)
  useEffect(() => {
    if (!isResting || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
        const current = timeLeftRef.current;
        if (current <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            // Sync final state and complete
            updateRestTime(0);
            completeRest();
        } else {
            const newTime = current - 1;
            setTimeLeft(newTime);
            // Sync with store periodically
            updateRestTime(newTime);
        }
    }, 1000);

    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isResting, isPaused, completeRest, updateRestTime]);

  if (!isResting) return null;

  // Calculate next exercise info
  const nextExercise = activeWorkout?.exercises?.[currentExerciseIndex + 1];

  const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const addTime = (seconds: number) => {
      const newTime = timeLeft + seconds;
      setTimeLeft(newTime);
      setInitialTime(prev => prev + seconds);
      updateRestTime(newTime);
  };

  // Calculate circle props for progress
  const radius = 100;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full items-center justify-center relative bg-background text-foreground overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-primary/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[4000ms]" />

      <div className="w-full max-w-md p-8 relative z-10 flex flex-col items-center justify-center space-y-8">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Timer className="h-4 w-4" />
                {t('restTime')}
            </span>
        </div>

        {/* Circular Timer Section */}
        <div className="relative">
            {/* SVG Circle Timer */}
            <div className="relative w-[240px] h-[240px] flex items-center justify-center">
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
               
               {/* Time Inside */}
               <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className={cn(
                      "text-6xl font-mono font-bold tracking-tighter tabular-nums leading-none mb-2",
                      timeLeft <= 5 ? "text-destructive animate-pulse" : "text-foreground"
                  )}>
                      {formatTime(timeLeft)}
                  </span>
                  <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mt-2">
                    <span className="flex flex-col items-center">
                        <span className="text-[10px] opacity-70">{t('elapsed')}</span>
                        <span className="text-foreground">{formatTime(initialTime - timeLeft)}</span>
                    </span>
                    <span className="w-px h-4 bg-border/50" />
                    <span className="flex flex-col items-center">
                        <span className="text-[10px] opacity-70">{t('total')}</span>
                        <span className="text-foreground">{formatTime(initialTime)}</span>
                    </span>
                  </div>
               </div>
            </div>
        </div>

        {/* Next Station Info */}
        <div className="w-full bg-background/50 backdrop-blur-md border rounded-xl p-4 flex flex-col items-center gap-1 text-center shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                {t('upNext') !== 'ActiveWorkout.upNext' ? t('upNext') : 'SIRADAKİ'}
            </span>
            <span className="text-lg font-bold text-foreground">
                {nextExercise?.exercise?.name || (activeWorkout?.exercises?.[0]?.exercise?.name) || 'Bitiş'}
            </span>
        </div>

        {/* Controls */}
        <div className="flex flex-col w-full gap-4">
            <div className="grid grid-cols-3 gap-4 w-full">
                <Button 
                    variant="outline" 
                    onClick={() => addTime(10)} 
                    className="h-14 rounded-xl text-sm font-bold border-2 hover:bg-muted/50 transition-all active:scale-95"
                >
                    +10s
                </Button>
                <Button 
                    variant="outline" 
                    onClick={() => setIsPaused(!isPaused)} 
                    className="h-14 rounded-xl border-2 hover:bg-muted/50 transition-all active:scale-95"
                >
                    {isPaused ? <Play className="h-6 w-6 fill-current" /> : <Pause className="h-6 w-6 fill-current" />}
                </Button>
                <Button 
                    variant="outline" 
                    onClick={() => addTime(30)} 
                    className="h-14 rounded-xl text-sm font-bold border-2 hover:bg-muted/50 transition-all active:scale-95"
                >
                    +30s
                </Button>
            </div>
            
            <Button 
                variant="default" 
                size="lg" 
                className="h-14 w-full rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
                onClick={completeRest}
            >
                <SkipForward className="mr-2 h-5 w-5" /> 
                {t('skipRest')}
            </Button>
        </div>
      </div>
    </div>
  );
}
