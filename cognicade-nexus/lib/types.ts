
export interface UserProfile {
    id: string; // references auth.users(id)
    role: 'teacher' | 'student';
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    school_name: string | null;
    grade_level: string | null; // for students
    created_at: string;
    updated_at: string;
}

export interface Classroom {
    id: string;
    teacher_id: string; // references auth.users(id)
    name: string;
    description: string | null;
    subject: string | null;
    grade_level: string | null;
    join_code: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Join fields from other tables (optional based on query)
    member_count?: number;
    lesson_count?: number;
}

export interface ClassroomMember {
    id: string;
    classroom_id: string; // references classrooms(id)
    student_id: string; // references auth.users(id)
    joined_at: string;
    is_active: boolean;
}

export interface Lesson {
    id: string;
    user_id: string; // references auth.users(id)
    title: string;
    subject: string | null;
    grade_level: string | null;
    objectives: string[] | null;
    content: any | null; // JSONB
    thumbnail_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface LessonAssignment {
    id: string;
    lesson_id: string; // references lessons(id)
    classroom_id: string; // references classrooms(id)
    assigned_by: string; // references auth.users(id)
    assigned_at: string;
    due_date: string | null;
    is_published: boolean;
    instructions: string | null;
}

export interface StudentProgress {
    id: string;
    student_id: string; // references auth.users(id)
    lesson_id: string; // references lessons(id)
    classroom_id: string; // references classrooms(id)
    status: 'not_started' | 'in_progress' | 'completed';
    score: number | null; // DECIMAL
    time_spent_seconds: number;
    completion_percentage: number;
    last_played_at: string | null;
    completed_at: string | null;
    attempts: number;
    created_at: string;
    updated_at: string;
}

export interface GameSession {
    id: string;
    student_id: string; // references auth.users(id)
    lesson_id: string; // references lessons(id)
    classroom_id: string | null; // references classrooms(id)
    started_at: string;
    ended_at: string | null;
    duration_seconds: number | null;
    score: number | null; // DECIMAL
    completed: boolean;
    session_data: any | null; // JSONB
    created_at: string;
}
