-- Fix infinite recursion in lesson_assignments RLS policies
-- This migration adds a trigger to validate permissions without RLS circular dependencies

-- Create a function to validate lesson_assignments before insert/update
CREATE OR REPLACE FUNCTION validate_lesson_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- Verify the lesson exists and belongs to the current user
    IF NOT EXISTS (
        SELECT 1 FROM lessons
        WHERE lessons.id = NEW.lesson_id
        AND lessons.user_id = NEW.assigned_by
    ) THEN
        RAISE EXCEPTION 'Lesson not found or does not belong to the user';
    END IF;

    -- Verify the classroom exists and belongs to the current user
    IF NOT EXISTS (
        SELECT 1 FROM classrooms
        WHERE classrooms.id = NEW.classroom_id
        AND classrooms.teacher_id = NEW.assigned_by
    ) THEN
        RAISE EXCEPTION 'Classroom not found or does not belong to the user';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_lesson_assignment_trigger ON lesson_assignments;
CREATE TRIGGER validate_lesson_assignment_trigger
    BEFORE INSERT OR UPDATE ON lesson_assignments
    FOR EACH ROW
    EXECUTE FUNCTION validate_lesson_assignment();
