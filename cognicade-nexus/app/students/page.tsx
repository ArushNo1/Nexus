'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/sidebar';
import ChalkEquations from '@/components/ui/chalk-equations';
import { Users, UserPlus, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function StudentsPage() {
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
                router.push('/dashboard');
                return;
            }

            setIsAuthorized(true);
        };

        checkAuth();
    }, [router]);

    if (isAuthorized === null) {
        return (
            <div className="min-h-screen bg-[var(--page-bg)] flex items-center justify-center">
                <Loader2 size={40} className="text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--page-bg)] text-slate-100">
            {/* Global Styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;800&family=Press+Start+2P&display=swap');
                
                .font-pixel { font-family: 'Press Start 2P', cursive; }
                .font-serif-display { font-family: 'DM Serif Display', serif; }
                .font-sans-clean { font-family: 'Inter', sans-serif; }
            `}</style>

            <ChalkEquations />
            <Sidebar />

<<<<<<< Updated upstream
            <main
                id="main-content"
                className="min-h-screen transition-[margin] duration-300"
=======
            <div
                className="min-h-screen transition-[margin] duration-300 relative"
>>>>>>> Stashed changes
                style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}
            >
                {/* Ambient background glows — matches landing page */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-sky-500/[0.03] blur-[100px] rounded-full pointer-events-none" />

                <div className="px-8 py-12 relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-serif-display text-white mb-2">Students</h1>
                            <p className="text-slate-400 font-sans-clean">Manage your students and view their progress</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                            <Input
                                placeholder="Search students..."
                                className="pl-10 bg-[var(--card-bg)] border-2 border-[var(--card-border)] text-white font-sans-clean"
                            />
                        </div>
                    </div>

                    <div className="bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-2xl p-12 text-center">
                        <Users className="mx-auto text-emerald-400 mb-4" size={48} />
                        <h3 className="text-white font-bold text-xl mb-2 font-sans-clean">Student Management</h3>
                        <p className="text-slate-400 mb-4 font-sans-clean">
                            View and manage students across all your classrooms
                        </p>
                        <p className="text-slate-500 text-sm font-sans-clean">
                            This feature is coming soon. You can currently view students in individual classroom pages.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
