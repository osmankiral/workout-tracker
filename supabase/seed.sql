
-- Insert Muscles
INSERT INTO muscles (name, slug) VALUES
('Chest', 'chest'),
('Back', 'back'),
('Legs', 'legs'),
('Shoulders', 'shoulders'),
('Arms', 'arms'),
('Biceps', 'biceps'),
('Triceps', 'triceps'),
('Core', 'core'),
('Cardio', 'cardio'),
('Full Body', 'fullbody'),
('Glutes', 'glutes'),
('Lower Back', 'lowerback'),
('Hamstrings', 'hamstrings'),
('Forearms', 'forearms'),
('Upper Chest', 'upperchest'),
('Rear Delts', 'reardelts'),
('Calves', 'calves'),
('Upper Back', 'upperback'),
('Hip Flexors', 'hipflexors'),
('Quadriceps', 'quadriceps'),
('Abs', 'abs'),
('Obliques', 'obliques')
ON CONFLICT (slug) DO NOTHING;

-- Insert Exercises
-- Bench Press
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level) 
VALUES ('Bench Press', 'strength', 'reps', 'barbell', 'Lie on a bench and press the weight up.', true, 'intermediate');

-- Squat
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level) 
VALUES ('Squat', 'strength', 'reps', 'barbell', 'Lower your hips from a standing position and then stand back up.', true, 'intermediate');

-- Deadlift
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level) 
VALUES ('Deadlift', 'strength', 'reps', 'barbell', 'Lift a loaded barbell off the ground to the level of the hips.', true, 'advanced');

-- Overhead Press
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level) 
VALUES ('Overhead Press', 'strength', 'reps', 'barbell', 'Press the weight from shoulder level to overhead.', true, 'intermediate');

-- Pull-up
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level) 
VALUES ('Pull-up', 'strength', 'reps', 'bodyweight', 'Pull yourself up until your chin is above the bar.', true, 'intermediate');

-- Push-up
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level) 
VALUES ('Push-up', 'strength', 'reps', 'bodyweight', 'Push your body up from the floor using your arms.', true, 'beginner');

-- Dumbbell Row
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level) 
VALUES ('Dumbbell Row', 'strength', 'reps', 'dumbbell', 'Row a dumbbell to your side while bent over.', true, 'beginner');

-- Lunge
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level) 
VALUES ('Lunge', 'strength', 'reps', 'dumbbell', 'Step forward with one leg and lower your hips.', true, 'beginner');

-- Plank
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level) 
VALUES ('Plank', 'core', 'time', 'bodyweight', 'Hold a push-up position with your weight on your forearms.', false, 'beginner');

-- Running
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level) 
VALUES ('Running', 'cardio', 'distance', NULL, 'Run at a steady pace.', true, 'beginner');

-- Cycling
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level) 
VALUES ('Cycling', 'cardio', 'distance', 'bicycle', 'Ride a bicycle or stationary bike.', true, 'beginner');

-- Burpees
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level) 
VALUES ('Burpees', 'plyometric', 'reps', 'bodyweight', 'A full body exercise used in strength training and as an aerobic exercise.', true, 'intermediate');

-- Jumping Jack
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level) 
VALUES ('Jumping Jack', 'cardio', 'time', 'bodyweight', 'A physical jumping exercise performed by jumping to a position with the legs spread wide and the hands going to the overhead position.', true, 'beginner');

-- Mountain Climber
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level) 
VALUES ('Mountain Climber', 'cardio', 'time', 'bodyweight', 'A bodyweight exercise that is useful for burning calories, building stamina, and strengthening the core.', true, 'intermediate');

-- Arm Circle
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level) 
VALUES ('Arm Circle', 'mobility', 'time', 'bodyweight', 'A simple exercise that targets the shoulders and arms.', false, 'beginner');

-- Goblet Squat
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level) 
VALUES ('Goblet Squat', 'strength', 'reps', 'dumbbell', 'A squat performed while holding a weight in front of the chest.', true, 'beginner');

-- Dumbbell Shoulder Press
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level) 
VALUES ('Dumbbell Shoulder Press', 'strength', 'reps', 'dumbbell', 'A shoulder exercise performed by pressing dumbbells overhead.', true, 'beginner');

-- Dumbbell Biceps Curl
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level) 
VALUES ('Dumbbell Biceps Curl', 'strength', 'reps', 'dumbbell', 'An arm exercise that targets the biceps.', false, 'beginner');

-- Side Plank (Right)
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level, is_unilateral) 
VALUES ('Side Plank (Right)', 'core', 'time', 'bodyweight', 'An exercise that targets the obliques and helps stabilize the core (Right Side).', false, 'intermediate', true);

-- Side Plank (Left)
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level, is_unilateral) 
VALUES ('Side Plank (Left)', 'core', 'time', 'bodyweight', 'An exercise that targets the obliques and helps stabilize the core (Left Side).', false, 'intermediate', true);

-- Bicycle Crunch
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level) 
VALUES ('Bicycle Crunch', 'core', 'reps', 'bodyweight', 'An abdominal exercise that targets the rectus abdominis and obliques.', false, 'beginner');

-- Walking
INSERT INTO exercises (name, exercise_type, execution_type, equipment, description, is_compound, difficulty_level) 
VALUES ('Walking', 'cardio', 'distance', NULL, 'A low-impact cardiovascular exercise.', true, 'beginner');


-- Link Muscles
DO $$
DECLARE
  e_id UUID;
  m_id UUID;
BEGIN
  -- Bench Press (Chest, Triceps, Shoulders)
  SELECT id INTO e_id FROM exercises WHERE name = 'Bench Press';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'chest';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('triceps', 'shoulders');

  -- Squat (Legs, Glutes, Lower Back, Core)
  SELECT id INTO e_id FROM exercises WHERE name = 'Squat';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'legs';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('glutes', 'lowerback', 'core');

  -- Deadlift (Back, Hamstrings, Glutes, Forearms)
  SELECT id INTO e_id FROM exercises WHERE name = 'Deadlift';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'back';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('hamstrings', 'glutes', 'forearms');

  -- Overhead Press (Shoulders, Triceps, Upper Chest)
  SELECT id INTO e_id FROM exercises WHERE name = 'Overhead Press';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'shoulders';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('triceps', 'upperchest');

  -- Pull-up (Back, Biceps, Forearms)
  SELECT id INTO e_id FROM exercises WHERE name = 'Pull-up';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'back';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('biceps', 'forearms');

  -- Push-up (Chest, Triceps, Shoulders, Core)
  SELECT id INTO e_id FROM exercises WHERE name = 'Push-up';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'chest';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('triceps', 'shoulders', 'core');
  
  -- Dumbbell Row (Back, Biceps, Rear Delts)
  SELECT id INTO e_id FROM exercises WHERE name = 'Dumbbell Row';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'back';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('biceps', 'reardelts');

  -- Lunge (Legs, Glutes, Calves, Core)
  SELECT id INTO e_id FROM exercises WHERE name = 'Lunge';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'legs';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('glutes', 'calves', 'core');

  -- Plank (Core, Shoulders, Glutes)
  SELECT id INTO e_id FROM exercises WHERE name = 'Plank';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'core';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('shoulders', 'glutes');
  
  -- Running (Full Body, Legs, Core, Cardio)
  SELECT id INTO e_id FROM exercises WHERE name = 'Running';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'fullbody';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('legs', 'core', 'cardio');
  
  -- Cycling (Legs, Glutes, Calves, Cardio)
  SELECT id INTO e_id FROM exercises WHERE name = 'Cycling';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'legs';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('glutes', 'calves', 'cardio');

  -- Burpees (Full Body, Legs, Chest, Shoulders, Core)
  SELECT id INTO e_id FROM exercises WHERE name = 'Burpees';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'fullbody';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('legs', 'chest', 'shoulders', 'core');

  -- Jumping Jack (Full Body, Legs, Shoulders, Cardio)
  SELECT id INTO e_id FROM exercises WHERE name = 'Jumping Jack';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'fullbody';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('legs', 'shoulders', 'cardio');

  -- Mountain Climber (Core, Shoulders, Legs, Cardio)
  SELECT id INTO e_id FROM exercises WHERE name = 'Mountain Climber';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'core';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('shoulders', 'legs', 'cardio');

  -- Arm Circle (Shoulders, Upper Back)
  SELECT id INTO e_id FROM exercises WHERE name = 'Arm Circle';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'shoulders';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('upperback');
  
  -- Goblet Squat (Legs, Core, Glutes, Arms)
  SELECT id INTO e_id FROM exercises WHERE name = 'Goblet Squat';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'legs';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('core', 'glutes', 'arms');

  -- Dumbbell Shoulder Press (Shoulders, Triceps, Upper Chest)
  SELECT id INTO e_id FROM exercises WHERE name = 'Dumbbell Shoulder Press';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'shoulders';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('triceps', 'upperchest');

  -- Dumbbell Biceps Curl (Biceps, Forearms)
  SELECT id INTO e_id FROM exercises WHERE name = 'Dumbbell Biceps Curl';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'biceps';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('forearms');

  -- Side Plank (Right) (Core, Shoulders, Glutes, Legs)
  SELECT id INTO e_id FROM exercises WHERE name = 'Side Plank (Right)';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'core';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('shoulders', 'glutes', 'legs');

  -- Side Plank (Left) (Core, Shoulders, Glutes, Legs)
  SELECT id INTO e_id FROM exercises WHERE name = 'Side Plank (Left)';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'core';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('shoulders', 'glutes', 'legs');

  -- Bicycle Crunch (Core, Hip Flexors)
  SELECT id INTO e_id FROM exercises WHERE name = 'Bicycle Crunch';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'core';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('hipflexors');

  -- Walking (Legs, Glutes, Core, Cardio)
  SELECT id INTO e_id FROM exercises WHERE name = 'Walking';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, TRUE FROM muscles WHERE slug = 'legs';
  INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
  SELECT e_id, id, FALSE FROM muscles WHERE slug IN ('glutes', 'core', 'cardio');

END $$;
