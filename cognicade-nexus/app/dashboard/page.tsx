'use client';

import { useState, useEffect } from 'react';
import { Play, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/sidebar';
import { createClient } from '@/lib/supabase/client';
import { getRecentLessons, getStudentRecentLessons } from '@/lib/services/classrooms';
import ChalkEquations from '@/components/ui/chalk-equations';

const PLACEHOLDER_THUMBNAILS = [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=300&fit=crop',
];

export default function Dashboard() {
    const [lessons, setLessons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);
    const [userName, setUserName] = useState<string>('');

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) return;

                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (!profile) {
                    const pendingRole = typeof window !== 'undefined' ? localStorage.getItem('pending_signup_role') : null;

                    if (pendingRole) {
                        const { error: upsertError } = await supabase.from('user_profiles').upsert({
                            id: user.id,
                            role: pendingRole,
                            email: user.email,
                            full_name: user.user_metadata.full_name,
                            avatar_url: user.user_metadata.avatar_url,
                            updated_at: new Date().toISOString(),
                        }, { onConflict: 'id' });

                        if (upsertError) {
                            console.error("Error creating profile:", upsertError);
                        } else {
                            localStorage.removeItem('pending_signup_role');
                            const { data: newProfile } = await supabase
                                .from('user_profiles')
                                .select('*')
                                .eq('id', user.id)
                                .single();
                            setUserRole(newProfile?.role || null);
                            setUserName(newProfile?.full_name?.split(' ')[0] || '');
                        }
                    } else {
                        window.location.href = '/onboarding';
                        return;
                    }
                } else {
                    setUserRole(profile.role);
                    setUserName(profile.full_name?.split(' ')[0] || '');
                }

                const currentRole = profile?.role || userRole;
                const lessonsData = currentRole === 'teacher'
                    ? await getRecentLessons(supabase, user.id)
                    : await getStudentRecentLessons(supabase, user.id);

                setLessons(lessonsData);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Triple the lessons for seamless marquee loop
    const marqueeItems = lessons.length > 0 ? [...lessons, ...lessons, ...lessons] : [];

    return (
        <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)] font-sans selection:bg-emerald-500/30 overflow-x-hidden">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;800&family=Press+Start+2P&display=swap');
                .font-pixel { font-family: 'Press Start 2P', cursive; }
                .font-serif-display { font-family: 'DM Serif Display', serif; }
                .font-sans-clean { font-family: 'Inter', sans-serif; }

                @keyframes dashboard-marquee {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-33.333%); }
                }
                .animate-dashboard-marquee {
                    animation: dashboard-marquee 40s linear infinite;
                }
                .animate-dashboard-marquee:hover {
                    animation-play-state: paused;
                }

                @keyframes float-gentle {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(1deg); }
                }
                .animate-float-gentle {
                    animation: float-gentle 4s ease-in-out infinite;
                }
            `}</style>

            <ChalkEquations />
            <Sidebar />

            <main
                id="main-content"
                className="min-h-screen transition-[margin] duration-300 flex flex-col relative"
                style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}
            >
                {/* Ambient background glows — matches landing page */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/[0.03] blur-[120px] rounded-full pointer-events-none animate-float-gentle" />
                <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-sky-500/[0.03] blur-[100px] rounded-full pointer-events-none animate-float-gentle" style={{ animationDelay: '2s' }} />

                <div className="flex-1 flex flex-col px-8 py-12 relative z-10">
                    {/* Header */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <h1 className="text-5xl font-serif-display text-[var(--text-heading)]">Welcome back,</h1>
                            <span className="text-5xl font-serif-display text-[var(--accent)] italic">
                                {userName || (userRole === 'teacher' ? 'Educator' : 'Student')}
                            </span>
                        </div>
                        <p className="text-[var(--text-subheading)] text-lg font-sans-clean">
                            {userRole === 'teacher'
                                ? "Here are your lessons."
                                : "Here are your assigned lessons."}
                        </p>
                    </div>

                    {/* Lessons */}
                    <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-serif-display text-[var(--text-heading)]">My Lessons</h2>
                            <Link href="/lessons">
                                <button className="text-[var(--accent)] text-sm font-medium hover:text-[var(--accent-hover)] transition-colors flex items-center gap-2 font-sans-clean">
                                    View All <ArrowRight size={16} />
                                </button>
                            </Link>
                        </div>

                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 size={32} className="text-[var(--accent)] animate-spin" />
                            </div>
                        ) : lessons.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center py-16 bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-2xl px-12">
                                    <p className="text-[var(--text-secondary)] font-sans-clean mb-2">No lessons yet.</p>
                                    <Link href="/classrooms" className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors font-sans-clean text-sm">
                                        Go to your classrooms to get started
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="relative overflow-hidden -mx-8 flex-1 flex items-center">
                                {/* Left fade */}
                                <div className="absolute left-0 top-0 h-full w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--page-bg) 30%, transparent)' }} />
                                {/* Right fade */}
                                <div className="absolute right-0 top-0 h-full w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--page-bg) 30%, transparent)' }} />

                                <div className="flex gap-6 w-max animate-dashboard-marquee py-4 px-8">
                                    {marqueeItems.map((lesson, idx) => {
                                        const originalIdx = idx % lessons.length;
                                        return (
                                            <div
                                                key={`${lesson.id}-${idx}`}
                                                className="group relative flex-shrink-0 w-[22rem] bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-2xl overflow-hidden transition-all hover:scale-[1.03] hover:shadow-2xl"
                                            >
                                                {/* Color accent gradient */}
                                                <div className="absolute inset-0 bg-emerald-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                                {/* Thumbnail */}
                                                <div className="relative h-[18rem] overflow-hidden">
                                                    <img
                                                        src={lesson.thumbnail_url || PLACEHOLDER_THUMBNAILS[originalIdx % PLACEHOLDER_THUMBNAILS.length]}
                                                        alt={lesson.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] via-transparent to-transparent" />
                                                    <div className="absolute top-3 right-3">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-sans-clean backdrop-blur-sm ${
                                                            lesson.status !== 'draft'
                                                                ? `bg-[var(--status-active-bg)] text-[var(--status-active-text)] border border-[var(--card-border)]`
                                                                : `bg-[var(--status-draft-bg)] text-[var(--status-draft-text)] border border-[var(--status-draft-border)]`
                                                        }`}>
                                                            {lesson.status || 'active'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-5 relative z-10">
                                                    <h3 className="text-[var(--text-primary)] font-bold text-lg mb-1 font-sans-clean truncate">{lesson.title}</h3>
                                                    <p className="text-sm font-sans-clean mb-5 truncate text-[var(--text-secondary)]">{lesson.subject || 'Unspecified Subject'}</p>

                                                    <div className="flex gap-2">
                                                        <Link href={`/lessons/${lesson.id}`} className="flex-1">
                                                            <button className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-[var(--accent-bg)] text-[var(--accent)] rounded-xl hover:brightness-125 transition-all text-sm font-medium font-sans-clean border-2 border-[var(--card-border)]">
                                                                <Play size={14} />
                                                                {userRole === 'teacher' ? 'View' : 'Launch'}
                                                            </button>
                                                        </Link>
                                                        {userRole === 'teacher' && (
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    if (!confirm('Are you sure you want to delete this lesson?')) return;
                                                                    const supabase = createClient();
                                                                    await supabase.from('lessons').delete().eq('id', lesson.id);
                                                                    setLessons(prev => prev.filter(l => l.id !== lesson.id));
                                                                }}
                                                                aria-label={`Delete lesson: ${lesson.title}`}
                                                                className="px-3 py-3 bg-[var(--btn-danger-bg)] text-[var(--btn-danger-text)] rounded-xl hover:bg-[var(--btn-danger-hover)] transition-all border border-[var(--btn-danger-border)]"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
