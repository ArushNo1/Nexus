-- Create user profiles table to store role and additional info
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    school_name TEXT,
    grade_level TEXT, -- for students
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    grade_level TEXT,
    join_code TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classroom_members junction table
CREATE TABLE IF NOT EXISTS classroom_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(classroom_id, student_id)
);

-- Create lesson_assignments table (assign lessons to classrooms)
CREATE TABLE IF NOT EXISTS lesson_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    is_published BOOLEAN DEFAULT false,
    instructions TEXT,
    UNIQUE(lesson_id, classroom_id)
);

-- Create student_progress table
CREATE TABLE IF NOT EXISTS student_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    score DECIMAL,
    time_spent_seconds INTEGER DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0,
    last_played_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, lesson_id, classroom_id)
);

-- Create game_sessions table (track individual play sessions)
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    score DECIMAL,
    completed BOOLEAN DEFAULT false,
    session_data JSONB, -- store game-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher_id ON classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_join_code ON classrooms(join_code);
CREATE INDEX IF NOT EXISTS idx_classroom_members_classroom_id ON classroom_members(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_members_student_id ON classroom_members(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_assignments_classroom_id ON lesson_assignments(classroom_id);
CREATE INDEX IF NOT EXISTS idx_lesson_assignments_lesson_id ON lesson_assignments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_lesson_id ON student_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_classroom_id ON student_progress(classroom_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_student_id ON game_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_lesson_id ON game_sessions(lesson_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Teachers can view student profiles in their classrooms"
    ON user_profiles FOR SELECT
    USING (
        role = 'student' AND
        EXISTS (
            SELECT 1 FROM classroom_members cm
            JOIN classrooms c ON c.id = cm.classroom_id
            WHERE cm.student_id = user_profiles.id
            AND c.teacher_id = auth.uid()
        )
    );

-- RLS Policies for classrooms
CREATE POLICY "Teachers can view their own classrooms"
    ON classrooms FOR SELECT
    USING (teacher_id = auth.uid());

CREATE POLICY "Students can view classrooms they're in"
    ON classrooms FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM classroom_members
            WHERE classroom_members.classroom_id = classrooms.id
            AND classroom_members.student_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can create classrooms"
    ON classrooms FOR INSERT
    WITH CHECK (
        teacher_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'teacher'
        )
    );

CREATE POLICY "Teachers can update their own classrooms"
    ON classrooms FOR UPDATE
    USING (
        teacher_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'teacher'
        )
    );

CREATE POLICY "Teachers can delete their own classrooms"
    ON classrooms FOR DELETE
    USING (
        teacher_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'teacher'
        )
    );

-- RLS Policies for classroom_members
CREATE POLICY "Teachers can view members of their classrooms"
    ON classroom_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM classrooms
            WHERE classrooms.id = classroom_members.classroom_id
            AND classrooms.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Students can view their own classroom memberships"
    ON classroom_members FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Students can join classrooms"
    ON classroom_members FOR INSERT
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can add students to their classrooms"
    ON classroom_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM classrooms
            WHERE classrooms.id = classroom_members.classroom_id
            AND classrooms.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Students can leave classrooms"
    ON classroom_members FOR DELETE
    USING (student_id = auth.uid());

-- RLS Policies for lesson_assignments
CREATE POLICY "Teachers can view assignments for their classrooms"
    ON lesson_assignments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM classrooms
            WHERE classrooms.id = lesson_assignments.classroom_id
            AND classrooms.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Students can view assignments for their classrooms"
    ON lesson_assignments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM classroom_members
            WHERE classroom_members.classroom_id = lesson_assignments.classroom_id
            AND classroom_members.student_id = auth.uid()
        )
        AND is_published = true
    );

CREATE POLICY "Teachers can create assignments for their lessons and classrooms"
    ON lesson_assignments FOR INSERT
    WITH CHECK (
        assigned_by = auth.uid()
    );

CREATE POLICY "Teachers can update their own assignments"
    ON lesson_assignments FOR UPDATE
    USING (assigned_by = auth.uid());

CREATE POLICY "Teachers can delete their own assignments"
    ON lesson_assignments FOR DELETE
    USING (assigned_by = auth.uid());

-- RLS Policies for student_progress
CREATE POLICY "Students can view their own progress"
    ON student_progress FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Teachers can view progress of students in their classrooms"
    ON student_progress FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM classrooms
            WHERE classrooms.id = student_progress.classroom_id
            AND classrooms.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Students can insert their own progress"
    ON student_progress FOR INSERT
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own progress"
    ON student_progress FOR UPDATE
    USING (student_id = auth.uid());

-- RLS Policies for game_sessions
CREATE POLICY "Students can view their own game sessions"
    ON game_sessions FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Teachers can view game sessions in their classrooms"
    ON game_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM classrooms
            WHERE classrooms.id = game_sessions.classroom_id
            AND classrooms.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Students can create their own game sessions"
    ON game_sessions FOR INSERT
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own game sessions"
    ON game_sessions FOR UPDATE
    USING (student_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classrooms_updated_at
    BEFORE UPDATE ON classrooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_progress_updated_at
    BEFORE UPDATE ON student_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to generate random join code
CREATE OR REPLACE FUNCTION generate_join_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to create classroom with auto-generated join code
CREATE OR REPLACE FUNCTION create_classroom_with_code(
    p_teacher_id UUID,
    p_name TEXT,
    p_description TEXT,
    p_subject TEXT,
    p_grade_level TEXT
)
RETURNS UUID AS $$
DECLARE
    v_join_code TEXT;
    v_classroom_id UUID;
    v_attempts INTEGER := 0;
    v_max_attempts INTEGER := 10;
BEGIN
    LOOP
        v_join_code := generate_join_code();

        BEGIN
            INSERT INTO classrooms (teacher_id, name, description, subject, grade_level, join_code)
            VALUES (p_teacher_id, p_name, p_description, p_subject, p_grade_level, v_join_code)
            RETURNING id INTO v_classroom_id;

            EXIT;
        EXCEPTION WHEN unique_violation THEN
            v_attempts := v_attempts + 1;
            IF v_attempts >= v_max_attempts THEN
                RAISE EXCEPTION 'Failed to generate unique join code after % attempts', v_max_attempts;
            END IF;
        END;
    END LOOP;

    RETURN v_classroom_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
