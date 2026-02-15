'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LessonUploader } from '@/components/lesson-uploader';
import CreateNavbar from '@/components/ui/create-navbar';
import { Loader2 } from 'lucide-react';

export default function CreateLessonPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/auth/login');
                return;
            }

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (!profile || profile.role !== 'teacher') {
                console.error('Unauthorized access: Teachers only.');
                router.push('/dashboard');
                return;
            }

            setIsAuthorized(true);
        };

        checkAuth();
    }, [router]);

    if (isAuthorized === null) {
        return (
            <div className="min-h-screen bg-[#0a1f18] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="text-emerald-500 animate-spin" />
                    <p className="text-emerald-400 font-pixel text-xs tracking-widest">VERIFYING AUTHORITY...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a1f18] text-slate-100 font-sans selection:bg-emerald-500/30">
            {/* Global Styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;800&family=Press+Start+2P&display=swap');

                .font-pixel { font-family: 'Press Start 2P', cursive; }
                .font-serif-display { font-family: 'DM Serif Display', serif; }
                .font-sans-clean { font-family: 'Inter', sans-serif; }
            `}</style>

            <Sidebar />

            <div
                className="min-h-screen transition-[margin] duration-300"
                style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}
            >
                <div className="px-8 py-12">
                    {/* Header */}
                    <div className="mb-10">
                        <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4 font-pixel">Lesson Creator</p>
                        <h1 className="text-4xl lg:text-5xl font-serif-display text-white leading-tight mb-3">
                            Build your <span className="text-emerald-400 italic">game</span>
                        </h1>
                        <p className="text-slate-400 text-lg font-sans-clean leading-relaxed max-w-2xl">
                            Upload a lesson plan and watch it transform into an interactive educational experience with video, music, and gameplay.
                        </p>
                    </div>

                    {/* Classroom Selector */}
                    <div className="mb-8">
                        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-pixel mb-3 block">
                            Assign to Classroom <span className="text-red-400">*</span>
                        </label>
                        {loading ? (
                            <div className="flex items-center gap-2 text-slate-400 font-sans-clean text-sm">
                                <Loader2 size={16} className="animate-spin" />
                                Loading classrooms...
                            </div>
                        ) : classrooms.length === 0 ? (
                            <div className="bg-[#0d281e] border border-yellow-500/20 rounded-xl p-5">
                                <p className="text-yellow-400 text-sm font-sans-clean mb-2">
                                    You don't have any classrooms yet. Create a classroom first before making lessons.
                                </p>
                                <button
                                    onClick={() => router.push('/classrooms')}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] font-bold rounded-lg transition-all shadow-[0_4px_0_#065f46] hover:translate-y-[2px] hover:shadow-[0_2px_0_#065f46] active:translate-y-[4px] active:shadow-none text-sm font-sans-clean"
                                >
                                    <Users size={16} />
                                    Go to Classrooms
                                </button>
                            </div>
                        ) : (
                            <div className="relative max-w-md">
                                <select
                                    value={selectedClassroom}
                                    onChange={(e) => setSelectedClassroom(e.target.value)}
                                    className="w-full appearance-none px-4 py-3.5 bg-[#0d281e] border border-white/10 rounded-xl text-white font-sans-clean text-sm focus:border-emerald-500/40 focus:outline-none transition-colors cursor-pointer pr-10"
                                >
                                    <option value="">Select a classroom...</option>
                                    {classrooms.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}{c.subject ? ` — ${c.subject}` : ''} ({c.member_count || 0} students)
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            </div>
                        )}
                    </div>

                    {/* Lesson Uploader — only visible when classroom is selected */}
                    {selectedClassroom ? (
                        <Suspense fallback={
                            <div className="text-center py-12">
                                <div className="inline-flex items-center gap-3 px-5 py-3 bg-[#0d281e] border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-sans-clean">
                                    <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                    Loading...
                                </div>
                            </div>
                        }>
                            <LessonUploader classroomId={selectedClassroom} />
                        </Suspense>
                    ) : classrooms.length > 0 ? (
                        <div className="bg-[#0d281e] border border-white/5 rounded-2xl p-12 text-center">
                            <Users className="mx-auto text-slate-600 mb-4" size={48} />
                            <h3 className="text-white font-bold text-xl mb-2 font-sans-clean">Select a Classroom</h3>
                            <p className="text-slate-400 font-sans-clean">
                                Choose which classroom this lesson will be assigned to before uploading.
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
