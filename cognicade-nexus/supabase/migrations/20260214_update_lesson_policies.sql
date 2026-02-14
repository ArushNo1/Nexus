-- Update RLS policies for lessons to allow student access to assigned lessons

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own lessons" ON lessons;

-- Recreate policies with student access
CREATE POLICY "Teachers can view their own lessons"
    ON lessons FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Students can view assigned lessons"
    ON lessons FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM lesson_assignments la
            JOIN classroom_members cm ON cm.classroom_id = la.classroom_id
            WHERE la.lesson_id = lessons.id
            AND cm.student_id = auth.uid()
            AND la.is_published = true
        )
    );

-- Update video policies to allow students to view videos for assigned lessons
DROP POLICY IF EXISTS "Users can view their own videos" ON videos;

CREATE POLICY "Teachers can view their own videos"
    ON videos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Students can view videos for assigned lessons"
    ON videos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM lesson_assignments la
            JOIN classroom_members cm ON cm.classroom_id = la.classroom_id
            WHERE la.lesson_id = videos.lesson_id
            AND cm.student_id = auth.uid()
            AND la.is_published = true
        )
    );
