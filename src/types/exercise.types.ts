export type ExerciseType = 'strength' | 'cardio' | 'mobility' | 'core' | 'plyometric' | 'stretching';
export type ExecutionType = 'reps' | 'time' | 'distance' | 'interval';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  exercise_type: ExerciseType;
  execution_type: ExecutionType;
  muscles?: {
    name: string;
    is_primary: boolean;
  }[];
  // Deprecated fields kept for backward compatibility during migration if needed, but we should aim to remove them
  muscle_group?: string; 
  secondary_muscles?: string[];
  
  equipment?: string;
  description?: string;
  instructions?: string[] | any;
  is_custom: boolean;
  is_compound?: boolean;
  is_unilateral?: boolean;
  difficulty_level?: DifficultyLevel;
  created_at?: string;
}

export interface ExerciseLog {
  id: string;
  user_id: string;
  exercise_id: string;
  workout_session_id?: string;
  reps?: number;
  weight?: number;
  duration_seconds?: number;
  performed_at: string;
  metadata?: Record<string, any>;
}

export interface PRRecord {
  exercise_id: string;
  weight?: number;
  reps?: number;
  volume?: number;
  date: string;
}