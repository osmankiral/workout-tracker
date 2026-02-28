import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Workout, WorkoutSession, WorkoutExercise, ExerciseConfig, CircuitConfig } from '@/types/workout.types';
import { Exercise } from '@/types/exercise.types';

interface WorkoutStore {
  // Current workout state
  activeWorkout: WorkoutSession | null;
  currentExerciseIndex: number;
  currentSetIndex: number;
  isResting: boolean;
  restTimeRemaining: number;
  
  // Workout builder state
  workoutBuilder: {
    exercises: WorkoutExercise[];
    isDragging: boolean;
    selectedExercise: Exercise | null;
    workoutName: string;
    workoutDescription: string;
  };
  
  // Circuit mode state
  circuitMode: {
    isActive: boolean;
    currentRound: number;
    totalRounds: number;
    currentExerciseInRound: number;
  };
  
  // Actions
  startWorkout: (workout: Workout) => void;
  completeSet: (reps: number, weight: number) => void;
  startRest: (seconds: number) => void;
  completeRest: () => void;
  updateRestTime: (time: number) => void;
  goToNextExercise: () => void;
  goToPrevExercise: () => void;
  completeWorkout: () => void;
  cancelWorkout: () => void;
  
  // Builder actions
  setWorkoutName: (name: string) => void;
  setWorkoutDescription: (desc: string) => void;
  addExerciseToBuilder: (exercise: Exercise) => void;
  removeExerciseFromBuilder: (index: number) => void;
  reorderExercises: (fromIndex: number, toIndex: number) => void;
  updateExerciseConfig: (index: number, config: ExerciseConfig) => void;
  createCircuit: (exerciseIndices: number[], rounds: number) => void;
  ungroupCircuit: (circuitId: string) => void;
  resetBuilder: () => void;
  
  // Circuit actions
  startCircuitMode: (config: CircuitConfig) => void;
  nextCircuitExercise: () => void;
  completeCircuitRound: () => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      // Initial State
      activeWorkout: null,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      isResting: false,
      restTimeRemaining: 0,
      
      workoutBuilder: {
        exercises: [],
        isDragging: false,
        selectedExercise: null,
        workoutName: '',
        workoutDescription: '',
      },
      
      circuitMode: {
        isActive: false,
        currentRound: 0,
        totalRounds: 0,
        currentExerciseInRound: 0,
      },
      
      // Actions
      startWorkout: (workout: Workout) => {
        // Sort exercises by order_index
        const sortedExercises = [...(workout.exercises || [])].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

        // Transform workout to session structure
        const session: WorkoutSession = {
          id: crypto.randomUUID(), // Temporary ID until saved
          workout_id: workout.id,
          user_id: workout.user_id,
          started_at: new Date().toISOString(),
          is_completed: false,
          workout: { ...workout, exercises: sortedExercises },
          exercises: sortedExercises.map(ex => {
            // If circuit, create sets for all rounds
            const totalSets = ex.is_circuit ? (ex.circuit_rounds || 1) : ex.sets_target;
            
            return {
              ...ex,
              sets: Array(totalSets).fill(null).map((_, i) => ({
                id: crypto.randomUUID(),
                workout_exercise_id: ex.id,
                set_number: i + 1,
                is_completed: false
              }))
            };
          })
        };
        
        set({
          activeWorkout: session,
          currentExerciseIndex: 0,
          currentSetIndex: 0,
          isResting: false
        });
      },
      
      completeSet: (reps, weight) => {
        const { activeWorkout, currentExerciseIndex, currentSetIndex } = get();
        if (!activeWorkout || !activeWorkout.exercises) return;
        
        const exercises = [...activeWorkout.exercises];
        const exercise = exercises[currentExerciseIndex];
        if (!exercise.sets) return;
        
        const sets = [...exercise.sets];
        
        // Mark current set as completed
        if (sets[currentSetIndex]) {
            sets[currentSetIndex] = {
              ...sets[currentSetIndex],
              reps_actual: reps,
              weight_actual: weight,
              is_completed: true,
              completed_at: new Date().toISOString()
            };
        }
        
        exercises[currentExerciseIndex] = { ...exercise, sets };
        
        // Logic for next step
        let nextExerciseIndex = currentExerciseIndex;
        let nextSetIndex = currentSetIndex;
        let shouldRest = false;

        const isCircuit = exercise.is_circuit || !!exercise.circuit_id;
        
        if (isCircuit && exercise.circuit_id) {
            // Circuit Logic
            // 1. Find all exercises in this circuit sorted by order
            // We need to look at the original workout exercises to find the order
            // But activeWorkout.exercises should preserve the order from startWorkout
            
            // Get all exercises belonging to this circuit
            const circuitExercises = exercises.filter(e => e.circuit_id === exercise.circuit_id);
            
            // Sort them by their order in the circuit to be safe
            circuitExercises.sort((a, b) => (a.order_in_circuit || 0) - (b.order_in_circuit || 0));
            
            // Identify current position
            const currentExId = exercise.id;
            const currentExIndexInCircuit = circuitExercises.findIndex(e => e.id === currentExId);
            
            // Current Round is represented by currentSetIndex (0-based)
            const currentRound = currentSetIndex;
            const totalRounds = exercise.circuit_rounds || 1;
            
            const isLastExerciseInCircuit = currentExIndexInCircuit === circuitExercises.length - 1;
            
            if (isLastExerciseInCircuit) {
                // We finished the last exercise of the circuit for this round
                
                if (currentRound < totalRounds - 1) {
                    // CASE 1: More rounds to go -> Loop back to First Exercise of Circuit, Next Round
                    const firstExInCircuit = circuitExercises[0];
                    
                    // Find the index of this exercise in the main exercises array
                    const firstExIndex = exercises.findIndex(e => e.id === firstExInCircuit.id);
                    
                    if (firstExIndex !== -1) {
                        nextExerciseIndex = firstExIndex;
                        nextSetIndex = currentRound + 1; // Advance round
                        shouldRest = true; // Rest between rounds
                    } else {
                        // Fallback: stay here if we can't find the first exercise
                        console.error("Could not find first exercise of circuit");
                    }
                } else {
                    // CASE 2: All rounds finished -> Move to the exercise AFTER the circuit
                    // The exercise after the circuit is the one at index (lastExIndexInMain + 1)
                    // We need to find where the last exercise of the circuit is in the main list
                    const lastExInCircuit = circuitExercises[circuitExercises.length - 1];
                    const lastExIndexMain = exercises.findIndex(e => e.id === lastExInCircuit.id);
                    
                    if (lastExIndexMain < exercises.length - 1) {
                        nextExerciseIndex = lastExIndexMain + 1;
                        nextSetIndex = 0; // Reset set index for new non-circuit exercise
                        shouldRest = true;
                        console.log(`Circuit Complete. Moving to next exercise: ${exercises[nextExerciseIndex].exercise?.name}`);
                    } else {
                        // Workout complete (no more exercises)
                        console.log("Workout Complete");
                        // We stay on current to show finished state or let user finish manually
                    }
                }
            } else {
                // CASE 3: Middle of circuit -> Move to Next Exercise in Circuit, Same Round
                const nextExInCircuit = circuitExercises[currentExIndexInCircuit + 1];
                nextExerciseIndex = exercises.findIndex(e => e.id === nextExInCircuit.id);
                nextSetIndex = currentRound; // Stay on same round index
                shouldRest = false; // Usually no rest between stations
                
                console.log(`Circuit Station Complete. Moving to: ${nextExInCircuit.exercise?.name} (Round ${currentRound + 1})`);
            }
            
        } else {
            // Standard Straight Sets Logic
            if (currentSetIndex < sets.length - 1) {
                nextSetIndex = currentSetIndex + 1;
                shouldRest = true;
            } else if (currentExerciseIndex < exercises.length - 1) {
                nextExerciseIndex = currentExerciseIndex + 1;
                nextSetIndex = 0;
                shouldRest = true;
            }
        }

        set({
          activeWorkout: { ...activeWorkout, exercises },
          currentExerciseIndex: nextExerciseIndex,
          currentSetIndex: nextSetIndex
        });
        
        if (shouldRest) {
            get().startRest(exercise.rest_seconds || 60);
        }
      },
      
      startRest: (seconds) => set({ isResting: true, restTimeRemaining: seconds }),
      completeRest: () => set({ isResting: false, restTimeRemaining: 0 }),
      updateRestTime: (time) => set({ restTimeRemaining: time }),
      
      goToNextExercise: () => {
        const { activeWorkout, currentExerciseIndex, currentSetIndex } = get();
        if (!activeWorkout || !activeWorkout.exercises) return;
        
        if (currentExerciseIndex < activeWorkout.exercises.length - 1) {
          const currentExercise = activeWorkout.exercises[currentExerciseIndex];
          const nextExercise = activeWorkout.exercises[currentExerciseIndex + 1];

          // Circuit Logic: If moving between stations in the SAME circuit, keep the current round (set index)
          if (currentExercise.is_circuit && currentExercise.circuit_id && 
              nextExercise.is_circuit && nextExercise.circuit_id === currentExercise.circuit_id) {
             set({ 
               currentExerciseIndex: currentExerciseIndex + 1,
               currentSetIndex: currentSetIndex,
               isResting: false
             });
             return;
          }

          set({ 
            currentExerciseIndex: currentExerciseIndex + 1,
            currentSetIndex: 0,
            isResting: false
          });
        }
      },
      
      goToPrevExercise: () => {
        const { activeWorkout, currentExerciseIndex, currentSetIndex } = get();
        if (!activeWorkout || !activeWorkout.exercises) return;

        if (currentExerciseIndex > 0) {
          const currentExercise = activeWorkout.exercises[currentExerciseIndex];
          const prevExercise = activeWorkout.exercises[currentExerciseIndex - 1];

          // Circuit Logic: If moving back to previous station in SAME circuit, keep the current round
          if (currentExercise.is_circuit && currentExercise.circuit_id && 
              prevExercise.is_circuit && prevExercise.circuit_id === currentExercise.circuit_id) {
             set({ 
               currentExerciseIndex: currentExerciseIndex - 1,
               currentSetIndex: currentSetIndex,
               isResting: false
             });
             return;
          }

          set({ 
            currentExerciseIndex: currentExerciseIndex - 1,
            currentSetIndex: 0, // Reset to first set
            isResting: false
          });
        }
      },
      
      completeWorkout: () => {
        const { activeWorkout } = get();
        if (activeWorkout) {
          const endDate = new Date();
          const startDate = new Date(activeWorkout.started_at);
          const durationSeconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);

          set({ 
            activeWorkout: { 
              ...activeWorkout, 
              is_completed: true,
              completed_at: endDate.toISOString(),
              total_duration_seconds: durationSeconds
            } 
          });
        }
      },
      
      cancelWorkout: () => {
        set({ activeWorkout: null });
      },
      
      // Builder Actions
      setWorkoutName: (name) => set(state => ({ 
        workoutBuilder: { ...state.workoutBuilder, workoutName: name } 
      })),
      
      setWorkoutDescription: (desc) => set(state => ({ 
        workoutBuilder: { ...state.workoutBuilder, workoutDescription: desc } 
      })),
      
      addExerciseToBuilder: (exercise) => {
        set(state => {
          const newExercise: WorkoutExercise = {
            id: crypto.randomUUID(),
            workout_id: '', // Set when saving
            exercise_id: exercise.id,
            exercise: exercise,
            order_index: state.workoutBuilder.exercises.length,
            sets_target: 3,
            reps_target: 10,
            weight_target: 0,
            rest_seconds: 60,
            is_superset: false,
            is_circuit: false
          };
          
          return {
            workoutBuilder: {
              ...state.workoutBuilder,
              exercises: [...state.workoutBuilder.exercises, newExercise]
            }
          };
        });
      },
      
      removeExerciseFromBuilder: (index) => {
        set(state => {
          const newExercises = [...state.workoutBuilder.exercises];
          newExercises.splice(index, 1);
          // Re-index
          newExercises.forEach((ex, i) => ex.order_index = i);
          
          return {
            workoutBuilder: { ...state.workoutBuilder, exercises: newExercises }
          };
        });
      },
      
      reorderExercises: (fromIndex, toIndex) => {
        set(state => {
          const newExercises = [...state.workoutBuilder.exercises];
          const [moved] = newExercises.splice(fromIndex, 1);
          newExercises.splice(toIndex, 0, moved);
          // Re-index
          newExercises.forEach((ex, i) => ex.order_index = i);
          
          return {
            workoutBuilder: { ...state.workoutBuilder, exercises: newExercises }
          };
        });
      },
      
      updateExerciseConfig: (index, config) => {
        set(state => {
          const newExercises = [...state.workoutBuilder.exercises];
          newExercises[index] = { ...newExercises[index], ...config };
          return {
            workoutBuilder: { ...state.workoutBuilder, exercises: newExercises }
          };
        });
      },

      createCircuit: (indices, rounds) => {
        set(state => {
          const exercises = [...state.workoutBuilder.exercises];
          const circuitId = crypto.randomUUID();
          
          indices.forEach((index, i) => {
            if (exercises[index]) {
              exercises[index] = {
                ...exercises[index],
                is_circuit: true,
                circuit_id: circuitId,
                circuit_rounds: rounds,
                order_in_circuit: i,
                sets_target: 1 // In circuits, usually 1 set per round
              };
            }
          });
          
          return {
            workoutBuilder: { ...state.workoutBuilder, exercises }
          };
        });
      },

      ungroupCircuit: (circuitId) => {
        set(state => {
          const exercises = state.workoutBuilder.exercises.map(ex => {
            if (ex.circuit_id === circuitId) {
              return {
                ...ex,
                is_circuit: false,
                circuit_id: undefined,
                circuit_rounds: undefined,
                order_in_circuit: undefined,
                sets_target: 3 // Default back to 3 sets
              };
            }
            return ex;
          });
          
          return {
            workoutBuilder: { ...state.workoutBuilder, exercises }
          };
        });
      },

      resetBuilder: () => {
        set({
          workoutBuilder: {
            exercises: [],
            isDragging: false,
            selectedExercise: null,
            workoutName: '',
            workoutDescription: '',
          }
        });
      },
      
      // Circuit Actions (simplified for now)
      startCircuitMode: (config) => {
        set({
          circuitMode: {
            isActive: true,
            currentRound: 1,
            totalRounds: config.rounds,
            currentExerciseInRound: 0
          }
        });
      },
      
      nextCircuitExercise: () => {
        // Logic to advance exercise or round
      },
      
      completeCircuitRound: () => {
        set(state => ({
          circuitMode: {
            ...state.circuitMode,
            currentRound: state.circuitMode.currentRound + 1,
            currentExerciseInRound: 0
          }
        }));
      }
    }),
    {
      name: 'workout-storage',
      partialize: (state) => ({ 
        activeWorkout: state.activeWorkout,
        workoutBuilder: state.workoutBuilder
      }),
    }
  )
);
