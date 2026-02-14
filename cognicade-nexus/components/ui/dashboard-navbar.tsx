'use client';

import Link from 'next/link';

export default function DashboardNavbar() {
    return (
        <div className="bg-[#0d281e]/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
            <div className="px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="text-xl text-white font-serif-display">Dashboard</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/landing" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
                        Back to Home
                    </Link>
                    <Link href="/create">
                        <button className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] font-bold rounded-lg transition-all shadow-lg hover:shadow-md active:shadow-none text-sm">
                            Create Lesson
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
