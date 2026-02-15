'use client';

import Sidebar from '@/components/sidebar';
import ChalkEquations from '@/components/ui/chalk-equations';
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
        <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
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
                        <h1 className="text-4xl font-serif-display text-[var(--text-heading)] mb-2">Game Library</h1>
                        <p className="text-[var(--text-subheading)] font-sans-clean">Browse available game templates for your lessons</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gameTypes.map((game, idx) => (
                            <div
                                key={idx}
                                className="bg-[var(--card-bg)] border border-[var(--accent-border)] rounded-2xl p-6 hover:scale-[1.02] transition-all cursor-pointer group"
                            >
                                <div className="p-4 rounded-full bg-[var(--accent-bg)] w-fit mb-4 group-hover:bg-[var(--accent-dark)] transition-colors">
                                    <game.icon className="text-[var(--accent)]" size={32} />
                                </div>
                                <h3 className="text-[var(--text-primary)] font-bold text-xl mb-2 font-sans-clean">{game.name}</h3>
                                <p className="text-[var(--text-secondary)] text-sm mb-4 font-sans-clean">{game.description}</p>
                                <span className="text-[var(--accent)] text-sm font-medium font-sans-clean">Coming Soon</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
