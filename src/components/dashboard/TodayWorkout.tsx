'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, PlusCircle, ChevronDown, Dumbbell, Timer } from "lucide-react";
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HoverCard } from "@/components/ui/motion";
import { calculateWorkoutDuration } from "@/lib/workout-utils";
import { useState, useEffect } from "react";

interface TodayWorkoutProps {
  className?: string;
  workout?: any; // Replace with proper Workout type
  workouts?: any[];
}

export function TodayWorkout({ className, workout: initialWorkout, workouts = [] }: TodayWorkoutProps) {
  const t = useTranslations('Dashboard');
  const tWorkouts = useTranslations('Workouts');
  const tMuscle = useTranslations('MuscleGroups');

  // State to track the currently selected workout
  const [selectedWorkout, setSelectedWorkout] = useState(initialWorkout);

  // Update selected workout if initialWorkout changes (e.g. data re-fetch)
  useEffect(() => {
    setSelectedWorkout(initialWorkout);
  }, [initialWorkout]);

  // Handle workout selection from dropdown
  const handleWorkoutSelect = (workout: any) => {
    setSelectedWorkout(workout);
  };

  return (
    <HoverCard className={className}>
      <Card className="h-full border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
                <CardTitle className="text-xl text-primary">{t('todaysPlan')}</CardTitle>
                <CardDescription>
                {selectedWorkout ? t('readyForSession') : t('noWorkoutScheduled')}
                </CardDescription>
            </div>
            <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Timer className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedWorkout ? (
              <div className="flex flex-col gap-4">
                <div className="space-y-2 bg-background/50 p-4 rounded-xl border border-border/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-lg text-foreground break-words">{selectedWorkout.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{selectedWorkout.description || tWorkouts('noDescription')}</p>
                        </div>
                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded">~{calculateWorkoutDuration(selectedWorkout)} {tWorkouts('min')}</span>
                    </div>
                    
                    {/* Exercise Tags or Preview could go here */}
                    <div className="flex gap-2 pt-2">
                         <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tMuscle('strength')}</span>
                         <span className="text-xs bg-secondary/10 text-secondary-foreground px-2 py-0.5 rounded-full">{tMuscle('fullbody')}</span>
                    </div>
                </div>
              
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Button asChild size="lg" className="flex-1 w-full rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                        <Link href={`/workouts/active/${selectedWorkout.id}`}>
                        <PlayCircle className="mr-2 h-5 w-5" />
                        {t('start')}
                        </Link>
                    </Button>
                    
                    {workouts.length > 1 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button size="lg" variant="outline" className="px-3 rounded-xl flex-1 w-full">
                            {t('changeWorkout')} <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                        {workouts.filter(w => w.id !== selectedWorkout.id).map(w => (
                            <DropdownMenuItem 
                                key={w.id} 
                                onClick={() => handleWorkoutSelect(w)}
                                className="cursor-pointer"
                            >
                                <Dumbbell className="mr-2 h-4 w-4" />
                                <span className="truncate">{w.name}</span>
                            </DropdownMenuItem>
                        ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    )}
                </div>
              </div>
          ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                  <div className="p-4 bg-muted/30 rounded-full">
                      <Dumbbell className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                      <p className="font-medium">{t('restDay')}</p>
                      <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">{t('startNewWorkout')}</p>
                  </div>
                  <Button asChild variant="outline" className="rounded-full mt-2">
                      <Link href="/workouts">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          {t('browse')}
                      </Link>
                  </Button>
              </div>
          )}
        </CardContent>
      </Card>
    </HoverCard>
  );
}
