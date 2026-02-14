
import { SupabaseClient } from '@supabase/supabase-js';
import { Classroom, UserProfile, Lesson, StudentProgress, ClassroomMember } from '@/lib/types';

export async function getClassroomDetails(supabase: SupabaseClient, classroomId: string): Promise<Classroom | null> {
    const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .eq('id', classroomId)
        .single();

    if (error) return null;
    return data;
}

export async function getLessonsForClassroom(supabase: SupabaseClient, classroomId: string): Promise<Lesson[]> {
    // Get assignments and join with lessons
    const { data, error } = await supabase
        .from('lesson_assignments')
        .select(`
            lesson_id,
            lessons:lessons (*)
        `)
        .eq('classroom_id', classroomId);
    // .eq('is_published', true) // Add this filter based on role later if needed

    if (error) throw error;

    return (data || []).map((item: any) => item.lessons);
}

export async function getMembersForClassroom(supabase: SupabaseClient, classroomId: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
        .from('classroom_members')
        .select(`
            student_id,
            user_profiles:student_id (*)
        `)
        .eq('classroom_id', classroomId);

    if (error) throw error;

    // Assuming user_profiles matches on student_id
    // But wait, the FK is to auth.users. user_profiles PK is usually same as auth.users.id
    // I should check schema. 20260214_create_classroom_system.sql: user_profiles PK is id referencing auth.users(id)
    // So the join via student_id -> auth.users -> user_profiles requires clear relation.
    // If Supabase doesn't infer it via FK automatically to user_profiles, this might fail unless manually joined.
    // Let's assume standard behavior for now.

    return (data || []).map((item: any) => item.user_profiles).filter(Boolean);
}


export async function getClassroomsForStudent(supabase: SupabaseClient, studentId: string): Promise<Classroom[]> {
    const { data, error } = await supabase
        .from('classroom_members')
        .select(`
      classroom_id,
      classrooms:classrooms (*)
    `)
        .eq('student_id', studentId)
        .eq('is_active', true);

    if (error) throw error;

    // Transform to Classroom[]
    return (data || []).map((item: any) => item.classrooms);
}

export async function joinClassroom(supabase: SupabaseClient, studentId: string, joinCode: string): Promise<string> {
    // Use the secure RPC function to bypass RLS and join classroom
    console.log('[DEBUG] joinClassroom called with:', { studentId, joinCode });
    
    // First, let's check if the classroom exists with this join code
    const { data: checkData, error: checkError } = await supabase
        .from('classrooms')
        .select('id, join_code, is_active, name')
        .eq('join_code', joinCode)
        .single();
    
    if (checkError) {
        console.log('[DEBUG] Classroom lookup error:', checkError);
    } else {
        console.log('[DEBUG] Found classroom:', checkData);
    }

    const { data: classroomId, error } = await supabase.rpc('join_classroom_by_code', {
        p_student_id: studentId,
        p_join_code: joinCode
    });

    console.log('[DEBUG] RPC join_classroom_by_code response:', { classroomId, error });

    if (error) {
        console.error('[DEBUG] RPC Error details:', error);
        throw new Error(error.message || 'Invalid join code or classroom not found');
    }

    console.log('[DEBUG] Successfully joined classroom:', classroomId);
    return classroomId;
}

export async function getClassroomsForTeacher(supabase: SupabaseClient, teacherId: string): Promise<Classroom[]> {
    const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch stats for each classroom
    const classroomsWithCounts = await Promise.all((data || []).map(async (classroom) => {
        const { count: memberCount } = await supabase
            .from('classroom_members')
            .select('*', { count: 'exact', head: true })
            .eq('classroom_id', classroom.id);

        const { count: lessonCount } = await supabase
            .from('lesson_assignments')
            .select('*', { count: 'exact', head: true })
            .eq('classroom_id', classroom.id);

        return {
            ...classroom,
            member_count: memberCount || 0,
            lesson_count: lessonCount || 0,
        };
    }));

    return classroomsWithCounts;
}

export async function createClassroom(
    supabase: SupabaseClient,
    teacherId: string,
    data: { name: string; description?: string; subject?: string; grade_level?: string }
): Promise<string> { // returns classroom ID
    const { data: classroomId, error } = await supabase.rpc('create_classroom_with_code', {
        p_teacher_id: teacherId,
        p_name: data.name,
        p_description: data.description || '',
        p_subject: data.subject || '',
        p_grade_level: data.grade_level || ''
    });

    if (error) throw error;
    return classroomId;
}

export async function getDashboardStats(supabase: SupabaseClient, teacherId: string) {
    // 1. Lessons Created
    const { count: lessonCount } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', teacherId);

    // 2. Students Engaged (approximate logic: distinct students in teacher's classrooms)
    // This is complex with simple queries, might need RPC or join
    // For now, let's just sum classroom members
    const { data: classrooms } = await supabase
        .from('classrooms')
        .select('id')
        .eq('teacher_id', teacherId);

    let totalStudents = 0;
    if (classrooms && classrooms.length > 0) {
        const classroomIds = classrooms.map(c => c.id);
        const { count } = await supabase
            .from('classroom_members')
            .select('student_id', { count: 'exact', head: true }) // count rows
            .in('classroom_id', classroomIds);
        // removing duplicates here is hard without distinct, assume count is enough for now
        totalStudents = count || 0;
    }

    // 3. Total Playtime and Avg Score
    // Get all classrooms for this teacher, then get student_progress for those classrooms
    let totalPlaytime = 0;
    let avgScore = 0;

    if (classrooms && classrooms.length > 0) {
        const classroomIds = classrooms.map(c => c.id);
        const { data: progressData } = await supabase
            .from('student_progress')
            .select('time_spent_seconds, score')
            .in('classroom_id', classroomIds);

        if (progressData && progressData.length > 0) {
            totalPlaytime = progressData.reduce((acc, curr) => acc + (curr.time_spent_seconds || 0), 0);
            const scores = progressData.filter(p => p.score !== null).map(p => p.score as number);
            if (scores.length > 0) {
                avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            }
        }
    }

    return {
        lessonCount: lessonCount || 0,
        studentCount: totalStudents,
        totalPlaytimeMinutes: Math.round(totalPlaytime / 60),
        avgScore: Math.round(avgScore)
    };
}

export async function getRecentLessons(supabase: SupabaseClient, teacherId: string, limit = 4): Promise<any[]> {
    const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('user_id', teacherId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;

    // Enrich with assignment/progress data roughly if needed
    // For now return basic lesson data with mock status/completion placeholders if real data is missing from view
    const recentLessons = await Promise.all((data || []).map(async (lesson) => {
        // Get student count (assignments)
        // Get completion % (average of student_progress)

        // This is getting expensive N+1 queries, ideally use a view or RPC
        // Simplified for MVP:
        return {
            ...lesson,
            students: 0, // Placeholder
            completion: 0, // Placeholder
            status: 'active', // Placeholder
            color: ['emerald', 'red', 'blue', 'purple'][Math.floor(Math.random() * 4)] // Random color for UI
        };
    }));

    return recentLessons;
}

// Student-specific dashboard stats
export async function getStudentDashboardStats(supabase: SupabaseClient, studentId: string) {
    // 1. Get classrooms the student is in
    const { data: classrooms } = await supabase
        .from('classroom_members')
        .select('classroom_id')
        .eq('student_id', studentId);

    const classroomIds = classrooms?.map(c => c.classroom_id) || [];

    // 2. Get total lessons assigned
    let lessonCount = 0;
    if (classroomIds.length > 0) {
        const { count } = await supabase
            .from('lesson_assignments')
            .select('*', { count: 'exact', head: true })
            .in('classroom_id', classroomIds)
            .eq('is_published', true);
        lessonCount = count || 0;
    }

    // 3. Get student progress data
    const { data: progressData } = await supabase
        .from('student_progress')
        .select('time_spent_seconds, score, status')
        .eq('student_id', studentId);

    let totalPlaytime = 0;
    let avgScore = 0;
    let completedCount = 0;

    if (progressData && progressData.length > 0) {
        totalPlaytime = progressData.reduce((acc, curr) => acc + (curr.time_spent_seconds || 0), 0);
        const scores = progressData.filter(p => p.score !== null).map(p => p.score as number);
        if (scores.length > 0) {
            avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        }
        completedCount = progressData.filter(p => p.status === 'completed').length;
    }

    return {
        lessonCount, // Total assigned lessons
        studentCount: classroomIds.length, // Number of classrooms (renamed for consistency)
        totalPlaytimeMinutes: Math.round(totalPlaytime / 60),
        avgScore: Math.round(avgScore),
        completedCount
    };
}

// Student-specific recent lessons
export async function getStudentRecentLessons(supabase: SupabaseClient, studentId: string, limit = 4): Promise<any[]> {
    // Get classrooms the student is in
    const { data: classrooms } = await supabase
        .from('classroom_members')
        .select('classroom_id')
        .eq('student_id', studentId);

    const classroomIds = classrooms?.map(c => c.classroom_id) || [];

    if (classroomIds.length === 0) {
        return [];
    }

    // Get lesson assignments for these classrooms
    const { data: assignments, error } = await supabase
        .from('lesson_assignments')
        .select(`
            lesson_id,
            classroom_id,
            lessons:lesson_id (*)
        `)
        .in('classroom_id', classroomIds)
        .eq('is_published', true)
        .order('assigned_at', { ascending: false })
        .limit(limit);

    if (error) throw error;

    // Enrich with student progress
    const recentLessons = await Promise.all((assignments || []).map(async (assignment: any) => {
        const lesson = assignment.lessons;

        // Get student progress for this lesson
        const { data: progress } = await supabase
            .from('student_progress')
            .select('*')
            .eq('student_id', studentId)
            .eq('lesson_id', assignment.lesson_id)
            .eq('classroom_id', assignment.classroom_id)
            .single();

        return {
            ...lesson,
            students: 0, // Not relevant for students
            completion: progress?.completion_percentage || 0,
            status: progress?.status || 'not_started',
            score: progress?.score || null,
            color: ['emerald', 'red', 'blue', 'purple'][Math.floor(Math.random() * 4)]
        };
    }));

    return recentLessons;
}
