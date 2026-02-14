'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/sidebar';
import DashboardNavbar from '@/components/ui/dashboard-navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, School, Save, LogOut, Copy, CheckCircle, Users as UsersIcon, BookOpen } from 'lucide-react';
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

                // Load classrooms if teacher
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
        router.push('/auth/login');
    };

    const copyJoinCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a1f18] text-slate-100">
                <Sidebar />
                <div className="ml-64 min-h-screen">
                    <DashboardNavbar />
                    <div className="px-8 py-12 flex items-center justify-center">
                        <p className="text-slate-400">Loading settings...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a1f18] text-slate-100">
            <Sidebar />

            <div className="ml-64 min-h-screen">
                <DashboardNavbar />

                <div className="px-8 py-12">
                    <div className="mb-8">
                        <h1 className="text-4xl font-serif-display text-white mb-2">Settings</h1>
                        <p className="text-slate-400">Manage your account settings and preferences</p>
                    </div>

                    <div className="max-w-3xl space-y-6">
                        {/* Profile Information */}
                        <Card className="bg-[#0d281e] border-emerald-500/20">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <User size={20} className="text-emerald-400" />
                                    Profile Information
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Update your personal information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name" className="text-slate-300">Full Name</Label>
                                    <Input
                                        id="full_name"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="bg-[#0a1f18] border-emerald-500/20 text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="bg-[#0a1f18] border-emerald-500/20 text-slate-400 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-slate-500">Email cannot be changed</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role" className="text-slate-300">Role</Label>
                                    <Input
                                        id="role"
                                        value={userProfile?.role === 'teacher' ? 'Teacher' : 'Student'}
                                        disabled
                                        className="bg-[#0a1f18] border-emerald-500/20 text-slate-400 cursor-not-allowed capitalize"
                                    />
                                    <p className="text-xs text-slate-500">Role cannot be changed</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* School Information */}
                        <Card className="bg-[#0d281e] border-emerald-500/20">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <School size={20} className="text-emerald-400" />
                                    {userProfile?.role === 'teacher' ? 'School Information' : 'Academic Information'}
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    {userProfile?.role === 'teacher'
                                        ? 'Information about your school'
                                        : 'Your academic details'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="school_name" className="text-slate-300">
                                        {userProfile?.role === 'teacher' ? 'School Name' : 'School/Institution'}
                                    </Label>
                                    <Input
                                        id="school_name"
                                        value={formData.school_name}
                                        onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                                        placeholder={userProfile?.role === 'teacher' ? 'Lincoln High School' : 'Your school name'}
                                        className="bg-[#0a1f18] border-emerald-500/20 text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="grade_level" className="text-slate-300">
                                        {userProfile?.role === 'teacher' ? 'Grades Taught' : 'Grade Level'}
                                    </Label>
                                    <Input
                                        id="grade_level"
                                        value={formData.grade_level}
                                        onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                                        placeholder={userProfile?.role === 'teacher' ? '9-12' : '10th Grade'}
                                        className="bg-[#0a1f18] border-emerald-500/20 text-white"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Classroom Join Codes - Only for Teachers */}
                        {userProfile?.role === 'teacher' && classrooms.length > 0 && (
                            <Card className="bg-[#0d281e] border-emerald-500/20">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <UsersIcon size={20} className="text-emerald-400" />
                                        Classroom Join Codes
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Share these codes with your students to let them join your classrooms
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {classrooms.map((classroom) => (
                                        <div
                                            key={classroom.id}
                                            className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-emerald-500/10 hover:border-emerald-500/30 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-white font-semibold">{classroom.name}</h4>
                                                    {classroom.is_active && (
                                                        <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-slate-400">
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
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500 mb-1">Join Code</p>
                                                    <span className="text-2xl font-bold font-pixel text-emerald-400 tracking-wider">
                                                        {classroom.join_code}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => copyJoinCode(classroom.join_code)}
                                                    className="p-3 hover:bg-white/5 rounded-lg transition-colors"
                                                    title="Copy join code"
                                                >
                                                    {copiedCode === classroom.join_code ? (
                                                        <CheckCircle size={20} className="text-emerald-400" />
                                                    ) : (
                                                        <Copy size={20} className="text-slate-400" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] font-bold"
                            >
                                <Save size={16} className="mr-2" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>

                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                            >
                                <LogOut size={16} className="mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
