'use client';

import Sidebar from '@/components/sidebar';
import DashboardNavbar from '@/components/ui/dashboard-navbar';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <div className="min-h-screen bg-[#0a1f18] text-slate-100">
            <Sidebar />

            <div className="ml-64 min-h-screen">
                <DashboardNavbar />

                <div className="px-8 py-12">
                    <div className="mb-8">
                        <h1 className="text-4xl font-serif-display text-white mb-2">Analytics</h1>
                        <p className="text-slate-400">Track engagement and performance metrics</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-[#0d281e] border border-emerald-500/20 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <BarChart3 className="text-emerald-400" size={24} />
                                </div>
                                <h3 className="text-white font-bold">Student Engagement</h3>
                            </div>
                            <p className="text-slate-400 text-sm">Coming soon: Detailed engagement metrics</p>
                        </div>

                        <div className="bg-[#0d281e] border border-blue-500/20 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                    <TrendingUp className="text-blue-400" size={24} />
                                </div>
                                <h3 className="text-white font-bold">Performance Trends</h3>
                            </div>
                            <p className="text-slate-400 text-sm">Coming soon: Performance tracking over time</p>
                        </div>

                        <div className="bg-[#0d281e] border border-purple-500/20 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                    <Clock className="text-purple-400" size={24} />
                                </div>
                                <h3 className="text-white font-bold">Time Analytics</h3>
                            </div>
                            <p className="text-slate-400 text-sm">Coming soon: Time spent analysis</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
