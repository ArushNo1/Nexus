'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Copy,
    Settings,
    BookOpen,
    CheckCircle,
    XCircle,
    UserPlus
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/sidebar';
import { createClient } from '@/lib/supabase/client';
import { Classroom, UserProfile } from '@/lib/types';
import { getClassroomsForTeacher, createClassroom, getClassroomsForStudent, joinClassroom } from '@/lib/services/classrooms';
import { getUserProfile } from '@/lib/services/user';

export default function ClassroomsPage() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        subject: '',
        grade_level: ''
    });
    const [joinCode, setJoinCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const init = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            // Fetch profile
            const profile = await getUserProfile(supabase, user.id);
            setUserProfile(profile);

            // Fetch classrooms based on role
            // If profile is missing (e.g. old user), default to student or handle error
            // Assuming profile exists or we fallback
            const role = profile?.role || 'student';

            try {
                if (role === 'teacher') {
                    const data = await getClassroomsForTeacher(supabase, user.id);
                    setClassrooms(data);
                } else {
                    const data = await getClassroomsForStudent(supabase, user.id);
                    setClassrooms(data);
                }
            } catch (error) {
                console.error("Error fetching classrooms:", error);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const handleCreateClassroom = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('Not authenticated');

            await createClassroom(supabase, user.id, {
                name: formData.name,
                description: formData.description,
                subject: formData.subject,
                grade_level: formData.grade_level
            });

            setFormData({ name: '', description: '', subject: '', grade_level: '' });
            setShowCreateModal(false);

            // Refresh
            const data = await getClassroomsForTeacher(supabase, user.id);
            setClassrooms(data);
        } catch (error) {
            console.error('Error creating classroom:', error);
            alert('Failed to create classroom. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleJoinClassroom = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            console.log('[DEBUG] Attempting to join classroom with code:', joinCode.toUpperCase());
            console.log('[DEBUG] Student ID:', user.id);

            await joinClassroom(supabase, user.id, joinCode.toUpperCase());

            setJoinCode('');
            setShowJoinModal(false);

            // Refresh
            const data = await getClassroomsForStudent(supabase, user.id);
            setClassrooms(data);
            alert('Successfully joined classroom!');
        } catch (error: any) {
            console.error('[DEBUG] Error joining classroom:', error);
            console.error('[DEBUG] Error message:', error?.message);
            console.error('[DEBUG] Error details:', JSON.stringify(error, null, 2));
            alert(error.message || 'Failed to join classroom.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyJoinCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const isTeacher = userProfile?.role === 'teacher';

    return (
        <div className="min-h-screen bg-[#0a1f18] text-slate-100">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;800&family=Press+Start+2P&display=swap');
                .font-pixel { font-family: 'Press Start 2P', cursive; }
                .font-serif-display { font-family: 'DM Serif Display', serif; }
                .font-sans-clean { font-family: 'Inter', sans-serif; }
            `}</style>

            <Sidebar />

            <div className="ml-64 min-h-screen">
                {/* Top Bar */}
                <div className="bg-[#0d281e]/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
                    <div className="px-8 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-serif-display text-white">My Classrooms</h1>

                        {isTeacher ? (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] font-bold rounded-lg transition-all shadow-[0_2px_0_#065f46] hover:translate-y-[1px] hover:shadow-[0_1px_0_#065f46]"
                            >
                                <Plus size={18} />
                                Create Classroom
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowJoinModal(true)}
                                className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] font-bold rounded-lg transition-all shadow-[0_2px_0_#065f46] hover:translate-y-[1px] hover:shadow-[0_1px_0_#065f46]"
                            >
                                <UserPlus size={18} />
                                Join Classroom
                            </button>
                        )}
                    </div>
                </div>

                <div className="px-8 py-12">
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-slate-400">Loading classrooms...</p>
                        </div>
                    ) : classrooms.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="mb-6">
                                <Users size={64} className="text-slate-600 mx-auto mb-4" />
                                <h2 className="text-2xl font-serif-display text-white mb-2">No Classrooms Yet</h2>
                                <p className="text-slate-400 mb-6">
                                    {isTeacher
                                        ? "Create your first classroom to get started!"
                                        : "Join a classroom to see your lessons!"}
                                </p>
                                {isTeacher ? (
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] font-bold rounded-lg transition-all"
                                    >
                                        Create Your First Classroom
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowJoinModal(true)}
                                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] font-bold rounded-lg transition-all"
                                    >
                                        Join a Classroom
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {classrooms.map((classroom) => (
                                <div
                                    key={classroom.id}
                                    className="bg-[#0d281e] border border-emerald-500/20 rounded-2xl p-6 hover:scale-[1.02] transition-all cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-white mb-1 font-sans-clean">{classroom.name}</h3>
                                            <p className="text-slate-400 text-sm">{classroom.subject} • Grade {classroom.grade_level}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${classroom.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                            {classroom.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                        </div>
                                    </div>

                                    {classroom.description && (
                                        <p className="text-slate-300 text-sm mb-4 line-clamp-2">{classroom.description}</p>
                                    )}

                                    {/* Stats - Only visible to teachers normally, but let's show basic info */}
                                    <div className="flex gap-4 mb-4 text-sm">
                                        {isTeacher && (
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Users size={16} />
                                                <span>{classroom.member_count || 0} students</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <BookOpen size={16} />
                                            <span>{classroom.lesson_count || 0} lessons</span>
                                        </div>
                                    </div>

                                    {/* Join Code - Only for Teacher */}
                                    {isTeacher && (
                                        <div className="bg-black/20 rounded-lg p-3 mb-4">
                                            <p className="text-xs text-slate-500 mb-1">Join Code</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-bold font-pixel text-emerald-400 tracking-wider">
                                                    {classroom.join_code}
                                                </span>
                                                <button
                                                    onClick={() => copyJoinCode(classroom.join_code)}
                                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                                    title="Copy join code"
                                                >
                                                    {copiedCode === classroom.join_code ? (
                                                        <CheckCircle size={18} className="text-emerald-400" />
                                                    ) : (
                                                        <Copy size={18} className="text-slate-400" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link href={`/classrooms/${classroom.id}`} className="flex-1">
                                            <button className="w-full px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-all text-sm font-medium border border-emerald-500/20">
                                                {isTeacher ? 'Manage' : 'View Lessons'}
                                            </button>
                                        </Link>
                                        {isTeacher && (
                                            <button className="px-4 py-2 bg-slate-500/10 text-slate-400 rounded-lg hover:bg-slate-500/20 transition-all border border-slate-500/20">
                                                <Settings size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Classroom Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#0d281e] border border-emerald-500/20 rounded-2xl p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-serif-display text-white mb-6">Create New Classroom</h2>
                        <form onSubmit={handleCreateClassroom}>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Classroom Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                                        placeholder="e.g., Period 3 History"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Subject *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                                        placeholder="e.g., World History"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Grade Level *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.grade_level}
                                        onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                                        placeholder="e.g., 9th Grade"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 resize-none"
                                        rows={3}
                                        placeholder="Optional description..."
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-500/10 text-slate-400 rounded-lg hover:bg-slate-500/20 transition-all border border-slate-500/20"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] font-bold rounded-lg transition-all disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Join Classroom Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#0d281e] border border-emerald-500/20 rounded-2xl p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-serif-display text-white mb-6">Join Classroom</h2>
                        <form onSubmit={handleJoinClassroom}>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Class Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value)}
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 font-pixel tracking-wider text-center"
                                        placeholder="ABC123"
                                        maxLength={6}
                                    />
                                    <p className="text-xs text-slate-400 mt-2">Enter the 6-character code provided by your teacher.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowJoinModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-500/10 text-slate-400 rounded-lg hover:bg-slate-500/20 transition-all border border-slate-500/20"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] font-bold rounded-lg transition-all disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Joining...' : 'Join Classroom'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
