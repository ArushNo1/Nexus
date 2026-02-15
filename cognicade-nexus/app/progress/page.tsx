'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/sidebar';
import ChalkEquations from '@/components/ui/chalk-equations';
import { Target, TrendingUp, Award, Clock } from 'lucide-react';

export default function ProgressPage() {
    const [loading, setLoading] = useState(true);
    const [progressData, setProgressData] = useState<any[]>([]);

    useEffect(() => {
        const loadProgress = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data } = await supabase
                    .from('student_progress')
                    .select('*')
                    .eq('student_id', user.id);

                setProgressData(data || []);
            }
            setLoading(false);
        };

        loadProgress();
    }, []);

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

            <main
                id="main-content"
                className="min-h-screen transition-[margin] duration-300"
                style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}
            >

                <div className="px-8 py-12">
                    <div className="mb-8">
                        <h1 className="text-4xl font-serif-display text-white mb-2">My Progress</h1>
                        <p className="text-slate-400 font-sans-clean">Track your learning journey and achievements</p>
                    </div>

                    {loading ? (
                        <p className="text-slate-400 font-sans-clean">Loading your progress...</p>
                    ) : progressData.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {progressData.map((progress) => (
                                <div
                                    key={progress.id}
                                    className="bg-[#0d281e] border border-emerald-500/20 rounded-2xl p-6 hover:scale-[1.02] transition-all"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-white font-bold text-xl mb-1 font-sans-clean">Lesson Progress</h3>
                                            <p className="text-slate-400 text-sm capitalize font-sans-clean">{progress.status}</p>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold font-sans-clean">
                                            {progress.completion_percentage}%
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {progress.score !== null && (
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <Award size={16} className="text-yellow-400" />
                                                <span className="text-sm font-sans-clean">Score: {progress.score}%</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Clock size={16} className="text-blue-400" />
                                            <span className="text-sm font-sans-clean">
                                                Time spent: {Math.round(progress.time_spent_seconds / 60)} minutes
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Target size={16} className="text-purple-400" />
                                            <span className="text-sm font-sans-clean">Attempts: {progress.attempts}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 w-full bg-black/20 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 transition-all"
                                            style={{ width: `${progress.completion_percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-[#0d281e] border border-emerald-500/20 rounded-2xl p-12 text-center">
                            <Target className="mx-auto text-emerald-400 mb-4" size={48} />
                            <h3 className="text-white font-bold text-xl mb-2 font-sans-clean">No Progress Yet</h3>
                            <p className="text-slate-400 font-sans-clean">
                                Start completing lessons to see your progress here!
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
