'use client';

import { Suspense, useState, useEffect } from 'react';
import { LessonUploader } from '@/components/lesson-uploader';
import LandingNavbar from '@/components/ui/landing-navbar';

export default function CreateLessonPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#0a1f18] text-slate-100 font-sans selection:bg-emerald-500/30">
            {/* Global Styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;800&family=Press+Start+2P&display=swap');

                .font-pixel { font-family: 'Press Start 2P', cursive; }
                .font-serif-display { font-family: 'DM Serif Display', serif; }
                .font-sans-clean { font-family: 'Inter', sans-serif; }

                @keyframes float-gentle {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                .animate-float-gentle { animation: float-gentle 4s ease-in-out infinite; }

                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(52,211,153,0.2); }
                    50% { box-shadow: 0 0 40px rgba(52,211,153,0.4); }
                }

                @keyframes shimmer {
                    0%   { background-position: -300% center; }
                    100% { background-position:  300% center; }
                }
                .animate-shimmer {
                    background: linear-gradient(90deg, #6ee7b7 0%, #fff 40%, #34d399 60%, #6ee7b7 100%);
                    background-size: 300% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer 4s linear infinite;
                }

                @keyframes chalk-drift {
                    0% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
                    50% { transform: translateY(-12px) rotate(calc(var(--rot, 0deg) + 3deg)); }
                    100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
                }
                .animate-chalk-drift { animation: chalk-drift var(--dur, 6s) ease-in-out infinite; }
            `}</style>

            <LandingNavbar scrolled={scrolled} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            {/* Ambient background glows */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/[0.04] blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-sky-500/[0.04] blur-[100px] rounded-full pointer-events-none" />

            {/* Floating chalk formulas */}
            <div className="hidden lg:block fixed inset-0 pointer-events-none select-none font-serif-display text-white z-0 overflow-hidden">
                <span className="absolute top-[12%] left-[4%] text-2xl opacity-[0.06] animate-chalk-drift" style={{ '--rot': '8deg', '--dur': '9s' } as React.CSSProperties}>f(x) = ax + b</span>
                <span className="absolute top-[30%] right-[5%] text-3xl opacity-[0.05] animate-chalk-drift" style={{ '--rot': '-5deg', '--dur': '7s', animationDelay: '2s' } as React.CSSProperties}>E = mc</span>
                <span className="absolute top-[60%] left-[6%] text-xl opacity-[0.05] animate-chalk-drift" style={{ '--rot': '4deg', '--dur': '10s', animationDelay: '1s' } as React.CSSProperties}>F = ma</span>
                <span className="absolute top-[75%] right-[8%] text-2xl opacity-[0.06] animate-chalk-drift" style={{ '--rot': '-7deg', '--dur': '8s', animationDelay: '3s' } as React.CSSProperties}>a + b = c</span>
            </div>

            {/* Floating coins */}
            <img src="/coin.png" alt="" className="fixed bottom-20 right-16 w-10 opacity-15 animate-float-gentle pointer-events-none z-0" style={{ imageRendering: 'pixelated' }} />
            <img src="/coin.png" alt="" className="fixed top-32 left-12 w-7 opacity-10 animate-float-gentle pointer-events-none z-0" style={{ imageRendering: 'pixelated', animationDelay: '1.5s' }} />

            <div className="relative z-10 pt-28 pb-16 px-6">
                {/* Header */}
                <header className="mb-12 text-center max-w-3xl mx-auto">
                    <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-5 font-pixel">Lesson Creator</p>
                    <h1 className="text-5xl lg:text-6xl font-serif-display text-white leading-tight mb-5">
                        Build your <span className="text-emerald-400 italic">game</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-sans-clean leading-relaxed max-w-xl mx-auto">
                        Upload a lesson plan and watch it transform into an interactive educational experience with video, music, and gameplay.
                    </p>
                </header>

                <main className="relative z-10 max-w-5xl mx-auto">
                    <Suspense fallback={
                        <div className="text-center py-12">
                            <div className="inline-flex items-center gap-3 px-5 py-3 bg-[#0d281e] border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-sans-clean">
                                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                Loading...
                            </div>
                        </div>
                    }>
                        <LessonUploader />
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
