'use client';

import { useEffect, useState } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle2, MoreVertical, RefreshCw, LogOut, Play, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { WorkoutSummary } from './WorkoutSummary';
import { CircuitMode } from './CircuitMode';
import { RestTimer } from './RestTimer';

export function ActiveWorkoutSession() {
  const t = useTranslations('ActiveWorkout');
  const router = useRouter();
  
  const { 
    activeWorkout, 
    currentExerciseIndex, 
    currentSetIndex, 
    completeSet,
    goToNextExercise,
    goToPrevExercise,
    completeWorkout,
    cancelWorkout,
    startWorkout,
    isResting,
    restTimeRemaining,
    completeRest,
    updateRestTime
  } = useWorkoutStore();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  
  // Local state for inputs
  const [reps, setReps] = useState<string>('');
  const [weight, setWeight] = useState<string>('');

  // Warn on browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (activeWorkout && !activeWorkout.is_completed) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeWorkout]);

  // Timer
  useEffect(() => {
    if (!activeWorkout) return;
    const calculateTime = () => {
      const start = new Date(activeWorkout.started_at).getTime();
      const now = new Date().getTime();
      return Math.floor((now - start) / 1000);
    };
    setElapsedTime(calculateTime());
    const timer = setInterval(() => setElapsedTime(calculateTime()), 1000);
    return () => clearInterval(timer);
  }, [activeWorkout]);

  // Initialize inputs when exercise/set changes
  const currentExercise = activeWorkout?.exercises?.[currentExerciseIndex];
  const currentSet = currentExercise?.sets?.[currentSetIndex];

  useEffect(() => {
    if (currentSet) {
      const initialReps = currentSet.reps_actual?.toString() || currentExercise?.reps_target?.toString() || '';
      const initialWeight = currentSet.weight_actual?.toString() || currentExercise?.weight_target?.toString() || '0';
      setReps(initialReps);
      setWeight(initialWeight);
    } else {
        setReps(currentExercise?.reps_target?.toString() || '');
        setWeight(currentExercise?.weight_target?.toString() || '0');
    }
  }, [currentSet?.id, currentExercise?.reps_target, currentExercise?.weight_target]);

  // Check if this is the absolute last exercise and set of the workout
  const totalSetsActual = currentExercise?.sets?.length || currentExercise?.sets_target || 1;
  const isLastExercise = activeWorkout ? currentExerciseIndex === (activeWorkout.exercises?.length || 0) - 1 : false;
  const isLastSet = currentSetIndex >= totalSetsActual - 1;
  const isWorkoutComplete = isLastExercise && isLastSet;

  // Auto-finish workout if the last set is completed
  useEffect(() => {
    if (activeWorkout && isWorkoutComplete && currentSet?.is_completed && !activeWorkout.is_completed) {
        completeWorkout();
    }
  }, [isWorkoutComplete, currentSet?.is_completed, activeWorkout?.is_completed, completeWorkout]);

  if (!activeWorkout) return null;
  if (activeWorkout.is_completed) return <WorkoutSummary session={activeWorkout} />;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCancelWorkout = () => {
    cancelWorkout();
    router.push('/workouts');
  };

  const handleRestart = () => {
    if (activeWorkout.workout) startWorkout(activeWorkout.workout);
  };

  const onCompleteSet = () => {
    if (!reps) return;
    completeSet(parseInt(reps), parseFloat(weight) || 0);
    
    if (isWorkoutComplete) {
        completeWorkout();
    }
  };

  // Circuit & Progress Logic
  const totalExercises = activeWorkout.exercises?.length || 0;
  // Fallback: If is_circuit is false but circuit_id exists, treat it as circuit
  const isCircuit = currentExercise?.is_circuit || !!currentExercise?.circuit_id;
  const circuitId = currentExercise?.circuit_id;
  
  let circuitInfo = null;
  if (isCircuit && circuitId) {
      const circuitExercises = activeWorkout.exercises?.filter(e => e.circuit_id === circuitId)
          .sort((a, b) => (a.order_in_circuit || 0) - (b.order_in_circuit || 0)) || [];
      const currentStationIndex = circuitExercises.findIndex(e => e.id === currentExercise.id);
      
      circuitInfo = {
          currentRound: currentSetIndex + 1,
          totalRounds: currentExercise.circuit_rounds || 1,
          currentStation: currentStationIndex + 1,
          totalStations: circuitExercises.length,
          isLastStation: currentStationIndex === circuitExercises.length - 1,
          nextStationName: currentStationIndex < circuitExercises.length - 1 
              ? circuitExercises[currentStationIndex + 1].exercise?.name 
              : null
      };
  }

  // Button Text Logic
  let buttonText = t('completeSet');
  let buttonColor = "default";

  if (isCircuit && circuitInfo) {
      if (circuitInfo.isLastStation) {
          if (circuitInfo.currentRound < circuitInfo.totalRounds) {
              buttonText = t('completeRound'); // "Turu Tamamla & Dinlen"
          } else {
              if (isWorkoutComplete) {
                  buttonText = t('finish'); // "Antrenmanı Bitir"
                  buttonColor = "success";
              } else {
                  buttonText = t('finishCircuitComplete'); // "Devreyi Bitir"
                  buttonColor = "success";
              }
          }
      } else {
          buttonText = circuitInfo.nextStationName 
            ? t('nextStationIs', { name: circuitInfo.nextStationName }) 
            : t('nextStation');
      }
  } else {
      if (currentSetIndex >= totalSetsActual - 1) {
          if (isWorkoutComplete) {
              buttonText = t('finish'); // "Antrenmanı Bitir"
              buttonColor = "success";
          } else {
              buttonText = t('finishExercise');
          }
      }
  }

  const isInputValid = reps && parseInt(reps) > 0;

  // Rest Timer Overlay
  if (isResting) {
      return <RestTimer />;
  }

  // Use Guided Circuit Mode if applicable
  if (isCircuit) {
      return (
        <>
            <CircuitMode onExit={() => setShowExitDialog(true)} />
            
            {/* Dialogs for Circuit Mode */}
            <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <AlertDialogContent className="z-[150]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('cancelWorkoutTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('cancelWorkoutDescription')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="z-[160]">{t('continueWorkout')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelWorkout} className="bg-destructive text-destructive-foreground z-[160]">{t('confirmCancel')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
      );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full items-center relative">
        {/* Header - Centered container */}
        <div className="w-full flex items-center justify-between px-6 py-4 bg-background/50 border-b backdrop-blur-md z-10 sticky top-0">
            <Button variant="ghost" size="icon" onClick={() => setShowExitDialog(true)} className="hover:bg-destructive/10 hover:text-destructive transition-colors">
                <X className="h-6 w-6" />
            </Button>
            
            <div className="flex flex-col items-center">
                <span className="font-bold text-sm text-foreground/80">{activeWorkout.workout?.name}</span>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full mt-1">{formatTime(elapsedTime)}</span>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleRestart}><RefreshCw className="mr-2 h-4 w-4" /> {t('restart')}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowFinishDialog(true)}><CheckCircle2 className="mr-2 h-4 w-4" /> {t('finish')}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowExitDialog(true)} className="text-destructive"><LogOut className="mr-2 h-4 w-4" /> {t('cancelWorkout')}</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 w-full overflow-y-auto p-4 flex flex-col items-center justify-center">
            
            {/* Main Active Card */}
            <div className="w-full max-w-md bg-card border rounded-[2rem] shadow-2xl overflow-hidden relative mb-8 shrink-0">
                
                {/* Progress Bar Top */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-muted">
                    <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${((currentExerciseIndex + 1) / totalExercises) * 100}%` }} 
                    />
                </div>

                <div className="p-8 space-y-8">
                    {/* Status Badges */}
                    <div className="flex justify-between items-start">
                        {isCircuit && circuitInfo ? (
                            <div className="space-y-1">
                                <div className="flex gap-2">
                                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-blue-200 shadow-md">
                                        {t('roundOf', { current: circuitInfo.currentRound, total: circuitInfo.totalRounds })}
                                    </span>
                                </div>
                                <p className="text-xs font-semibold text-muted-foreground pl-1 pt-1">
                                    {t('stationOf', { current: circuitInfo.currentStation, total: circuitInfo.totalStations })}
                                </p>
                            </div>
                        ) : (
                            <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                                {t('set')} {currentSetIndex + 1} / {totalSetsActual}
                            </span>
                        )}
                        
                        <div className="flex gap-1">
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={goToPrevExercise} disabled={currentExerciseIndex === 0}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={goToNextExercise} disabled={currentExerciseIndex === totalExercises - 1}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Exercise Info */}
                    <div className="text-center space-y-3 py-4">
                        <h2 className="text-4xl font-black tracking-tight leading-tight text-foreground">
                            {currentExercise?.exercise?.name}
                        </h2>
                        <p className="text-lg font-medium text-muted-foreground capitalize flex items-center justify-center gap-2">
                            {currentExercise?.exercise?.muscle_group} <span className="text-muted-foreground/30">•</span> {currentExercise?.exercise?.equipment || 'Bodyweight'}
                        </p>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="flex flex-col items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t('reps')}
                                <span className="text-[10px] font-normal opacity-70 mt-0.5 bg-muted px-1.5 rounded">Target: {currentExercise?.reps_target}</span>
                            </label>
                            <Input 
                                type="number" 
                                value={reps}
                                onChange={(e) => setReps(e.target.value)}
                                className="h-24 text-5xl font-black text-center rounded-3xl border-2 bg-muted/20 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="flex flex-col items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t('weight')}
                                <span className="text-[10px] font-normal opacity-70 mt-0.5 bg-muted px-1.5 rounded">KG</span>
                            </label>
                            <Input 
                                type="number" 
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="h-24 text-5xl font-black text-center rounded-3xl border-2 bg-muted/20 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Action Button */}
                    <Button 
                        size="lg" 
                        className={cn(
                            "w-full h-20 text-xl font-bold rounded-2xl shadow-xl transition-all active:scale-[0.98] mt-4",
                            !isInputValid ? "opacity-70 grayscale" : "hover:scale-[1.02]",
                            buttonColor === "success" ? "bg-green-600 hover:bg-green-700 shadow-green-900/20" : "bg-primary hover:bg-primary/90 shadow-primary/30"
                        )}
                        disabled={!isInputValid}
                        onClick={onCompleteSet}
                    >
                        {isCircuit && !circuitInfo?.isLastStation ? (
                            <div className="flex flex-col items-center leading-none gap-1">
                                <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{t('upNext')}</span>
                                <span className="flex items-center gap-2 text-2xl">
                                    {circuitInfo?.nextStationName} <Play className="h-5 w-5 fill-current" />
                                </span>
                            </div>
                        ) : (
                            <span className="flex items-center gap-3 text-2xl">
                                {buttonText} {circuitInfo?.isLastStation ? <CheckCircle2 className="h-7 w-7" /> : <Check className="h-7 w-7" />}
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            {/* Previous Sets / History - Subtle below card */}
            {currentExercise?.sets && (
                <div className="w-full max-w-md pb-8">
                    <h4 className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 opacity-50">{t('history')}</h4>
                    <div className="flex flex-wrap justify-center gap-3">
                        {currentExercise.sets.map((set, idx) => {
                            // Show all sets, marking completed ones clearly
                            const isCompleted = set.is_completed;
                            const isCurrent = idx === currentSetIndex;
                            
                            return (
                                <div 
                                    key={set.id} 
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium shadow-sm transition-all",
                                        isCompleted ? "bg-primary/10 border-primary/20 text-foreground" : 
                                        isCurrent ? "bg-background border-primary ring-2 ring-primary/20" : "bg-muted/30 border-transparent opacity-50"
                                    )}
                                >
                                    <span className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                                        isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                    )}>
                                        {isCircuit ? (idx + 1) : (idx + 1)}
                                    </span>
                                    {isCompleted ? (
                                        <span className="text-foreground/80">{set.reps_actual}r • {set.weight_actual}kg</span>
                                    ) : (
                                        <span className="text-muted-foreground italic text-xs">{t('waiting')}...</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>

        {/* Dialogs */}
        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
            <AlertDialogContent className="z-[150]">
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('cancelWorkoutTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('cancelWorkoutDescription')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="z-[160]">{t('continueWorkout')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelWorkout} className="bg-destructive text-destructive-foreground z-[160]">{t('confirmCancel')}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
            <AlertDialogContent className="z-[150]">
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('finishConfirmTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('finishConfirmDescription')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="z-[160]">{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => completeWorkout()} className="bg-green-600 text-white z-[160]">{t('confirmFinish')}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
