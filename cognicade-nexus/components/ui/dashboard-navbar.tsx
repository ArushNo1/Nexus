'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function DashboardNavbar() {
    const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setUserRole(profile.role);
                }
            }
        };

        fetchUserRole();
    }, []);

    return (
        <nav aria-label="Dashboard navigation" className="bg-[#0d281e]/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
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
        </nav>
    );
}
