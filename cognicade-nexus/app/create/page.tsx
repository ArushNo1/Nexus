'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LessonUploader } from '@/components/lesson-uploader';
import Sidebar from '@/components/sidebar';
import ChalkEquations from '@/components/ui/chalk-equations';
import { getClassroomsForTeacher } from '@/lib/services/classrooms';
import { Classroom } from '@/lib/types';
import { ChevronDown, Loader2, Users } from 'lucide-react';

export default function CreateLessonPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [selectedClassroom, setSelectedClassroom] = useState<string>('');
    const [loading, setLoading] = useState(true);

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

            try {
                const data = await getClassroomsForTeacher(supabase, user.id);
                setClassrooms(data);
            } catch (err) {
                console.error('Failed to load classrooms:', err);
            }
            setLoading(false);
        };

        checkAuth();
    }, [router]);

    if (isAuthorized === null) {
        return (
            <div className="min-h-screen bg-[var(--page-bg)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="text-[var(--accent)] animate-spin" />
                    <p className="text-[var(--accent)] font-pixel text-xs tracking-widest">VERIFYING AUTHORITY...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)] font-sans selection:bg-emerald-500/30">
            {/* Global Styles */}
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
                className="min-h-screen transition-[margin] duration-300 relative"
                style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}
            >
                {/* Ambient background glows — matches landing page */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-sky-500/[0.03] blur-[100px] rounded-full pointer-events-none" />

                <div className="px-8 py-12 relative z-10">
                    {/* Header */}
                    <div className="mb-10">
                        <p className="text-[var(--accent)] text-[10px] font-bold uppercase tracking-[0.3em] mb-4 font-pixel">Lesson Creator</p>
                        <h1 className="text-4xl lg:text-5xl font-serif-display text-[var(--text-primary)] leading-tight mb-3">
                            Build your <span className="text-[var(--accent)] italic">game</span>
                        </h1>
                        <p className="text-[var(--text-secondary)] text-lg font-sans-clean leading-relaxed max-w-2xl">
                            Upload a lesson plan and watch it transform into an interactive educational experience with video, music, and gameplay.
                        </p>
                    </div>

                    {/* Main Creation Area */}
                    <div className="max-w-4xl">
                        {/* Optional Classroom Selector */}
                        {!loading && classrooms.length > 0 && (
                            <div className="mb-6 max-w-xs">
                                <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-pixel mb-2 block">
                                    Classroom
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedClassroom}
                                        onChange={(e) => setSelectedClassroom(e.target.value)}
                                        className="w-full appearance-none px-3 py-2.5 bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-lg text-[var(--input-text)] font-sans-clean text-xs focus:border-[var(--input-focus-border)] focus:outline-none transition-colors cursor-pointer pr-8"
                                    >
                                        <option value="">None</option>
                                        {classrooms.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}{c.subject ? ` — ${c.subject}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                                </div>
                            </div>
                        )}

                        {/* Lesson Uploader */}
                        <Suspense fallback={
                            <div className="text-center py-12">
                                <div className="inline-flex items-center gap-3 px-5 py-3 bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-xl text-[var(--accent)] text-sm font-sans-clean">
                                    <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                                    Loading...
                                </div>
                            </div>
                        }>
                            <LessonUploader classroomId={selectedClassroom} />
                        </Suspense>
                    </div>
                </div>
            </main>
        </div>
    );
}
