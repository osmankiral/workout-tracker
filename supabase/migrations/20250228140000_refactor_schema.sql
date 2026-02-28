
-- Create muscles table
CREATE TABLE IF NOT EXISTS muscles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exercise_muscles table
CREATE TABLE IF NOT EXISTS exercise_muscles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  muscle_id UUID REFERENCES muscles(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(exercise_id, muscle_id)
);

-- Add new columns to exercises table
ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS exercise_type TEXT CHECK (exercise_type IN ('strength', 'cardio', 'mobility', 'core', 'plyometric', 'stretching')),
ADD COLUMN IF NOT EXISTS execution_type TEXT CHECK (execution_type IN ('reps', 'time', 'distance', 'interval')),
ADD COLUMN IF NOT EXISTS difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'intermediate',
ADD COLUMN IF NOT EXISTS is_compound BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_unilateral BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS default_rest_seconds INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS default_sets INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS default_reps INTEGER DEFAULT 10;

-- 4. Circuit/Superset Support (Round System)
ALTER TABLE workout_exercises 
ADD COLUMN IF NOT EXISTS is_circuit BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS circuit_id UUID, -- Group ID for exercises in the same circuit
ADD COLUMN IF NOT EXISTS circuit_rounds INTEGER DEFAULT 1, -- Total rounds for this circuit
ADD COLUMN IF NOT EXISTS order_in_circuit INTEGER; -- Order within the circuit

-- Populate muscles table
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
ON CONFLICT (name) DO NOTHING;

-- Function to migrate data
DO $$
DECLARE
  r RECORD;
  m_id UUID;
  muscle_name TEXT;
BEGIN
  FOR r IN SELECT * FROM exercises LOOP
    -- Migrate primary muscle
    IF r.muscle_group IS NOT NULL THEN
      -- Map old muscle names to new standardized names if necessary
      muscle_name := r.muscle_group;
      
      SELECT id INTO m_id FROM muscles WHERE name ILIKE muscle_name OR slug ILIKE muscle_name LIMIT 1;
      
      IF m_id IS NOT NULL THEN
        INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
        VALUES (r.id, m_id, TRUE)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;

    -- Migrate secondary muscles
    IF r.secondary_muscles IS NOT NULL THEN
      FOREACH muscle_name IN ARRAY r.secondary_muscles LOOP
        SELECT id INTO m_id FROM muscles WHERE name ILIKE muscle_name OR slug ILIKE muscle_name LIMIT 1;
        
        IF m_id IS NOT NULL THEN
          INSERT INTO exercise_muscles (exercise_id, muscle_id, is_primary)
          VALUES (r.id, m_id, FALSE)
          ON CONFLICT DO NOTHING;
        END IF;
      END LOOP;
    END IF;

    -- Update exercise_type based on old category
    IF r.category = 'strength' THEN
      UPDATE exercises SET exercise_type = 'strength', execution_type = 'reps' WHERE id = r.id;
    ELSIF r.category = 'cardio' THEN
      UPDATE exercises SET exercise_type = 'cardio', execution_type = 'time' WHERE id = r.id;
    ELSIF r.category = 'time-based' THEN
      UPDATE exercises SET exercise_type = 'strength', execution_type = 'time' WHERE id = r.id;
    ELSIF r.category = 'circuit' THEN
      UPDATE exercises SET exercise_type = 'strength', execution_type = 'interval' WHERE id = r.id;
    END IF;

    -- Set specific exercise types/execution types for known exercises
    IF r.name ILIKE '%Running%' OR r.name ILIKE '%Cycling%' OR r.name ILIKE '%Walking%' THEN
      UPDATE exercises SET exercise_type = 'cardio', execution_type = 'distance' WHERE id = r.id;
    END IF;
    
    IF r.name ILIKE '%Plank%' THEN
      UPDATE exercises SET execution_type = 'time' WHERE id = r.id;
    END IF;

  END LOOP;
END $$;
