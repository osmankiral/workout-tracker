
-- Add secondary_muscles column to exercises table
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS secondary_muscles TEXT[] DEFAULT '{}';

-- Update existing exercises with secondary muscles
UPDATE exercises SET secondary_muscles = '{Triceps, Shoulders}' WHERE name = 'Bench Press';
UPDATE exercises SET secondary_muscles = '{Glutes, Lower Back, Core}' WHERE name = 'Squat';
UPDATE exercises SET secondary_muscles = '{Hamstrings, Glutes, Forearms}' WHERE name = 'Deadlift';
UPDATE exercises SET secondary_muscles = '{Triceps, Upper Chest}' WHERE name = 'Overhead Press';
UPDATE exercises SET secondary_muscles = '{Biceps, Forearms}' WHERE name = 'Pull-up';
UPDATE exercises SET secondary_muscles = '{Triceps, Shoulders, Core}' WHERE name = 'Push-up';
UPDATE exercises SET secondary_muscles = '{Biceps, Rear Delts}' WHERE name = 'Dumbbell Row';
UPDATE exercises SET secondary_muscles = '{Glutes, Calves, Core}' WHERE name = 'Lunge';
UPDATE exercises SET secondary_muscles = '{Shoulders, Glutes}' WHERE name = 'Plank';
UPDATE exercises SET secondary_muscles = '{Legs, Core, Cardio}' WHERE name = 'Running';
UPDATE exercises SET secondary_muscles = '{Glutes, Calves, Cardio}' WHERE name = 'Cycling';
UPDATE exercises SET secondary_muscles = '{Legs, Chest, Shoulders, Core}' WHERE name = 'Burpees';
UPDATE exercises SET secondary_muscles = '{Legs, Shoulders, Cardio}' WHERE name = 'Jumping Jack';
UPDATE exercises SET secondary_muscles = '{Shoulders, Legs, Cardio}' WHERE name = 'Mountain Climber';
UPDATE exercises SET secondary_muscles = '{Upper Back}' WHERE name = 'Arm Circle';
UPDATE exercises SET secondary_muscles = '{Core, Glutes, Arms}' WHERE name = 'Goblet Squat';
UPDATE exercises SET secondary_muscles = '{Triceps, Upper Chest}' WHERE name = 'Dumbbell Shoulder Press';
UPDATE exercises SET secondary_muscles = '{Forearms}' WHERE name = 'Dumbbell Biceps Curl';
UPDATE exercises SET secondary_muscles = '{Shoulders, Glutes, Legs}' WHERE name = 'Side Plank';
UPDATE exercises SET secondary_muscles = '{Shoulders, Glutes, Legs}' WHERE name = 'Side Plank (Right)';
UPDATE exercises SET secondary_muscles = '{Shoulders, Glutes, Legs}' WHERE name = 'Side Plank (Left)';
UPDATE exercises SET secondary_muscles = '{Hip Flexors}' WHERE name = 'Bicycle Crunch';
UPDATE exercises SET secondary_muscles = '{Glutes, Core, Cardio}' WHERE name = 'Walking';
