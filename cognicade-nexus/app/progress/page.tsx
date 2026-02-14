'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/sidebar';
import DashboardNavbar from '@/components/ui/dashboard-navbar';
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
            <Sidebar />

            <div className="ml-64 min-h-screen">
                <DashboardNavbar />

                <div className="px-8 py-12">
                    <div className="mb-8">
                        <h1 className="text-4xl font-serif-display text-white mb-2">My Progress</h1>
                        <p className="text-slate-400">Track your learning journey and achievements</p>
                    </div>

                    {loading ? (
                        <p className="text-slate-400">Loading your progress...</p>
                    ) : progressData.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {progressData.map((progress) => (
                                <div
                                    key={progress.id}
                                    className="bg-[#0d281e] border border-emerald-500/20 rounded-2xl p-6"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-white font-bold text-xl mb-1">Lesson Progress</h3>
                                            <p className="text-slate-400 text-sm capitalize">{progress.status}</p>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                                            {progress.completion_percentage}%
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {progress.score !== null && (
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <Award size={16} className="text-yellow-400" />
                                                <span className="text-sm">Score: {progress.score}%</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Clock size={16} className="text-blue-400" />
                                            <span className="text-sm">
                                                Time spent: {Math.round(progress.time_spent_seconds / 60)} minutes
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Target size={16} className="text-purple-400" />
                                            <span className="text-sm">Attempts: {progress.attempts}</span>
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
                            <h3 className="text-white font-bold text-xl mb-2">No Progress Yet</h3>
                            <p className="text-slate-400">
                                Start completing lessons to see your progress here!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
