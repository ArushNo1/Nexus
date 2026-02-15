-- Fix infinite recursion in lesson_assignments RLS policies
-- The issue: policies on `lessons` query `lesson_assignments`, and policies on
-- `lesson_assignments` indirectly trigger evaluation of `lessons` policies,
-- creating a circular dependency during RLS evaluation.
--
-- Solution: Use SECURITY DEFINER helper functions that bypass RLS for the
-- permission checks within policies.

-- Helper: Check if a user is the teacher of a given classroom (bypasses RLS)
CREATE OR REPLACE FUNCTION is_classroom_teacher(p_classroom_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM classrooms
        WHERE id = p_classroom_id
        AND teacher_id = p_user_id
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: Check if a user is a member of a given classroom (bypasses RLS)
CREATE OR REPLACE FUNCTION is_classroom_member(p_classroom_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM classroom_members
        WHERE classroom_id = p_classroom_id
        AND student_id = p_user_id
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: Check if a lesson is assigned to any classroom the student is in (bypasses RLS)
CREATE OR REPLACE FUNCTION is_lesson_assigned_to_student(p_lesson_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM lesson_assignments la
        JOIN classroom_members cm ON cm.classroom_id = la.classroom_id
        WHERE la.lesson_id = p_lesson_id
        AND cm.student_id = p_user_id
        AND la.is_published = true
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- Fix lesson_assignments policies
-- ============================================================

DROP POLICY IF EXISTS "Teachers can view assignments for their classrooms" ON lesson_assignments;
DROP POLICY IF EXISTS "Students can view assignments for their classrooms" ON lesson_assignments;
DROP POLICY IF EXISTS "Teachers can create assignments for their lessons and classrooms" ON lesson_assignments;
DROP POLICY IF EXISTS "Teachers can update their own assignments" ON lesson_assignments;
DROP POLICY IF EXISTS "Teachers can delete their own assignments" ON lesson_assignments;

CREATE POLICY "Teachers can view assignments for their classrooms"
    ON lesson_assignments FOR SELECT
    USING (is_classroom_teacher(classroom_id, auth.uid()));

CREATE POLICY "Students can view assignments for their classrooms"
    ON lesson_assignments FOR SELECT
    USING (
        is_classroom_member(classroom_id, auth.uid())
        AND is_published = true
    );

CREATE POLICY "Teachers can create assignments"
    ON lesson_assignments FOR INSERT
    WITH CHECK (
        assigned_by = auth.uid()
        AND is_classroom_teacher(classroom_id, auth.uid())
    );

CREATE POLICY "Teachers can update their own assignments"
    ON lesson_assignments FOR UPDATE
    USING (assigned_by = auth.uid());

CREATE POLICY "Teachers can delete their own assignments"
    ON lesson_assignments FOR DELETE
    USING (assigned_by = auth.uid());

-- ============================================================
-- Fix lessons policies that reference lesson_assignments
-- ============================================================

DROP POLICY IF EXISTS "Students can view assigned lessons" ON lessons;

CREATE POLICY "Students can view assigned lessons"
    ON lessons FOR SELECT
    USING (is_lesson_assigned_to_student(id, auth.uid()));

-- ============================================================
-- Fix videos policies that reference lesson_assignments
-- ============================================================

DROP POLICY IF EXISTS "Students can view videos for assigned lessons" ON videos;

CREATE POLICY "Students can view videos for assigned lessons"
    ON videos FOR SELECT
    USING (is_lesson_assigned_to_student(lesson_id, auth.uid()));
