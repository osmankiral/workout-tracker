'use client';

import { useDrop } from 'react-dnd';
import { useWorkoutStore } from '@/stores/workoutStore';
import { DraggableExercise } from './DraggableExercise';
import { Exercise } from '@/types/exercise.types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Layers, Lightbulb, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export function BuilderCanvas() {
  const t = useTranslations('Builder');
  const { 
    workoutBuilder, 
    reorderExercises, 
    addExerciseToBuilder,
    setWorkoutName,
    setWorkoutDescription,
    createCircuit
  } = useWorkoutStore();

  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [showGuide, setShowGuide] = useState(true);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'EXERCISE',
    drop: (item: { exercise: Exercise }) => {
      addExerciseToBuilder(item.exercise);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const moveExercise = useCallback((dragIndex: number, hoverIndex: number) => {
    reorderExercises(dragIndex, hoverIndex);
  }, [reorderExercises]);

  const toggleSelection = (index: number) => {
    setSelectedIndices(prev => {
      const isSelected = prev.includes(index);
      if (isSelected) {
        return prev.filter(i => i !== index);
      } else {
        // If selecting the first item, show a toast hint
        if (prev.length === 0) {
            toast(t('selectMoreHint'), {
                icon: <Layers className="h-4 w-4 text-blue-500" />,
                duration: 3000
            });
        }
        return [...prev, index].sort((a, b) => a - b);
      }
    });
  };

  const handleCreateCircuit = () => {
    if (selectedIndices.length < 2) return;
    createCircuit(selectedIndices, 3); // Default 3 rounds
    setSelectedIndices([]);
    toast.success(t('circuitCreated'));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-muted/10">
      <div className="p-6 border-b bg-background z-10 shadow-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workout-name">{t('workoutName')}</Label>
            <Input 
              id="workout-name" 
              placeholder={t('placeholderName')}
              value={workoutBuilder.workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="text-lg font-semibold"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workout-desc">{t('description')}</Label>
            <Textarea 
              id="workout-desc" 
              placeholder={t('placeholderDescription')}
              value={workoutBuilder.workoutDescription}
              onChange={(e) => setWorkoutDescription(e.target.value)}
              className="resize-none h-20"
            />
          </div>

          {/* Selection Status Bar */}
          {selectedIndices.length > 1 && (
            <div className="flex items-center justify-between gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-in fade-in slide-in-from-top-2">
              <span className="text-sm font-medium px-2 text-blue-700 dark:text-blue-300">
                {t('selected', { count: selectedIndices.length })}
              </span>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateCircuit} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Layers className="h-4 w-4" />
                  {t('createCircuit')}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedIndices([])} className="text-muted-foreground hover:text-foreground">
                  {t('cancelSelection')}
                </Button>
              </div>
            </div>
          )}

          {/* Circuit Guide Card - Dismissible */}
          {showGuide && workoutBuilder.exercises.length > 1 && !workoutBuilder.exercises.some(e => e.is_circuit) && selectedIndices.length === 0 && (
            <Alert className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 text-blue-800 dark:text-blue-300 relative group">
              <Lightbulb className="h-4 w-4" />
              <AlertTitle className="text-xs font-semibold">{t('circuitGuideTitle')}</AlertTitle>
              <AlertDescription className="text-xs text-blue-700/80 dark:text-blue-400/80 mt-1 pr-6">
                {t('circuitGuideDesc')}
              </AlertDescription>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 absolute top-2 right-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100/50 rounded-full"
                onClick={() => setShowGuide(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Alert>
          )}
        </div>
      </div>

      <div 
        ref={drop as unknown as React.Ref<HTMLDivElement>}
        className={`flex-1 overflow-y-auto p-6 transition-colors ${
          isOver ? 'bg-primary/5' : ''
        }`}
      >
        {workoutBuilder.exercises.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-muted-foreground/20 rounded-xl p-12 bg-background/50">
            <div className="p-4 bg-muted rounded-full mb-4">
              <Layers className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-1">{t('dragDropHint')}</p>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Sol taraftan egzersizleri sürükleyip buraya bırakarak antrenmanını oluşturmaya başla.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto pb-20">
            {workoutBuilder.exercises.map((exercise, index) => (
              <DraggableExercise
                key={exercise.id}
                index={index}
                exercise={exercise}
                moveExercise={moveExercise}
                isSelected={selectedIndices.includes(index)}
                onSelect={() => toggleSelection(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
