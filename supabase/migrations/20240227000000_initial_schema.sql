-- Users table (managed by Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    subscription_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workouts table
CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_template BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_is_template ON workouts(is_template);

-- Exercises table
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('strength', 'cardio', 'time-based', 'circuit')),
    muscle_group TEXT,
    equipment TEXT,
    description TEXT,
    instructions JSONB DEFAULT '[]',
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout exercises junction table
CREATE TABLE workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    sets_target INTEGER DEFAULT 3,
    reps_target INTEGER DEFAULT 10,
    weight_target DECIMAL(5,2),
    rest_seconds INTEGER DEFAULT 60,
    is_superset BOOLEAN DEFAULT false,
    is_circuit BOOLEAN DEFAULT false,
    circuit_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);

-- Exercise sets tracking
CREATE TABLE exercise_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_exercise_id UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    reps_actual INTEGER,
    weight_actual DECIMAL(5,2),
    duration_seconds INTEGER,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_exercise_sets_workout_exercise_id ON exercise_sets(workout_exercise_id);

-- Workout sessions
CREATE TABLE workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    total_duration_seconds INTEGER,
    performance_data JSONB DEFAULT '{}',
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_workout_id ON workout_sessions(workout_id);
CREATE INDEX idx_workout_sessions_completed_at ON workout_sessions(completed_at);

-- Exercise logs for analytics
CREATE TABLE exercise_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    workout_session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
    reps INTEGER,
    weight DECIMAL(5,2),
    duration_seconds INTEGER,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_exercise_logs_user_id ON exercise_logs(user_id);
CREATE INDEX idx_exercise_logs_exercise_id ON exercise_logs(exercise_id);
CREATE INDEX idx_exercise_logs_performed_at ON exercise_logs(performed_at);

-- Body measurements
CREATE TABLE body_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    measurements JSONB DEFAULT '{}',
    recorded_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_body_measurements_user_id ON body_measurements(user_id);
CREATE INDEX idx_body_measurements_recorded_date ON body_measurements(recorded_date);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Workouts policies
CREATE POLICY "Users can view own workouts" ON workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own workouts" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON workouts FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other tables (simplified for brevity, ensuring user ownership)
CREATE POLICY "Users can view own workout exercises" ON workout_exercises FOR SELECT USING (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid()));
CREATE POLICY "Users can create own workout exercises" ON workout_exercises FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid()));
CREATE POLICY "Users can update own workout exercises" ON workout_exercises FOR UPDATE USING (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid()));
CREATE POLICY "Users can delete own workout exercises" ON workout_exercises FOR DELETE USING (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid()));

CREATE POLICY "Users can view own exercise sets" ON exercise_sets FOR SELECT USING (EXISTS (SELECT 1 FROM workout_exercises JOIN workouts ON workouts.id = workout_exercises.workout_id WHERE workout_exercises.id = exercise_sets.workout_exercise_id AND workouts.user_id = auth.uid()));
CREATE POLICY "Users can create own exercise sets" ON exercise_sets FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM workout_exercises JOIN workouts ON workouts.id = workout_exercises.workout_id WHERE workout_exercises.id = exercise_sets.workout_exercise_id AND workouts.user_id = auth.uid()));
CREATE POLICY "Users can update own exercise sets" ON exercise_sets FOR UPDATE USING (EXISTS (SELECT 1 FROM workout_exercises JOIN workouts ON workouts.id = workout_exercises.workout_id WHERE workout_exercises.id = exercise_sets.workout_exercise_id AND workouts.user_id = auth.uid()));
CREATE POLICY "Users can delete own exercise sets" ON exercise_sets FOR DELETE USING (EXISTS (SELECT 1 FROM workout_exercises JOIN workouts ON workouts.id = workout_exercises.workout_id WHERE workout_exercises.id = exercise_sets.workout_exercise_id AND workouts.user_id = auth.uid()));

CREATE POLICY "Users can view own workout sessions" ON workout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own workout sessions" ON workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout sessions" ON workout_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout sessions" ON workout_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own exercise logs" ON exercise_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own exercise logs" ON exercise_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exercise logs" ON exercise_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own exercise logs" ON exercise_logs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own body measurements" ON body_measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own body measurements" ON body_measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own body measurements" ON body_measurements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own body measurements" ON body_measurements FOR DELETE USING (auth.uid() = user_id);

-- Exercises policies (public read, admin write - assuming authenticated users can view all standard exercises)
-- Note: is_custom flag logic can be added later
CREATE POLICY "Authenticated users can view all exercises" ON exercises FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anon users can view all exercises" ON exercises FOR SELECT TO anon USING (true);

-- Grant permissions
GRANT SELECT ON users TO anon;
GRANT ALL ON users TO authenticated;
GRANT SELECT ON workouts TO anon;
GRANT ALL ON workouts TO authenticated;
GRANT SELECT ON exercises TO anon;
GRANT ALL ON exercises TO authenticated;
GRANT SELECT ON workout_exercises TO anon;
GRANT ALL ON workout_exercises TO authenticated;
GRANT SELECT ON exercise_sets TO anon;
GRANT ALL ON exercise_sets TO authenticated;
GRANT SELECT ON workout_sessions TO anon;
GRANT ALL ON workout_sessions TO authenticated;
GRANT SELECT ON exercise_logs TO anon;
GRANT ALL ON exercise_logs TO authenticated;
GRANT SELECT ON body_measurements TO anon;
GRANT ALL ON body_measurements TO authenticated;