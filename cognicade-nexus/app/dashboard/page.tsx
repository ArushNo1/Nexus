'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    BookOpen,
    Play,
    Settings,
    Trophy,
    Clock,
    Star,
    ArrowRight,
    BarChart3,
    Target,
    Trash2
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/sidebar';
import { createClient } from '@/lib/supabase/client';
import { getDashboardStats, getRecentLessons, getStudentDashboardStats, getStudentRecentLessons } from '@/lib/services/classrooms';

const TEACHER_QUICK_ACTIONS = [
    { label: 'My Classrooms', icon: Users, href: '/classrooms', color: 'emerald', glow: 'rgba(52,211,153,0.3)' },
    { label: 'View Analytics', icon: BarChart3, href: '/analytics', color: 'blue', glow: 'rgba(59,130,246,0.3)' },
    { label: 'My Lessons', icon: BookOpen, href: '/lessons', color: 'purple', glow: 'rgba(168,85,247,0.3)' },
    { label: 'Settings', icon: Settings, href: '/settings', color: 'slate', glow: 'rgba(148,163,184,0.3)' },
];

const STUDENT_QUICK_ACTIONS = [
    { label: 'My Classrooms', icon: Users, href: '/classrooms', color: 'emerald', glow: 'rgba(52,211,153,0.3)' },
    { label: 'My Progress', icon: Target, href: '/progress', color: 'blue', glow: 'rgba(59,130,246,0.3)' },
    { label: 'Achievements', icon: Trophy, href: '/achievements', color: 'purple', glow: 'rgba(168,85,247,0.3)' },
    { label: 'Settings', icon: Settings, href: '/settings', color: 'slate', glow: 'rgba(148,163,184,0.3)' },
];

export default function Dashboard() {
    const [hoveredStat, setHoveredStat] = useState<number | null>(null);
    const [stats, setStats] = useState({
        lessonCount: 0,
        studentCount: 0,
        totalPlaytimeMinutes: 0,
        avgScore: 0
    });
    const [recentLessons, setRecentLessons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) return;

                // --- PROFILE HANDLING START ---
                // Check if profile exists
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (!profile) {
                    const pendingRole = typeof window !== 'undefined' ? localStorage.getItem('pending_signup_role') : null;

                    if (pendingRole) {
                        console.log("Creating profile with pending role:", pendingRole);
                        // User came from Sign Up flow + Google, create/update profile with selected role
                        const { error: upsertError } = await supabase.from('user_profiles').upsert({
                            id: user.id,
                            role: pendingRole,
                            email: user.email,
                            full_name: user.user_metadata.full_name,
                            avatar_url: user.user_metadata.avatar_url,
                            updated_at: new Date().toISOString(),
                        }, {
                            onConflict: 'id'
                        });

                        if (upsertError) {
                            console.error("Error creating profile:", upsertError);
                        } else {
                            localStorage.removeItem('pending_signup_role');
                            // Fetch the profile again
                            const { data: newProfile } = await supabase
                                .from('user_profiles')
                                .select('*')
                                .eq('id', user.id)
                                .single();
                            setUserProfile(newProfile);
                            setUserRole(newProfile?.role || null);
                        }
                    } else {
                        // User logged in directly (e.g., Google Login on login page) without sign up flow
                        // No pending role exists so we must force them to choose.
                        window.location.href = '/onboarding';
                        return;
                    }
                } else {
                    setUserProfile(profile);
                    setUserRole(profile.role);
                }
                // --- PROFILE HANDLING END ---

                // Fetch role-specific data
                const currentRole = profile?.role || userRole;

                let statsData, lessonsData;
                if (currentRole === 'teacher') {
                    [statsData, lessonsData] = await Promise.all([
                        getDashboardStats(supabase, user.id),
                        getRecentLessons(supabase, user.id)
                    ]);
                } else {
                    // Student
                    [statsData, lessonsData] = await Promise.all([
                        getStudentDashboardStats(supabase, user.id),
                        getStudentRecentLessons(supabase, user.id)
                    ]);
                }

                setStats(statsData);
                setRecentLessons(lessonsData);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const dynamicStats = userRole === 'teacher' ? [
        { label: 'Lessons Created', value: stats.lessonCount.toString(), icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', trend: '+12%' },
        { label: 'Students Engaged', value: stats.studentCount.toString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', trend: '+23%' },
        { label: 'Total Playtime', value: `${(stats.totalPlaytimeMinutes / 60).toFixed(1)}h`, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', trend: '+18%' },
        { label: 'Avg. Score', value: `${stats.avgScore}%`, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', trend: '+5%' },
    ] : [
        { label: 'Lessons Assigned', value: stats.lessonCount.toString(), icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', trend: '+8%' },
        { label: 'Classrooms Joined', value: stats.studentCount.toString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', trend: '+2%' },
        { label: 'Total Playtime', value: `${(stats.totalPlaytimeMinutes / 60).toFixed(1)}h`, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', trend: '+25%' },
        { label: 'Avg. Score', value: `${stats.avgScore}%`, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', trend: '+15%' },
    ];

    return (
        <div className="min-h-screen bg-[#0a1f18] text-slate-100 font-sans selection:bg-emerald-500/30">
            {/* Global Styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;800&family=Press+Start+2P&display=swap');

                .font-pixel { font-family: 'Press Start 2P', cursive; }
                .font-serif-display { font-family: 'DM Serif Display', serif; }
                .font-sans-clean { font-family: 'Inter', sans-serif; }

                @keyframes float-gentle {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                .animate-float-gentle { animation: float-gentle 4s ease-in-out infinite; }

                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px var(--glow-color, rgba(52,211,153,0.2)); }
                    50% { box-shadow: 0 0 40px var(--glow-color, rgba(52,211,153,0.4)); }
                }
                .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }

                @keyframes coin-spin {
                    0% { transform: rotateY(0deg); }
                    100% { transform: rotateY(360deg); }
                }
                .animate-coin-spin { animation: coin-spin 2s linear infinite; }
            `}</style>

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div
                className="min-h-screen transition-[margin] duration-300"
                style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}
            >

                <div className="px-8 py-12">
                    {/* Header */}
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <h1 className="text-5xl font-serif-display text-white">Welcome back,</h1>
                            <span className="text-5xl font-serif-display text-emerald-400 italic">
                                {userRole === 'teacher' ? 'Educator' : 'Student'}
                            </span>
                        </div>
                        <p className="text-slate-400 text-lg font-sans-clean">
                            {userRole === 'teacher'
                                ? "Here's what's happening with your lessons today."
                                : "Here are your assigned lessons and progress."}
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-slate-400">Loading dashboard data...</p>
                        </div>
                    ) : (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                {dynamicStats.map((stat, idx) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div
                                            key={idx}
                                            className={`relative bg-[#0d281e] border ${stat.border} rounded-2xl p-6 cursor-pointer transition-all duration-300 overflow-hidden group`}
                                            onMouseEnter={() => setHoveredStat(idx)}
                                            onMouseLeave={() => setHoveredStat(null)}
                                            style={{
                                                transform: hoveredStat === idx ? 'translateY(-4px)' : 'translateY(0)',
                                                boxShadow: hoveredStat === idx ? `0 12px 40px rgba(52,211,153,0.15)` : 'none',
                                            }}
                                        >
                                            <div className={`absolute inset-0 ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`p-3 rounded-lg ${stat.bg} ${stat.border} border`}>
                                                        <Icon className={stat.color} size={24} />
                                                    </div>
                                                    <span className="text-emerald-400 text-sm font-bold font-sans-clean">{stat.trend}</span>
                                                </div>
                                                <div className="text-4xl font-bold text-white mb-2 font-sans-clean">{stat.value}</div>
                                                <div className="text-slate-400 text-sm font-medium font-sans-clean">{stat.label}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Quick Actions */}
                            <div className="mb-12">
                                <h2 className="text-2xl font-serif-display text-white mb-6">Quick Actions</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {(userRole === 'teacher' ? TEACHER_QUICK_ACTIONS : STUDENT_QUICK_ACTIONS).map((action, idx) => {
                                        const Icon = action.icon;
                                        const colorMap: Record<string, string> = {
                                            emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20',
                                            blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20',
                                            purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20',
                                            slate: 'text-slate-400 bg-slate-500/10 border-slate-500/20 hover:bg-slate-500/20',
                                        };
                                        return (
                                            <Link href={action.href} key={idx}>
                                                <div className={`group relative bg-[#0d281e] border rounded-xl p-6 cursor-pointer transition-all hover:scale-105 ${colorMap[action.color]}`}>
                                                    <div className="flex flex-col items-center gap-3 text-center">
                                                        <div className="p-4 rounded-full bg-black/20">
                                                            <Icon size={24} className={action.color === 'emerald' ? 'text-emerald-400' : action.color === 'blue' ? 'text-blue-400' : action.color === 'purple' ? 'text-purple-400' : 'text-slate-400'} />
                                                        </div>
                                                        <span className="text-white font-medium text-sm font-sans-clean">{action.label}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Recent Lessons */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-serif-display text-white">
                                        {userRole === 'teacher' ? 'Recent Lessons' : 'Recent Lessons Played'}
                                    </h2>
                                    <Link href="/lessons">
                                        <button className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors flex items-center gap-2 font-sans-clean">
                                            View All <ArrowRight size={16} />
                                        </button>
                                    </Link>
                                </div>
                                {recentLessons.length === 0 ? (
                                    <div className="text-center py-12 bg-[#0d281e] border border-emerald-500/20 rounded-2xl">
                                        <p className="text-slate-400">No lessons yet.</p>
                                        <Link href="/classrooms" className="text-emerald-400 mt-2 block hover:underline">Go to your classrooms to create lessons</Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {recentLessons.map((lesson, idx) => {
                                            const colorMap: Record<string, { text: string; bg: string; border: string }> = {
                                                emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                                                red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
                                                blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                                                purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                                            };
                                            // Use stored color or fallback to consistent color based on index
                                            const colorKey = lesson.color || ['emerald', 'red', 'blue', 'purple'][idx % 4];
                                            const colors = colorMap[colorKey];

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
                                                                <p className="text-slate-400 text-sm font-sans-clean">{lesson.subject || 'Unspecified Subject'}</p>
                                                            </div>
                                                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${lesson.status !== 'draft' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'} font-sans-clean`}>
                                                                {lesson.status || 'active'}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-6 mb-4">
                                                            <div className="flex items-center gap-2 text-slate-400">
                                                                <Users size={16} />
                                                                <span className="text-sm font-sans-clean">{lesson.students || 0} students</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-slate-400">
                                                                <Star size={16} />
                                                                <span className="text-sm font-sans-clean">{lesson.completion || 0}% complete</span>
                                                            </div>
                                                        </div>
                                                        {/* Progress Bar */}
                                                        <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className={`h-full ${colors.bg.replace('/10', '')} transition-all duration-500`}
                                                                style={{ width: `${lesson.completion || 0}%` }}
                                                            />
                                                        </div>
                                                        {/* Action Button */}
                                                        <div className="mt-4 flex gap-3">
                                                            <Link href={`/lessons/${lesson.id}`} className="flex-1">
                                                                <button className={`w-full flex items-center justify-center gap-2 px-4 py-2 ${colors.bg} ${colors.text} rounded-lg hover:bg-opacity-80 transition-all text-sm font-medium font-sans-clean border ${colors.border}`}>
                                                                    <Play size={16} />
                                                                    {userRole === 'teacher' ? 'View' : 'Launch'}
                                                                </button>
                                                            </Link>
                                                            {userRole === 'teacher' && (
                                                                <button
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        if (!confirm('Are you sure you want to delete this lesson? This cannot be undone.')) return;
                                                                        const supabase = createClient();
                                                                        await supabase.from('lessons').delete().eq('id', lesson.id);
                                                                        setRecentLessons(prev => prev.filter(l => l.id !== lesson.id));
                                                                    }}
                                                                    className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-sm font-medium font-sans-clean border border-red-500/20"
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
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}
