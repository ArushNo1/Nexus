'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    BookOpen,
    Settings,
    ArrowLeft,
    Plus,
    Play,
    User
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/sidebar';
import ChalkEquations from '@/components/ui/chalk-equations';
import { createClient } from '@/lib/supabase/client';
import { Classroom, UserProfile, Lesson } from '@/lib/types';
import { getClassroomDetails, getLessonsForClassroom, getMembersForClassroom } from '@/lib/services/classrooms';
import { getUserProfile } from '@/lib/services/user';
import AssignLessonModal from '@/components/assign-lesson-modal';

export default function ClassroomDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: classroomId } = use(params);
    const router = useRouter();

    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [members, setMembers] = useState<UserProfile[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'lessons' | 'students'>('lessons');
    const [assignModalOpen, setAssignModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!classroomId) return;

            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push('/auth/login');
                    return;
                }

                const [profile, classData, lessonData, memberData] = await Promise.all([
                    getUserProfile(supabase, user.id),
                    getClassroomDetails(supabase, classroomId),
                    getLessonsForClassroom(supabase, classroomId),
                    getMembersForClassroom(supabase, classroomId)
                ]);

                if (!classData) {
                    // Handle 404 or access denied
                    alert('Classroom not found or access denied');
                    router.push('/classrooms');
                    return;
                }

                setUserProfile(profile);
                setClassroom(classData);
                setLessons(lessonData);
                setMembers(memberData);
            } catch (error) {
                console.error("Error loading classroom:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [classroomId, router]);

    const refreshLessons = async () => {
        try {
            const supabase = createClient();
            const lessonData = await getLessonsForClassroom(supabase, classroomId);
            setLessons(lessonData);
        } catch (error) {
            console.error('Error refreshing lessons:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a1f18] text-slate-100 flex items-center justify-center">
                <p>Loading classroom...</p>
            </div>
        );
    }

    if (!classroom) return null;

    const isTeacher = userProfile?.role === 'teacher';

    return (
        <div className="min-h-screen bg-[#0a1f18] text-slate-100">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;800&family=Press+Start+2P&display=swap');
                .font-pixel { font-family: 'Press Start 2P', cursive; }
                .font-serif-display { font-family: 'DM Serif Display', serif; }
                .font-sans-clean { font-family: 'Inter', sans-serif; }
            `}</style>

            <ChalkEquations />
            <Sidebar />

            <main
                id="main-content"
                className="min-h-screen transition-[margin] duration-300"
                style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}
            >
                {/* Top Bar */}
                <div className="bg-[#0d281e]/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
                    <div className="px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/classrooms" aria-label="Back to classrooms" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <ArrowLeft size={20} className="text-slate-400" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-serif-display text-white">{classroom.name}</h1>
                                <p className="text-sm text-slate-400 font-sans-clean">{classroom.subject} • Grade {classroom.grade_level}</p>
                            </div>
                        </div>

                        {isTeacher && (
                            <div className="flex items-center gap-3">
                                <button className="px-4 py-2 bg-slate-500/10 text-slate-400 rounded-lg hover:bg-slate-500/20 transition-all border border-slate-500/20 flex items-center gap-2 text-sm">
                                    <Settings size={16} />
                                    Settings
                                </button>
                                <button
                                    onClick={() => setAssignModalOpen(true)}
                                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] font-bold rounded-lg transition-all shadow-[0_2px_0_#065f46] hover:translate-y-[1px] hover:shadow-[0_1px_0_#065f46] flex items-center gap-2 text-sm"
                                >
                                    <Plus size={16} />
                                    Assign Lesson
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-8 py-8">
                    {/* Tabs */}
                    <div role="tablist" aria-label="Classroom sections" className="flex gap-8 border-b border-white/10 mb-8">
                        <button
                            role="tab"
                            aria-selected={activeTab === 'lessons'}
                            aria-controls="panel-lessons"
                            onClick={() => setActiveTab('lessons')}
                            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'lessons' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                        >
                            <div className="flex items-center gap-2">
                                <BookOpen size={18} />
                                Lessons
                                <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{lessons.length}</span>
                            </div>
                            {activeTab === 'lessons' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-t-full" />
                            )}
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === 'students'}
                            aria-controls="panel-students"
                            onClick={() => setActiveTab('students')}
                            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'students' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Users size={18} />
                                Students
                                <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{members.length}</span>
                            </div>
                            {activeTab === 'students' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-t-full" />
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    <div>
                        {activeTab === 'lessons' && (
                            <div id="panel-lessons" role="tabpanel" aria-labelledby="panel-lessons" className="space-y-4">
                                {lessons.length === 0 ? (
                                    <div className="text-center py-20 bg-[#0d281e] border border-emerald-500/20 rounded-2xl">
                                        <BookOpen size={48} className="text-slate-600 mx-auto mb-4" />
                                        <h3 className="text-xl text-white font-medium mb-2">No Lessons Yet</h3>
                                        <p className="text-slate-400 mb-6">
                                            {isTeacher ? "Assign your first lesson to this classroom." : "No lessons have been assigned yet."}
                                        </p>
                                        {isTeacher && (
                                            <button
                                                onClick={() => setAssignModalOpen(true)}
                                                className="px-5 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-all border border-emerald-500/20 font-medium"
                                            >
                                                Browse Library
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {lessons.map((lesson) => (
                                            <div key={lesson.id} className="bg-[#0d281e] border border-emerald-500/20 rounded-xl p-5 hover:border-emerald-500/40 transition-all group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{lesson.title}</h3>
                                                    <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded uppercase font-bold">Active</span>
                                                </div>
                                                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{lesson.subject || 'General'}</p>

                                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                    <span className="text-xs text-slate-500">
                                                        Added {new Date(lesson.created_at).toLocaleDateString()}
                                                    </span>
                                                    <button aria-label={`Play lesson: ${lesson.title}`} className="p-2 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-[#0d281e] transition-colors">
                                                        <Play size={16} fill="currentColor" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'students' && (
                            <div id="panel-students" role="tabpanel" aria-labelledby="panel-students" className="bg-[#0d281e] border border-emerald-500/20 rounded-2xl overflow-hidden">
                                {members.length === 0 ? (
                                    <div className="text-center py-20">
                                        <Users size={48} className="text-slate-600 mx-auto mb-4" />
                                        <h3 className="text-xl text-white font-medium mb-2">No Students Yet</h3>
                                        <p className="text-slate-400">Share user code: <span className="font-mono text-emerald-400 font-bold">{classroom.join_code}</span></p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 text-slate-400 text-sm uppercase">
                                            <tr>
                                                <th className="px-6 py-4 font-medium">Student</th>
                                                <th className="px-6 py-4 font-medium">Email</th>
                                                <th className="px-6 py-4 font-medium">Joined</th>
                                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {members.map((member) => (
                                                <tr key={member.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                                {member.avatar_url ? (
                                                                    <img src={member.avatar_url} alt="" className="w-full h-full rounded-full" />
                                                                ) : (
                                                                    <User size={14} />
                                                                )}
                                                            </div>
                                                            <span className="font-medium text-white">{member.full_name || 'Anonymous'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-400 text-sm">{member.email}</td>
                                                    <td className="px-6 py-4 text-slate-400 text-sm">
                                                        {new Date(member.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-slate-400 hover:text-white text-sm font-medium">
                                                            View Progress
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            {isTeacher && userProfile && (
                <AssignLessonModal
                    open={assignModalOpen}
                    onOpenChange={setAssignModalOpen}
                    classroomId={classroomId}
                    teacherId={userProfile.id}
                    assignedLessonIds={lessons.map((l) => l.id)}
                    onAssigned={refreshLessons}
                />
            )}
        </div>
    );
}
