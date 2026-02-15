'use client';

import Sidebar from '@/components/sidebar';
import ChalkEquations from '@/components/ui/chalk-equations';
import { Trophy, Award, Star, Target } from 'lucide-react';

export default function AchievementsPage() {
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
                        <h1 className="text-4xl font-serif-display text-white mb-2">Achievements</h1>
                        <p className="text-slate-400 font-sans-clean">Track your accomplishments and milestones</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[
                            { icon: Trophy, label: 'First Lesson', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                            { icon: Award, label: 'Top Performer', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                            { icon: Star, label: 'Perfect Score', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                            { icon: Target, label: 'Goal Crusher', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                        ].map((achievement, idx) => (
                            <div key={idx} className="bg-[#0d281e] border border-white/10 rounded-2xl p-6 text-center opacity-50 hover:scale-[1.02] transition-all">
                                <div className={`p-4 rounded-full ${achievement.bg} mx-auto w-fit mb-4`}>
                                    <achievement.icon className={achievement.color} size={32} />
                                </div>
                                <h3 className="text-white font-bold mb-1 font-sans-clean">{achievement.label}</h3>
                                <p className="text-slate-500 text-sm font-sans-clean">Locked</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-[#0d281e] border border-emerald-500/20 rounded-2xl p-8 text-center">
                        <p className="text-slate-400 font-sans-clean">
                            Achievement system coming soon! Complete lessons and challenges to unlock badges.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
