import { Exercise } from './exercise.types';

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_template: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  exercises?: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  exercise?: Exercise;
  order_index: number;
  sets_target: number;
  reps_target: number;
  weight_target?: number;
  rest_seconds: number;
  is_superset: boolean;
  is_circuit: boolean;
  circuit_id?: string;
  circuit_rounds?: number;
  order_in_circuit?: number;
  circuit_config?: Record<string, any>;
  sets?: ExerciseSet[];
}

export interface ExerciseSet {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  reps_actual?: number;
  weight_actual?: number;
  duration_seconds?: number;
  is_completed: boolean;
  completed_at?: string;
}

export interface WorkoutSession {
  id: string;
  workout_id: string;
  user_id: string;
  started_at: string;
  completed_at?: string;
  total_duration_seconds?: number;
  performance_data?: Record<string, any>;
  is_completed: boolean;
  workout?: Workout;
  exercises?: WorkoutExercise[]; // Populated with session data
}

export interface ExerciseConfig {
  sets_target?: number;
  reps_target?: number;
  weight_target?: number;
  rest_seconds?: number;
  is_superset?: boolean;
  is_circuit?: boolean;
  [key: string]: any;
}

export interface CircuitConfig {
  rounds: number;
  restBetweenRounds: number;
  exercises: string[]; // exercise IDs
}