'use client';

import Sidebar from '@/components/sidebar';
import DashboardNavbar from '@/components/ui/dashboard-navbar';
import { Users, UserPlus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function StudentsPage() {
    return (
        <div className="min-h-screen bg-[#0a1f18] text-slate-100">
            <Sidebar />

            <div className="ml-64 min-h-screen">
                <DashboardNavbar />

                <div className="px-8 py-12">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-serif-display text-white mb-2">Students</h1>
                            <p className="text-slate-400">Manage your students and view their progress</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                            <Input
                                placeholder="Search students..."
                                className="pl-10 bg-[#0d281e] border-emerald-500/20 text-white"
                            />
                        </div>
                    </div>

                    <div className="bg-[#0d281e] border border-emerald-500/20 rounded-2xl p-12 text-center">
                        <Users className="mx-auto text-emerald-400 mb-4" size={48} />
                        <h3 className="text-white font-bold text-xl mb-2">Student Management</h3>
                        <p className="text-slate-400 mb-4">
                            View and manage students across all your classrooms
                        </p>
                        <p className="text-slate-500 text-sm">
                            This feature is coming soon. You can currently view students in individual classroom pages.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
