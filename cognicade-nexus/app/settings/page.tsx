'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/sidebar';
import ChalkEquations from '@/components/ui/chalk-equations';
import { User, School, Save, LogOut, Copy, CheckCircle, Users as UsersIcon, BookOpen, Loader2 } from 'lucide-react';
import { getClassroomsForTeacher } from '@/lib/services/classrooms';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        school_name: '',
        grade_level: '',
    });
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const loadProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/auth/login');
                return;
            }

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setUserProfile(profile);
                setFormData({
                    full_name: profile.full_name || '',
                    email: profile.email || user.email || '',
                    school_name: profile.school_name || '',
                    grade_level: profile.grade_level || '',
                });

                if (profile.role === 'teacher') {
                    try {
                        const classroomData = await getClassroomsForTeacher(supabase, user.id);
                        setClassrooms(classroomData);
                    } catch (error) {
                        console.error('Error loading classrooms:', error);
                    }
                }
            }
            setLoading(false);
        };

        loadProfile();
    }, [router, supabase]);

    const handleSave = async () => {
        if (!userProfile) return;
        setSaving(true);

        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({
                    full_name: formData.full_name,
                    school_name: formData.school_name,
                    grade_level: formData.grade_level,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userProfile.id);

            if (error) throw error;

            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/landing');
    };

    const copyJoinCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    if (loading) {
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
                <main id="main-content" className="min-h-screen transition-[margin] duration-300" style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}>
                    <div className="flex items-center justify-center py-32">
                        <div className="flex items-center gap-3 text-emerald-400 font-sans-clean">
                            <Loader2 size={24} className="animate-spin" />
                            Loading settings...
                        </div>
                    </div>
                </main>
            </div>
        );
    }

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

            <main id="main-content" className="min-h-screen transition-[margin] duration-300" style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}>

                <div className="px-8 py-12">
                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-4xl font-serif-display text-white mb-2">Settings</h1>
                        <p className="text-slate-400 font-sans-clean">Manage your account settings and preferences</p>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Profile Information */}
                        <div className="relative bg-[#0d281e] border border-emerald-500/10 rounded-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none" />
                            <div className="relative z-10 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <User className="text-emerald-400" size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-serif-display text-white">Profile Information</h2>
                                        <p className="text-slate-500 text-sm font-sans-clean">Update your personal information</p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-pixel mb-2 block">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white font-sans-clean text-sm focus:border-emerald-500/40 focus:outline-none transition-colors placeholder:text-slate-600"
                                            placeholder="Your full name"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-pixel mb-2 block">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-slate-500 font-sans-clean text-sm cursor-not-allowed"
                                        />
                                        <p className="text-xs text-slate-600 font-sans-clean mt-1.5">Email cannot be changed</p>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-pixel mb-2 block">Role</label>
                                        <input
                                            type="text"
                                            value={userProfile?.role === 'teacher' ? 'Teacher' : 'Student'}
                                            disabled
                                            className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-slate-500 font-sans-clean text-sm cursor-not-allowed capitalize"
                                        />
                                        <p className="text-xs text-slate-600 font-sans-clean mt-1.5">Role cannot be changed</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* School Information */}
                        <div className="relative bg-[#0d281e] border border-blue-500/10 rounded-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />
                            <div className="relative z-10 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                        <School className="text-blue-400" size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-serif-display text-white">
                                            {userProfile?.role === 'teacher' ? 'School Information' : 'Academic Information'}
                                        </h2>
                                        <p className="text-slate-500 text-sm font-sans-clean">
                                            {userProfile?.role === 'teacher' ? 'Information about your school' : 'Your academic details'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-pixel mb-2 block">
                                            {userProfile?.role === 'teacher' ? 'School Name' : 'School / Institution'}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.school_name}
                                            onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                                            placeholder={userProfile?.role === 'teacher' ? 'Lincoln High School' : 'Your school name'}
                                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white font-sans-clean text-sm focus:border-blue-500/40 focus:outline-none transition-colors placeholder:text-slate-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-pixel mb-2 block">
                                            {userProfile?.role === 'teacher' ? 'Grades Taught' : 'Grade Level'}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.grade_level}
                                            onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                                            placeholder={userProfile?.role === 'teacher' ? '9-12' : '10th Grade'}
                                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white font-sans-clean text-sm focus:border-blue-500/40 focus:outline-none transition-colors placeholder:text-slate-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Classroom Join Codes — spans full width */}
                        {userProfile?.role === 'teacher' && classrooms.length > 0 && (
                            <div className="xl:col-span-2 relative bg-[#0d281e] border border-purple-500/10 rounded-2xl overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] to-transparent pointer-events-none" />
                                <div className="relative z-10 p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                            <UsersIcon className="text-purple-400" size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-serif-display text-white">Classroom Join Codes</h2>
                                            <p className="text-slate-500 text-sm font-sans-clean">Share these codes with your students to let them join your classrooms</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {classrooms.map((classroom) => (
                                            <div
                                                key={classroom.id}
                                                className="flex items-center justify-between p-5 bg-black/20 rounded-xl border border-white/5 hover:border-purple-500/20 transition-colors"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <h4 className="text-white font-medium font-sans-clean truncate">{classroom.name}</h4>
                                                        {classroom.is_active && (
                                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 font-pixel shrink-0">
                                                                ACTIVE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-slate-500 font-sans-clean">
                                                        <span className="flex items-center gap-1">
                                                            <UsersIcon size={12} />
                                                            {classroom.member_count || 0} students
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <BookOpen size={12} />
                                                            {classroom.lesson_count || 0} lessons
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 ml-4">
                                                    <div className="text-right">
                                                        <p className="text-[9px] text-slate-600 mb-0.5 font-pixel">CODE</p>
                                                        <span className="text-xl font-bold font-pixel text-purple-400 tracking-wider">
                                                            {classroom.join_code}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => copyJoinCode(classroom.join_code)}
                                                        className="p-3 hover:bg-white/5 rounded-lg transition-colors"
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
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions — spans full width */}
                        <div className="xl:col-span-2 flex gap-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all font-sans-clean ${
                                    saving
                                        ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                        : 'bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] shadow-[0_4px_0_#065f46] hover:translate-y-[2px] hover:shadow-[0_2px_0_#065f46] active:translate-y-[4px] active:shadow-none'
                                }`}
                            >
                                <Save size={16} />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-8 py-3.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-xl transition-all text-sm font-medium font-sans-clean"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
