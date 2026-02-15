'use client';

import Link from 'next/link';

export default function DashboardNavbar() {
    return (
        <div className="bg-[#0d281e]/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
            <div className="px-8 py-4 flex justify-between items-center">
                <Link href="/landing" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <img src="/NEXUSLOGO.png" alt="Nexus" className="w-8 h-8 object-contain" />
                    <span className="text-xl text-white font-serif-display">Nexus</span>
                </Link>
                <div className="flex items-center gap-6">
                    <Link href="/landing" className="text-slate-400 hover:text-white transition-colors text-sm font-medium font-sans-clean">
                        Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
