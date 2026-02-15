'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/sidebar';
import ChalkEquations from '@/components/ui/chalk-equations';
import { BarChart3, TrendingUp, Users, Clock, Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
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
            <div className="min-h-screen bg-[#0a1f18] flex items-center justify-center">
                <Loader2 size={40} className="text-emerald-500 animate-spin" />
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

            <div
                className="min-h-screen transition-[margin] duration-300"
                style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}
            >

                <div className="px-8 py-12">
                    <div className="mb-8">
                        <h1 className="text-4xl font-serif-display text-white mb-2">Analytics</h1>
                        <p className="text-slate-400 font-sans-clean">Track engagement and performance metrics</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-[#0d281e] border border-emerald-500/20 rounded-2xl p-6 hover:scale-[1.02] transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <BarChart3 className="text-emerald-400" size={24} />
                                </div>
                                <h3 className="text-white font-bold font-sans-clean">Student Engagement</h3>
                            </div>
                            <p className="text-slate-400 text-sm font-sans-clean">Coming soon: Detailed engagement metrics</p>
                        </div>

                        <div className="bg-[#0d281e] border border-blue-500/20 rounded-2xl p-6 hover:scale-[1.02] transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                    <TrendingUp className="text-blue-400" size={24} />
                                </div>
                                <h3 className="text-white font-bold font-sans-clean">Performance Trends</h3>
                            </div>
                            <p className="text-slate-400 text-sm font-sans-clean">Coming soon: Performance tracking over time</p>
                        </div>

                        <div className="bg-[#0d281e] border border-purple-500/20 rounded-2xl p-6 hover:scale-[1.02] transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                    <Clock className="text-purple-400" size={24} />
                                </div>
                                <h3 className="text-white font-bold font-sans-clean">Time Analytics</h3>
                            </div>
                            <p className="text-slate-400 text-sm font-sans-clean">Coming soon: Time spent analysis</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
