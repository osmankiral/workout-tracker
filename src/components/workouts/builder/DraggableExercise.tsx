'use client';

import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { WorkoutExercise } from '@/types/workout.types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GripVertical, Trash2, Layers, Info } from 'lucide-react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Identifier, XYCoord } from 'dnd-core';

interface DraggableExerciseProps {
  exercise: WorkoutExercise;
  index: number;
  moveExercise: (dragIndex: number, hoverIndex: number) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

export function DraggableExercise({ exercise, index, moveExercise, isSelected, onSelect }: DraggableExerciseProps) {
  const t = useTranslations('Builder');
  const ref = useRef<HTMLDivElement>(null);
  const { removeExerciseFromBuilder, updateExerciseConfig, ungroupCircuit } = useWorkoutStore();

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: 'BUILDER_EXERCISE',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Don't allow reordering if one of them is in a circuit and the other is not
      // Or if they are in different circuits
      const dragExercise = useWorkoutStore.getState().workoutBuilder.exercises[dragIndex];
      const hoverExercise = useWorkoutStore.getState().workoutBuilder.exercises[hoverIndex];

      if (dragExercise.is_circuit || hoverExercise.is_circuit) {
         if (dragExercise.circuit_id !== hoverExercise.circuit_id) {
             return; // Prevent mixing circuits or dragging into/out of circuits via simple sort
         }
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveExercise(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'BUILDER_EXERCISE',
    item: () => {
      return { id: exercise.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drop(ref);

  const handleUngroup = () => {
    if (exercise.circuit_id) {
      ungroupCircuit(exercise.circuit_id);
    }
  };

  return (
    <div ref={ref} style={{ opacity }} className="mb-4 group" data-handler-id={handlerId}>
      {/* Circuit Header if this is the first item in the circuit */}
      {exercise.is_circuit && exercise.order_in_circuit === 0 && (
         <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-2 rounded-t-lg border-x border-t border-blue-200 dark:border-blue-800 -mb-1 relative z-10">
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 gap-1">
                    <Layers className="h-3 w-3" />
                    {t('circuit')}
                </Badge>
                <span className="text-xs text-blue-600 dark:text-blue-300 font-medium">
                    {exercise.circuit_rounds} {t('rounds')}
                </span>
            </div>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleUngroup}
                className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100 px-2"
            >
                {t('ungroupCircuit')}
            </Button>
         </div>
      )}

      <Card className={`transition-all duration-200 border shadow-sm hover:shadow-md ${isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : 'bg-card'} ${exercise.is_circuit ? 'border-l-4 border-l-blue-500 bg-blue-50/10 dark:bg-blue-900/5 rounded-t-none' : ''}`}>
        <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3 space-y-0">
          <div ref={drag as unknown as React.Ref<HTMLDivElement>} className="cursor-move cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <GripVertical className="h-5 w-5" />
          </div>
          
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={() => onSelect?.()} 
            className="h-5 w-5 border-2 border-muted-foreground/30 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-base truncate">{exercise.exercise?.name}</span>
            </div>
            {!exercise.is_circuit && (
               <p className="text-xs text-muted-foreground mt-0.5 capitalize">{exercise.exercise?.muscle_group}</p>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            onClick={() => removeExerciseFromBuilder(index)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{t('remove')}</span>
          </Button>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor={`sets-${exercise.id}`} className="text-xs font-medium text-muted-foreground">
                {exercise.is_circuit ? t('rounds') : t('sets')}
              </Label>
              <Input 
                id={`sets-${exercise.id}`} 
                type="number" 
                value={exercise.is_circuit ? (exercise.circuit_rounds || 1) : exercise.sets_target} 
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  if (exercise.is_circuit) {
                    updateExerciseConfig(index, { circuit_rounds: val });
                    // Also update rounds for all exercises in this circuit for consistency
                    // This logic ideally belongs in the store action, but for now:
                    const allExercises = useWorkoutStore.getState().workoutBuilder.exercises;
                    allExercises.forEach((ex, idx) => {
                        if (ex.circuit_id === exercise.circuit_id && idx !== index) {
                            updateExerciseConfig(idx, { circuit_rounds: val });
                        }
                    });
                  } else {
                    updateExerciseConfig(index, { sets_target: val });
                  }
                }}
                className={`h-9 bg-background focus-visible:ring-offset-0 ${exercise.is_circuit ? 'border-blue-200 focus-visible:ring-blue-500' : ''}`}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`reps-${exercise.id}`} className="text-xs font-medium text-muted-foreground">{t('reps')}</Label>
              <Input 
                id={`reps-${exercise.id}`} 
                type="number" 
                value={exercise.reps_target} 
                onChange={(e) => updateExerciseConfig(index, { reps_target: parseInt(e.target.value) || 0 })}
                className="h-9 bg-background focus-visible:ring-offset-0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`rest-${exercise.id}`} className="text-xs font-medium text-muted-foreground">{t('rest')} ({t('sec')})</Label>
              <Input 
                id={`rest-${exercise.id}`} 
                type="number" 
                value={exercise.rest_seconds} 
                onChange={(e) => updateExerciseConfig(index, { rest_seconds: parseInt(e.target.value) || 0 })}
                className="h-9 bg-background focus-visible:ring-offset-0"
              />
            </div>
          </div>
          {exercise.is_circuit && (
            <p className="text-[10px] text-blue-600/70 mt-2 flex items-center gap-1">
                <Info className="h-3 w-3" />
                {t('circuitInfo')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
