'use client';

import { useDrag } from 'react-dnd';
import { Exercise } from '@/types/exercise.types';
import { Card, CardContent } from '@/components/ui/card';
import { GripVertical, Plus, Search, Info, Dumbbell, Timer, ArrowRightLeft, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWorkoutStore } from '@/stores/workoutStore';
import { MOCK_EXERCISES } from '@/lib/mock-exercises';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface DraggableExerciseItemProps {
  exercise: Exercise;
}

const DraggableExerciseItem = ({ exercise }: DraggableExerciseItemProps) => {
  const addExerciseToBuilder = useWorkoutStore((state) => state.addExerciseToBuilder);
  const t = useTranslations('Builder');
  const tMuscle = useTranslations('MuscleGroups');
  const tDesc = useTranslations('ExerciseDescriptions');
  const tTypes = useTranslations('ExerciseTypes');
  const tExec = useTranslations('ExecutionTypes');
  const tDiff = useTranslations('DifficultyLevels');
  const tMech = useTranslations('Mechanics');
  const tLabels = useTranslations('Labels');
  
  const getMuscleName = (group: string | undefined) => {
    if (!group) return t('uncategorized');
    const key = group.toLowerCase().replace(' ', '');
    const knownKeys = ['chest', 'back', 'legs', 'shoulders', 'arms', 'biceps', 'triceps', 'core', 'cardio', 'fullbody', 'strength', 'glutes', 'lowerback', 'hamstrings', 'forearms', 'upperchest', 'reardelts', 'calves', 'upperback', 'hipflexors', 'quadriceps', 'abs', 'obliques'];
    if (knownKeys.includes(key)) {
        return tMuscle(key as any);
    }
    return group;
  };
  
  const getDescription = (name: string, defaultDesc: string | undefined) => {
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const knownKeys = ['benchpress', 'squat', 'deadlift', 'overheadpress', 'pullup', 'pushup', 'dumbbellrow', 'lunge', 'plank', 'running', 'cycling', 'burpees', 'jumpingjack', 'mountainclimber', 'armcircle', 'gobletsquat', 'dumbbellshoulderpress', 'dumbbellbicepscurl', 'sideplank', 'bicyclecrunch', 'walking', 'sideplankright', 'sideplankleft'];
    
    if (knownKeys.includes(key)) {
      return tDesc(key as any);
    }
    return defaultDesc || '';
  };

  const getSecondaryMuscles = (muscles: string[] | undefined) => {
    if (!muscles || muscles.length === 0) return null;
    return muscles.map(m => getMuscleName(m)).join(', ');
  };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'EXERCISE',
    item: { exercise },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const description = getDescription(exercise.name, exercise.description);
  const secondaryMuscles = getSecondaryMuscles(exercise.secondary_muscles);

  // Helper for difficulty color
  const getDifficultyColor = (level: string | undefined) => {
    switch(level) {
      case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`mb-2 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <Card className="cursor-move hover:bg-accent/50 transition-colors group border-l-4 border-l-primary/20 hover:border-l-primary">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-medium truncate">{exercise.name}</p>
                {exercise.is_compound && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium hidden sm:inline-block">
                    {tMech('compound')}
                  </span>
                )}
                {description && (
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-help flex-shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[280px] p-4 text-xs space-y-3 z-50 bg-popover text-popover-foreground shadow-xl border">
                        <p className="font-medium text-sm border-b pb-2 mb-2">{exercise.name}</p>
                        <p>{description}</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="bg-muted p-1.5 rounded">
                            <span className="block text-muted-foreground mb-0.5">{tLabels('type')}</span>
                            <span className="font-semibold capitalize">{tTypes(exercise.exercise_type as any)}</span>
                          </div>
                          <div className="bg-muted p-1.5 rounded">
                            <span className="block text-muted-foreground mb-0.5">{tLabels('difficulty')}</span>
                            <span className={`font-semibold capitalize px-1.5 py-0.5 rounded text-[9px] inline-block border ${getDifficultyColor(exercise.difficulty_level)}`}>
                              {tDiff((exercise.difficulty_level || 'intermediate') as any)}
                            </span>
                          </div>
                          <div className="bg-muted p-1.5 rounded">
                            <span className="block text-muted-foreground mb-0.5">{tLabels('mechanics')}</span>
                            <span className="font-semibold">{exercise.is_compound ? tMech('compound') : tMech('isolation')}</span>
                          </div>
                          <div className="bg-muted p-1.5 rounded">
                            <span className="block text-muted-foreground mb-0.5">{tLabels('force')}</span>
                            <span className="font-semibold">{exercise.is_unilateral ? tMech('unilateral') : tMech('bilateral')}</span>
                          </div>
                        </div>

                        {secondaryMuscles && (
                          <div className="mt-2 pt-2 border-t border-border">
                            <span className="font-semibold block mb-1 text-muted-foreground">{t('secondaryMuscles')}:</span>
                            <span className="text-foreground">{secondaryMuscles}</span>
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary capitalize truncate">
                  {getMuscleName(exercise.muscle_group)}
                </span>
                <span className="text-[10px] text-muted-foreground capitalize flex items-center gap-1">
                  {exercise.execution_type === 'time' ? <Timer className="h-3 w-3" /> : <Dumbbell className="h-3 w-3" />}
                  {tExec(exercise.execution_type as any)}
                </span>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 flex-shrink-0 ml-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => addExerciseToBuilder(exercise)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export function ExerciseList() {
  const t = useTranslations('Builder');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('exercises')
          .select(`
            *,
            exercise_muscles (
              is_primary,
              muscles (
                name,
                slug
              )
            )
          `)
          .order('name');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Map database response to Exercise interface
          const mappedExercises: Exercise[] = data.map((item: any) => {
            const muscles = item.exercise_muscles?.map((em: any) => ({
              name: em.muscles.name,
              is_primary: em.is_primary
            })) || [];

            const primaryMuscle = muscles.find((m: any) => m.is_primary)?.name;
            const secondaryMuscles = muscles.filter((m: any) => !m.is_primary).map((m: any) => m.name);

            return {
              ...item,
              muscles,
              muscle_group: primaryMuscle || item.muscle_group || 'Uncategorized',
              secondary_muscles: secondaryMuscles.length > 0 ? secondaryMuscles : (item.secondary_muscles || []),
              exercise_type: item.exercise_type || 'strength', // Fallback for migration
              execution_type: item.execution_type || 'reps'    // Fallback for migration
            };
          });

          // Deduplicate exercises by name
          const uniqueExercises = mappedExercises.reduce((acc: Exercise[], current) => {
            const x = acc.find(item => item.name.toLowerCase() === current.name.toLowerCase());
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, []);
          setExercises(uniqueExercises);
        } else {
          // Fallback to mock if no exercises found (or table empty)
          setExercises(MOCK_EXERCISES);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
        // Fallback to mock on error
        setExercises(MOCK_EXERCISES);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ex.muscle_group || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b space-y-3">
        <div>
          <h3 className="font-semibold">{t('searchExercises')}</h3>
          <p className="text-sm text-muted-foreground">{t('dragDropHint')}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t('searchExercises')}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          filteredExercises.map((exercise) => (
            <DraggableExerciseItem key={exercise.id} exercise={exercise} />
          ))
        )}
        {!loading && filteredExercises.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-4">
            {t('noExercisesFound')}
          </p>
        )}
      </div>
    </div>
  );
}
