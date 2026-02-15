-- Create a function to join classroom by code that bypasses RLS
CREATE OR REPLACE FUNCTION join_classroom_by_code(
    p_student_id UUID,
    p_join_code TEXT
)
RETURNS UUID AS $$
DECLARE
    v_classroom_id UUID;
    v_existing_member UUID;
BEGIN
    -- Find classroom by join code (bypasses RLS due to SECURITY DEFINER)
    SELECT id INTO v_classroom_id
    FROM classrooms
    WHERE join_code = p_join_code
    AND is_active = true;

    IF v_classroom_id IS NULL THEN
        RAISE EXCEPTION 'Invalid join code or classroom not found';
    END IF;

    -- Check if already a member
    SELECT id INTO v_existing_member
    FROM classroom_members
    WHERE classroom_id = v_classroom_id
    AND student_id = p_student_id;

    IF v_existing_member IS NOT NULL THEN
        RAISE EXCEPTION 'You are already a member of this classroom';
    END IF;

    -- Insert member
    INSERT INTO classroom_members (classroom_id, student_id)
    VALUES (v_classroom_id, p_student_id);

    RETURN v_classroom_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION join_classroom_by_code(UUID, TEXT) TO authenticated;
