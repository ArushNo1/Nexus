'use client';

import Sidebar from '@/components/sidebar';
import DashboardNavbar from '@/components/ui/dashboard-navbar';
import { Gamepad2, Zap, Brain, Puzzle } from 'lucide-react';

export default function LibraryPage() {
    const gameTypes = [
        {
            name: 'Quiz Master',
            description: 'Interactive quiz games',
            icon: Brain,
            color: 'emerald',
        },
        {
            name: 'Puzzle Challenge',
            description: 'Problem-solving puzzles',
            icon: Puzzle,
            color: 'purple',
        },
        {
            name: 'Speed Round',
            description: 'Fast-paced challenges',
            icon: Zap,
            color: 'yellow',
        },
    ];

    return (
        <div className="min-h-screen bg-[#0a1f18] text-slate-100">
            {/* Global Styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;800&family=Press+Start+2P&display=swap');
                
                .font-pixel { font-family: 'Press Start 2P', cursive; }
                .font-serif-display { font-family: 'DM Serif Display', serif; }
                .font-sans-clean { font-family: 'Inter', sans-serif; }
            `}</style>

            <Sidebar />

            <div className="ml-64 min-h-screen">
                <DashboardNavbar />

                <div className="px-8 py-12">
                    <div className="mb-8">
                        <h1 className="text-4xl font-serif-display text-white mb-2">Game Library</h1>
                        <p className="text-slate-400 font-sans-clean">Browse available game templates for your lessons</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gameTypes.map((game, idx) => (
                            <div
                                key={idx}
                                className="bg-[#0d281e] border border-emerald-500/20 rounded-2xl p-6 hover:scale-[1.02] transition-all cursor-pointer group"
                            >
                                <div className="p-4 rounded-full bg-emerald-500/10 w-fit mb-4 group-hover:bg-emerald-500/20 transition-colors">
                                    <game.icon className="text-emerald-400" size={32} />
                                </div>
                                <h3 className="text-white font-bold text-xl mb-2 font-sans-clean">{game.name}</h3>
                                <p className="text-slate-400 text-sm mb-4 font-sans-clean">{game.description}</p>
                                <span className="text-emerald-400 text-sm font-medium font-sans-clean">Coming Soon</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
