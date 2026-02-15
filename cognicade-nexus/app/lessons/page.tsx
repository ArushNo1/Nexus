'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/sidebar';
import ChalkEquations from '@/components/ui/chalk-equations';
import { BookOpen, Play, Trash2, Users, Star, Plus } from 'lucide-react';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function LessonsPage() {
    const [loading, setLoading] = useState(true);
    const [lessons, setLessons] = useState<any[]>([]);
    const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);

    useEffect(() => {
        const loadLessons = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            setUserRole(profile?.role || null);

            if (profile?.role === 'teacher') {
                const { data } = await supabase
                    .from('lessons')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                setLessons(data || []);
            } else {
                // Student - get assigned lessons
                const { data: classrooms } = await supabase
                    .from('classroom_members')
                    .select('classroom_id')
                    .eq('student_id', user.id);

                const classroomIds = classrooms?.map(c => c.classroom_id) || [];

                if (classroomIds.length > 0) {
                    const { data: assignments } = await supabase
                        .from('lesson_assignments')
                        .select(`
                            lesson_id,
                            lessons:lesson_id (*)
                        `)
                        .in('classroom_id', classroomIds)
                        .eq('is_published', true);

                    setLessons((assignments || []).map((a: any) => a.lessons).filter(Boolean));
                }
            }

            setLoading(false);
        };

        loadLessons();
    }, []);

    return (
        <div className="min-h-screen bg-[#0a1f18] text-slate-100">
            {/* Global Styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;800&family=Press+Start+2P&display=swap');
                
                .font-pixel { font-family: 'Press Start 2P', cursive; }
                .font-serif-display { font-family: 'DM Serif Display', serif; }
                .font-sans-clean { font-family: 'Inter', sans-serif; }
            `}</style>

            <ChalkEquations />
            <Sidebar />

            <div
                className="min-h-screen transition-[margin] duration-300"
                style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}
            >

                <div className="px-8 py-12">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-serif-display text-white mb-2">
                                {userRole === 'teacher' ? 'My Lessons' : 'Assigned Lessons'}
                            </h1>
                            <p className="text-slate-400 font-sans-clean">
                                {userRole === 'teacher'
                                    ? 'View and manage all your created lessons'
                                    : 'View lessons assigned to you by your teachers'}
                            </p>
                        </div>
                        {userRole === 'teacher' && (
                            <Link href="/create">
                                <button className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] font-bold rounded-xl transition-all shadow-[0_4px_0_#065f46] hover:translate-y-[2px] hover:shadow-[0_2px_0_#065f46] active:translate-y-[4px] active:shadow-none text-sm font-sans-clean">
                                    <Plus size={18} />
                                    Create Lesson
                                </button>
                            </Link>
                        )}
                    </div>

                    {loading ? (
                        <p className="text-slate-400 font-sans-clean">Loading lessons...</p>
                    ) : lessons.length === 0 ? (
                        <div className="bg-[#0d281e] border border-emerald-500/20 rounded-2xl p-12 text-center">
                            <BookOpen className="mx-auto text-emerald-400 mb-4" size={48} />
                            <h3 className="text-white font-bold text-xl mb-2 font-sans-clean">
                                {userRole === 'teacher' ? 'No Lessons Created' : 'No Lessons Assigned'}
                            </h3>
                            <p className="text-slate-400 mb-4 font-sans-clean">
                                {userRole === 'teacher'
                                    ? 'Create lessons from within your classrooms'
                                    : 'Your teacher hasn\'t assigned any lessons yet'}
                            </p>
                            {userRole === 'teacher' && (
                                <Link href="/classrooms">
                                    <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] font-bold rounded-lg transition-all shadow-[0_4px_0_#065f46] hover:translate-y-[2px] hover:shadow-[0_2px_0_#065f46] active:translate-y-[4px] active:shadow-none font-sans-clean">
                                        Go to Classrooms
                                    </button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {lessons.map((lesson) => {
                                const colors = {
                                    text: 'text-emerald-400',
                                    bg: 'bg-emerald-500/10',
                                    border: 'border-emerald-500/20',
                                };

                                return (
                                    <div
                                        key={lesson.id}
                                        className={`group relative bg-[#0d281e] border ${colors.border} rounded-2xl p-6 hover:scale-[1.02] transition-all cursor-pointer overflow-hidden`}
                                    >
                                        <div className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white mb-1 font-sans-clean">{lesson.title}</h3>
                                                    <p className="text-slate-400 text-sm font-sans-clean">{lesson.subject || 'General'}</p>
                                                </div>
                                            </div>

                                            {lesson.description && (
                                                <p className="text-slate-400 text-sm mb-4 line-clamp-2 font-sans-clean">
                                                    {lesson.description}
                                                </p>
                                            )}

                                            <div className="mt-4 flex gap-3">
                                                <Link href={`/lessons/${lesson.id}`} className="flex-1">
                                                    <button className={`w-full flex items-center justify-center gap-2 px-4 py-2 ${colors.bg} ${colors.text} rounded-lg hover:bg-opacity-80 transition-all text-sm font-medium border ${colors.border} font-sans-clean`}>
                                                        <Play size={16} />
                                                        {userRole === 'teacher' ? 'View' : 'Launch'}
                                                    </button>
                                                </Link>
                                                {userRole === 'teacher' && (
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (!confirm('Are you sure you want to delete this lesson? This cannot be undone.')) return;
                                                            const supabase = createSupabaseClient();
                                                            await supabase.from('lessons').delete().eq('id', lesson.id);
                                                            setLessons(prev => prev.filter(l => l.id !== lesson.id));
                                                        }}
                                                        className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-sm font-medium border border-red-500/20"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
