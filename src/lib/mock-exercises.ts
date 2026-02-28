import { Exercise } from "@/types/exercise.types";

export const MOCK_EXERCISES: Exercise[] = [
  {
    id: "1",
    name: "Bench Press",
    description: "Compound chest exercise",
    exercise_type: "strength",
    execution_type: "reps",
    muscle_group: "chest",
    secondary_muscles: ["triceps", "shoulders"],
    equipment: "barbell",
    instructions: [],
    is_custom: false,
    is_compound: true,
    difficulty_level: 'intermediate',
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "Squat",
    description: "Compound leg exercise",
    exercise_type: "strength",
    execution_type: "reps",
    muscle_group: "legs",
    secondary_muscles: ["glutes", "core"],
    equipment: "barbell",
    instructions: [],
    is_custom: false,
    is_compound: true,
    difficulty_level: 'intermediate',
    created_at: new Date().toISOString()
  },
  {
    id: "3",
    name: "Deadlift",
    description: "Compound back/leg exercise",
    exercise_type: "strength",
    execution_type: "reps",
    muscle_group: "back",
    secondary_muscles: ["legs", "core"],
    equipment: "barbell",
    instructions: [],
    is_custom: false,
    is_compound: true,
    difficulty_level: 'advanced',
    created_at: new Date().toISOString()
  },
  {
    id: "4",
    name: "Pull Up",
    description: "Bodyweight back exercise",
    exercise_type: "strength",
    execution_type: "reps",
    muscle_group: "back",
    secondary_muscles: ["biceps"],
    equipment: "bodyweight",
    instructions: [],
    is_custom: false,
    is_compound: true,
    difficulty_level: 'intermediate',
    created_at: new Date().toISOString()
  },
  {
    id: "5",
    name: "Dumbbell Shoulder Press",
    description: "Compound shoulder exercise",
    exercise_type: "strength",
    execution_type: "reps",
    muscle_group: "shoulders",
    secondary_muscles: ["triceps"],
    equipment: "dumbbell",
    instructions: [],
    is_custom: false,
    is_compound: true,
    difficulty_level: 'intermediate',
    created_at: new Date().toISOString()
  }
];
