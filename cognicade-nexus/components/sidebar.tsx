'use client';

import React, { useState, useEffect } from 'react';
import {
    Home,
    BookOpen,
    BarChart3,
    Users,
    Settings,
    Trophy,
    Gamepad2,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Target,
    Zap,
    Plus
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const TEACHER_NAV_ITEMS = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Create Lesson', href: '/create', icon: Plus },
    { label: 'My Lessons', href: '/lessons', icon: BookOpen },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Students', href: '/students', icon: Users },
    { label: 'Achievements', href: '/achievements', icon: Trophy },
    { label: 'Game Library', href: '/library', icon: Gamepad2 },
];

const STUDENT_NAV_ITEMS = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'My Classrooms', href: '/classrooms', icon: Users },
    { label: 'Assigned Lessons', href: '/lessons', icon: BookOpen },
    { label: 'My Progress', href: '/progress', icon: Target },
    { label: 'Achievements', href: '/achievements', icon: Trophy },
    { label: 'Game Library', href: '/library', icon: Gamepad2 },
];

const BOTTOM_ITEMS = [
    { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const fetchUserProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setUserProfile(profile);
                    setUserRole(profile.role);
                }
            }
        };

        fetchUserProfile();
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    const navItems = userRole === 'teacher' ? TEACHER_NAV_ITEMS : STUDENT_NAV_ITEMS;

    return (
        <div
            className={`fixed left-0 top-0 h-screen bg-[#0d281e] border-r border-white/10 flex flex-col transition-all duration-300 z-50 ${
                collapsed ? 'w-20' : 'w-64'
            }`}
        >
            {/* Logo Section */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <img src="/NEXUSLOGO.png" alt="Nexus" className="w-10 h-10 object-contain" />
                    {!collapsed && <span className="text-xl text-white font-serif-display">Nexus</span>}
                </Link>
                {!collapsed && (
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}
            </div>

            {/* Expand Button (when collapsed) */}
            {collapsed && (
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-24 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full p-1 shadow-lg transition-all"
                >
                    <ChevronRight size={16} />
                </button>
            )}

            {/* User Stats Card */}
            {!collapsed && userProfile && (
                <div className="mx-4 mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold font-sans-clean">
                            {userProfile.full_name
                                ? userProfile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                                : userRole === 'teacher' ? 'ED' : 'ST'}
                        </div>
                        <div>
                            <div className="text-white font-bold text-sm font-sans-clean">
                                {userProfile.full_name || (userRole === 'teacher' ? 'Educator' : 'Student')}
                            </div>
                            <div className="text-slate-400 text-xs font-sans-clean capitalize">{userRole}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap size={14} className="text-yellow-400" />
                        <div className="flex-1 bg-black/20 rounded-full h-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-yellow-400 to-emerald-400 h-full w-3/4"></div>
                        </div>
                        <span className="text-xs text-slate-400 font-sans-clean">75%</span>
                    </div>
                </div>
            )}

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto py-6 px-3">
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <div
                                    className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <Icon size={20} className={isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'} />
                                    {!collapsed && (
                                        <span className="text-sm font-medium font-sans-clean">{item.label}</span>
                                    )}
                                    {isActive && !collapsed && (
                                        <div className="ml-auto w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Bottom Section */}
            <div className="border-t border-white/10 p-3">
                {BOTTOM_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-all cursor-pointer mb-2 ${
                                    isActive
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <Icon size={20} />
                                {!collapsed && <span className="text-sm font-medium font-sans-clean">{item.label}</span>}
                            </div>
                        </Link>
                    );
                })}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full group flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                >
                    <LogOut size={20} />
                    {!collapsed && <span className="text-sm font-medium font-sans-clean">Logout</span>}
                </button>
            </div>

            {/* Decorative Pixel Coin */}
            {!collapsed && (
                <div className="absolute bottom-28 right-4 opacity-10 pointer-events-none">
                    <img src="/coin.png" alt="" className="w-8 h-8 animate-float-gentle image-pixelated" />
                </div>
            )}
        </div>
    );
}
