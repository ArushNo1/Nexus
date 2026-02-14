'use client';

import { useState } from 'react';
import {
    Users,
    BookOpen,
    Plus,
    Play,
    Settings,
    Trophy,
    Clock,
    Star,
    ArrowRight,
    BarChart3,
    Target
} from 'lucide-react';
import Sidebar from '@/components/sidebar';
import DashboardNavbar from '@/components/ui/dashboard-navbar';
import Link from 'next/link';

/* --- MOCK DATA --- */
const STATS = [
    { label: 'Lessons Created', value: '24', icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', trend: '+12%' },
    { label: 'Students Engaged', value: '487', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', trend: '+23%' },
    { label: 'Total Playtime', value: '142h', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', trend: '+18%' },
    { label: 'Avg. Score', value: '87%', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', trend: '+5%' },
];

const RECENT_LESSONS = [
    { title: 'Ancient Rome RPG', subject: 'History', students: 45, completion: 78, status: 'active', color: 'emerald' },
    { title: 'Derivative Dungeon', subject: 'Calculus', students: 32, completion: 92, status: 'active', color: 'red' },
    { title: 'Gravity Lab Sim', subject: 'Physics', students: 28, completion: 65, status: 'draft', color: 'blue' },
    { title: 'Code Breaker Puzzle', subject: 'Logic', students: 51, completion: 88, status: 'active', color: 'purple' },
];

const QUICK_ACTIONS = [
    { label: 'Create New Lesson', icon: Plus, href: '/create', color: 'emerald', glow: 'rgba(52,211,153,0.3)' },
    { label: 'View Analytics', icon: BarChart3, href: '#', color: 'blue', glow: 'rgba(59,130,246,0.3)' },
    { label: 'Student Progress', icon: Target, href: '#', color: 'purple', glow: 'rgba(168,85,247,0.3)' },
    { label: 'Settings', icon: Settings, href: '#', color: 'slate', glow: 'rgba(148,163,184,0.3)' },
];

export default function Dashboard() {
    const [hoveredStat, setHoveredStat] = useState<number | null>(null);

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
            <div className="ml-64 min-h-screen">
                {/* Dashboard Navbar */}
                <DashboardNavbar />

            <div className="px-8 py-12">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <h1 className="text-5xl font-serif-display text-white">Welcome back,</h1>
                        <span className="text-5xl font-serif-display text-emerald-400 italic">Educator</span>
                    </div>
                    <p className="text-slate-400 text-lg font-sans-clean">Here's what's happening with your lessons today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {STATS.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={idx}
                                className={`relative bg-[#0d281e] border ${stat.border} rounded-2xl p-6 cursor-pointer transition-all duration-300 overflow-hidden group ${
                                    hoveredStat === idx ? '-translate-y-1 shadow-xl' : 'hover:shadow-lg'
                                }`}
                                onMouseEnter={() => setHoveredStat(idx)}
                                onMouseLeave={() => setHoveredStat(null)}
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
                        {QUICK_ACTIONS.map((action, idx) => {
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
                        <h2 className="text-2xl font-serif-display text-white">Recent Lessons</h2>
                        <button className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors flex items-center gap-2 font-sans-clean">
                            View All <ArrowRight size={16} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {RECENT_LESSONS.map((lesson, idx) => {
                            const colorMap: Record<string, { text: string; bg: string; border: string }> = {
                                emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                                red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
                                blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                                purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                            };
                            const colors = colorMap[lesson.color];
                            return (
                                <div
                                    key={idx}
                                    className={`group relative bg-[#0d281e] border ${colors.border} rounded-2xl p-6 hover:scale-[1.02] transition-all cursor-pointer overflow-hidden`}
                                >
                                    <div className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-1 font-sans-clean">{lesson.title}</h3>
                                                <p className="text-slate-400 text-sm font-sans-clean">{lesson.subject}</p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${lesson.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'} font-sans-clean`}>
                                                {lesson.status}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 mb-4">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Users size={16} />
                                                <span className="text-sm font-sans-clean">{lesson.students} students</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Star size={16} />
                                                <span className="text-sm font-sans-clean">{lesson.completion}% complete</span>
                                            </div>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full ${colors.bg.replace('/10', '')} transition-all duration-500`}
                                                style={{ width: `${lesson.completion}%` }}
                                            />
                                        </div>
                                        {/* Action Button */}
                                        <div className="mt-4 flex gap-3">
                                            <button className={`flex items-center gap-2 px-4 py-2 ${colors.bg} ${colors.text} rounded-lg hover:bg-opacity-80 transition-all text-sm font-medium font-sans-clean border ${colors.border}`}>
                                                <Play size={16} />
                                                Launch
                                            </button>
                                            <button className="px-4 py-2 bg-slate-500/10 text-slate-400 rounded-lg hover:bg-slate-500/20 transition-all text-sm font-medium font-sans-clean border border-slate-500/20">
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Floating Game Elements */}
                <img src="/coin.png" alt="" className="fixed bottom-20 right-20 w-12 opacity-20 animate-float-gentle pointer-events-none image-pixelated" />
                <img src="/coin.png" alt="" className="fixed top-32 right-40 w-8 opacity-15 animate-float-gentle pointer-events-none image-pixelated" style={{ animationDelay: '1s' }} />
            </div>
            </div>
        </div>
    );
}
