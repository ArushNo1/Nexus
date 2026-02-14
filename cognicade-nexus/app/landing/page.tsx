'use client';

import React, { useState, useEffect } from 'react';
import {
    Gamepad2,
    TrendingDown,
    BrainCircuit,
    Zap,
    Menu,
    X,
    ArrowRight
} from 'lucide-react';

/* --- DATA CONSTANTS --- */
const GAME_MODES = [
    { label: 'RPG MODE', subject: 'History', title: 'The Timekeeper', color: 'text-emerald-300', bg: 'bg-emerald-900/40', border: 'border-emerald-500/20' },
    { label: 'BATTLE', subject: 'Calculus', title: 'Derivative Dungeon', color: 'text-red-300', bg: 'bg-red-900/40', border: 'border-red-500/20' },
    { label: 'SIM', subject: 'Physics', title: 'Gravity Lab', color: 'text-blue-300', bg: 'bg-blue-900/40', border: 'border-blue-500/20' },
    { label: 'PUZZLE', subject: 'Logic', title: 'Code Breaker', color: 'text-purple-300', bg: 'bg-purple-900/40', border: 'border-purple-500/20' },
    { label: 'RACING', subject: 'Vocab', title: 'Speed Reader', color: 'text-yellow-300', bg: 'bg-yellow-900/40', border: 'border-yellow-500/20' },
];

export default function NexusLanding() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#0a1f18] text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden">

            {/* --- GLOBAL STYLES & FONTS --- */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;800&family=Press+Start+2P&display=swap');
                
                .font-pixel { font-family: 'Press Start 2P', cursive; }
                .font-serif-display { font-family: 'DM Serif Display', serif; }
                .font-sans-clean { font-family: 'Inter', sans-serif; }

                /* PALETTE: Deep Blackboard */
                .bg-academic-dark {
                    background-color: #0d281e; 
                }
                
                /* CHALK TEXTURE */
                .bg-chalk-texture {
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
                }

                /* CRT SCANLINE EFFECT */
                .scanlines {
                    background: linear-gradient(
                        to bottom, 
                        rgba(255,255,255,0), 
                        rgba(255,255,255,0) 50%, 
                        rgba(0,0,0,0.1) 50%, 
                        rgba(0,0,0,0.1)
                    );
                    background-size: 100% 4px;
                    pointer-events: none;
                }

                /* ANIMATIONS */
                @keyframes float-pixel { 
                    0%, 100% { transform: translateY(0px); } 
                    50% { transform: translateY(-6px); } 
                }
                .animate-float-pixel { animation: float-pixel 3s step-end infinite; }
            `}</style>

            {/* ================= NAV ================= */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0d281e]/90 backdrop-blur-md py-4 border-b border-white/5 shadow-md' : 'bg-transparent py-8'}`}>
                <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center font-serif-display text-white text-xl border border-white/20 backdrop-blur-sm">
                            N
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white font-sans-clean">NEXUS</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-12 text-sm font-medium text-slate-300">
                        <a href="#" className="hover:text-white transition-colors">Methodology</a>
                        <a href="#" className="hover:text-white transition-colors">Features</a>
                        <a href="#" className="hover:text-white transition-colors">Pricing</a>
                        {/* White Button (Chalk style) */}
                        <button className="px-6 py-2.5 bg-white text-[#0d281e] font-bold rounded-lg hover:bg-slate-200 transition-all shadow-md">
                            Sign In
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* ================= HERO SECTION (SPLIT WORLD) ================= */}
            <section className="relative min-h-[100vh] w-full flex flex-col lg:flex-row overflow-hidden">

                {/* --- LEFT: ACADEMIC WORLD (Blackboard) --- */}
                {/* Harsh transition: No borders, no spikes. Just clean color edge. */}
                <div className="relative w-full lg:w-1/2 bg-academic-dark bg-chalk-texture flex flex-col justify-center px-8 lg:px-20 py-24 lg:py-0 z-10">

                    {/* Background Formulas */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none select-none font-serif-display text-white">
                        <span className="absolute top-32 left-10 text-3xl rotate-12">∫ x² dx</span>
                        <span className="absolute bottom-40 right-10 text-4xl -rotate-6">E = mc²</span>
                        <span className="absolute top-1/2 left-4 text-2xl">C₆H₁₂O₆</span>
                    </div>

                    <div className="relative z-20 max-w-xl">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 text-slate-300 text-[10px] font-bold uppercase tracking-widest mb-8 font-sans-clean backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            For K-12 Educators
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-serif-display text-white leading-[1.1] mb-8 drop-shadow-lg">
                            Make learning <br />
                            <span className="text-emerald-400 italic">feel like...</span>
                        </h1>

                        <p className="text-slate-300 text-lg leading-relaxed mb-10 max-w-md font-sans-clean font-medium">
                            Transform static lesson plans into interactive worlds.
                            Bridge the gap between curriculum and engagement instantly.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            {/* CTA: White Button */}
                            <button className="group flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-[#0d281e] font-bold rounded-lg transition-all shadow-[0_4px_0px_#94a3b8] hover:translate-y-[2px] hover:shadow-[0_2px_0px_#94a3b8] active:translate-y-[4px] active:shadow-none font-sans-clean">
                                Start Building
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="px-8 py-4 border-2 border-white/20 hover:border-white/50 text-white rounded-lg transition-colors font-medium backdrop-blur-sm bg-white/5">
                                View Demo
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: GAME WORLD (Sky Blue) --- */}
                {/* Clean vertical split */}
                <div className="relative w-full lg:w-1/2 bg-[#38bdf8] flex items-center justify-center min-h-[50vh] lg:min-h-auto">
                    {/* Sky Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0ea5e9] to-[#38bdf8] z-0"></div>
                    <div className="absolute inset-0 scanlines opacity-20 z-10 mix-blend-overlay"></div>

                    {/* Game Assets */}
                    <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
                        {/* Clouds */}
                        <img src="/cloud_0.png" className="absolute top-20 right-20 w-32 opacity-90 animate-float-pixel" style={{ imageRendering: 'pixelated' }} alt="" />
                        <img src="/cloud_1.png" className="absolute top-40 left-10 w-24 opacity-80 animate-float-pixel" style={{ imageRendering: 'pixelated', animationDelay: '1s' }} alt="" />

                        {/* Ground & Platforms */}
                        <div className="absolute bottom-0 w-full h-20" style={{ backgroundImage: "url('/ground.png')", backgroundSize: 'contain', imageRendering: 'pixelated' }}></div>
                        <img src="/platform.png" className="absolute bottom-32 left-10 w-32" style={{ imageRendering: 'pixelated' }} alt="" />
                        <img src="/platform.png" className="absolute bottom-52 right-10 w-32" style={{ imageRendering: 'pixelated' }} alt="" />

                        {/* Coin (Gold) */}
                        <div className="absolute bottom-52 left-20 animate-bounce">
                            <div className="w-8 h-8 bg-[#FFD700] border-4 border-black rounded-sm flex items-center justify-center shadow-md">
                                <span className="font-pixel text-black text-[10px] mt-1">$</span>
                            </div>
                        </div>
                    </div>

                    {/* PLAY Text */}
                    <div className="relative z-20 transform -rotate-2">
                        <h2 className="text-[5rem] md:text-[8rem] lg:text-[9rem] text-[#FFD700] leading-none select-none font-pixel tracking-tighter"
                            style={{
                                textShadow: '6px 6px 0px #b45309, 10px 10px 0px rgba(0,0,0,0.3)'
                            }}
                        >
                            PLAY
                        </h2>
                        {/* Score UI */}
                        <div className="absolute -top-12 right-0 bg-black/60 backdrop-blur-sm px-3 py-2 border-2 border-white/30 text-white font-pixel text-[10px] rounded-sm shadow-lg">
                            SCORE: <span className="text-[#FFD700]">99999</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= VARIETY SECTION ================= */}
            <section className="py-24 bg-[#0a1f18] border-t border-white/5 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-6 mb-12 text-center relative z-10">
                    <h2 className="text-3xl font-bold font-serif-display text-white">Choose your adventure</h2>
                    <p className="text-slate-400 mt-2 font-sans-clean">The curriculum adapts to the genre.</p>
                </div>

                <div className="flex gap-6 w-max animate-[scroll_40s_linear_infinite]">
                    {[...GAME_MODES, ...GAME_MODES, ...GAME_MODES].map((game, i) => (
                        <div key={i} className={`
                            group relative w-64 h-40 rounded-xl border ${game.border} ${game.bg} 
                            backdrop-blur-sm p-5 flex flex-col justify-between hover:scale-105 hover:bg-opacity-50 transition-all cursor-pointer shadow-lg
                        `}>
                            <div className="flex justify-between items-start">
                                <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded bg-black/20 ${game.color}`}>
                                    {game.label}
                                </span>
                                <Gamepad2 size={16} className={game.color} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg leading-tight group-hover:text-white transition-colors font-sans-clean">
                                    {game.title}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">{game.subject} Module</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ================= BENTO GRID (Why Nexus) ================= */}
            <section className="py-24 bg-[#0a1f18] relative">
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold font-serif-display text-white mb-4">Why it works</h2>
                        <div className="h-1 w-24 bg-emerald-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">

                        {/* CARD 1: Engagement */}
                        <div className="md:col-span-6 lg:col-span-8 bg-[#0d281e] border border-white/5 rounded-2xl p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-6 border border-red-500/20">
                                    <TrendingDown className="text-red-400" size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3 font-sans-clean">Fixing the <span className="text-red-400 decoration-wavy underline">Engagement Drop</span></h3>
                                <p className="text-slate-400 max-w-sm">Traditional slides lose students after 8 minutes. Nexus resets the attention clock every time a new game mechanic is introduced.</p>
                            </div>
                        </div>

                        {/* CARD 2: Complexity */}
                        <div className="md:col-span-6 lg:col-span-4 bg-[#0d281e] border border-white/5 rounded-2xl p-8 flex flex-col justify-between group hover:border-purple-500/30 transition-colors">
                            <div>
                                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6 border border-purple-500/20">
                                    <BrainCircuit className="text-purple-400" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 font-sans-clean">Complex Topics</h3>
                                <p className="text-slate-400 text-sm">We turn "hard" subjects into boss battles. Harder levels = deeper understanding.</p>
                            </div>
                            <div className="mt-8 p-3 bg-black/40 rounded-lg border border-white/5">
                                <div className="flex justify-between text-[10px] text-purple-300 font-pixel mb-2">
                                    <span>BOSS HP</span>
                                    <span>85%</span>
                                </div>
                                <div className="w-full bg-[#0a1f18] h-2 rounded-full overflow-hidden">
                                    <div className="bg-purple-500 w-[85%] h-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* CARD 3: Feedback */}
                        <div className="md:col-span-6 lg:col-span-12 bg-gradient-to-r from-[#0d281e] to-[#0a1f18] border border-white/5 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                        <Zap className="text-emerald-400" size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white font-sans-clean">Instant Feedback Loops</h3>
                                </div>
                                <p className="text-slate-400">Forget grading papers on weekends. Students get instant visual feedback on their performance, allowing them to self-correct in real-time.</p>
                            </div>
                            <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform whitespace-nowrap">
                                See Analytics Dashboard
                            </button>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}