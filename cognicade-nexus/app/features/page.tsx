'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import LandingNavbar from '@/components/ui/landing-navbar';
import {
    Sparkles,
    BarChart3,
    Gamepad2,
    Brain,
    Zap,
    Users,
    Trophy,
    BookOpen,
    Layers,
    ArrowRight,
    CheckCircle2,
    Monitor,
    Globe,
} from 'lucide-react';

const FEATURES_MAIN = [
    {
        icon: Gamepad2,
        label: 'GAME ENGINE',
        title: 'Turn Any Lesson Into a Game',
        description: 'Upload your curriculum and Nexus auto-generates fully playable educational games — RPGs, puzzles, battle modes, and more. No game development experience required.',
        color: 'emerald',
        accent: 'text-emerald-400',
        border: 'border-emerald-500/20',
        glow: 'bg-emerald-500/5',
        shadow: 'shadow-emerald-500/10',
        details: ['RPG, Battle, Puzzle, Racing modes', 'Auto-generated from your content', 'Works with any subject or grade level'],
    },
    {
        icon: Brain,
        label: 'AI CURRICULUM',
        title: 'AI That Understands Education',
        description: 'Our model is trained on pedagogy, not just language. It knows Bloom\'s Taxonomy, spaced repetition, and scaffolded learning — so every game actually teaches.',
        color: 'blue',
        accent: 'text-blue-400',
        border: 'border-blue-500/20',
        glow: 'bg-blue-500/5',
        shadow: 'shadow-blue-500/10',
        details: ['Bloom\'s Taxonomy alignment', 'Spaced repetition built-in', 'Adaptive difficulty per student'],
    },
    {
        icon: BarChart3,
        label: 'ANALYTICS',
        title: 'Real-Time Learning Insights',
        description: 'See exactly where students struggle and where they thrive. Live dashboards surface learning gaps before they become failing grades.',
        color: 'purple',
        accent: 'text-purple-400',
        border: 'border-purple-500/20',
        glow: 'bg-purple-500/5',
        shadow: 'shadow-purple-500/10',
        details: ['Per-student performance tracking', 'Class-wide heatmaps', 'Export reports to CSV / PDF'],
    },
    {
        icon: Trophy,
        label: 'ENGAGEMENT',
        title: 'Motivation That Actually Works',
        description: 'XP, leaderboards, badges, and streaks are woven into every game — not bolted on. Students don\'t even realize they\'re reviewing for the exam.',
        color: 'yellow',
        accent: 'text-yellow-400',
        border: 'border-yellow-500/20',
        glow: 'bg-yellow-500/5',
        shadow: 'shadow-yellow-500/10',
        details: ['XP and level progression', 'Class leaderboards', 'Achievement badge system'],
    },
];

const SECONDARY_FEATURES = [
    { icon: Layers, title: 'Multi-Format Upload', desc: 'PDFs, slides, docs, or plain text — Nexus ingests them all.' },
    { icon: Users, title: 'Class Management', desc: 'Invite students, create groups, and assign lessons in seconds.' },
    { icon: Monitor, title: 'Works Everywhere', desc: 'Browser-based — no installs. Chromebook, iPad, or laptop.' },
    { icon: Globe, title: 'Multilingual Support', desc: 'Generate games in 20+ languages for diverse classrooms.' },
    { icon: Zap, title: 'Instant Generation', desc: 'Go from upload to playable game in under 60 seconds.' },
    { icon: BookOpen, title: 'Standards-Aligned', desc: 'Tag lessons to Common Core, NGSS, or custom standards.' },
];

export default function FeaturesPage() {
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [heroInView, setHeroInView] = useState(false);
    const [cardsInView, setCardsInView] = useState(false);
    const [secondaryInView, setSecondaryInView] = useState(false);
    const [ctaInView, setCtaInView] = useState(false);

    const heroRef = useRef<HTMLElement>(null);
    const cardsRef = useRef<HTMLElement>(null);
    const secondaryRef = useRef<HTMLElement>(null);
    const ctaRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const opts = { threshold: 0.1 };
        const make = (setter: (v: boolean) => void) =>
            new IntersectionObserver(([e]) => { if (e.isIntersecting) setter(true); }, opts);
        const o1 = make(setHeroInView);
        const o2 = make(setCardsInView);
        const o3 = make(setSecondaryInView);
        const o4 = make(setCtaInView);
        if (heroRef.current) o1.observe(heroRef.current);
        if (cardsRef.current) o2.observe(cardsRef.current);
        if (secondaryRef.current) o3.observe(secondaryRef.current);
        if (ctaRef.current) o4.observe(ctaRef.current);
        return () => { o1.disconnect(); o2.disconnect(); o3.disconnect(); o4.disconnect(); };
    }, []);

    return (
        <div className="min-h-screen bg-[#0a1f18] text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden">

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;800&family=Press+Start+2P&display=swap');
                .font-pixel { font-family: 'Press Start 2P', cursive; }
                .font-serif-display { font-family: 'DM Serif Display', serif; }
                .font-sans-clean { font-family: 'Inter', sans-serif; }

                @keyframes reveal-up {
                    0%   { opacity: 0; transform: translateY(36px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-reveal-up { animation: reveal-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

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

                @keyframes glow-cta {
                    0%, 100% { box-shadow: 0 4px 0 #065f46, 0 0 28px rgba(52,211,153,0.35); }
                    50%       { box-shadow: 0 4px 0 #065f46, 0 0 55px rgba(52,211,153,0.6); }
                }
                .animate-glow-cta { animation: glow-cta 2.2s ease-in-out infinite; }

                @keyframes float-gentle {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50%       { transform: translateY(-10px) rotate(1deg); }
                }
                .animate-float-gentle { animation: float-gentle 4s ease-in-out infinite; }

                @keyframes grid-pulse {
                    0%, 100% { opacity: 0.4; }
                    50%       { opacity: 0.9; }
                }
                .animate-grid-pulse { animation: grid-pulse 5s ease-in-out infinite; }
            `}</style>

            <LandingNavbar scrolled={scrolled} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            <main id="main-content">
            {/* ── HERO ── */}
            <section ref={heroRef} className="relative pt-40 pb-24 overflow-hidden">
                {/* Ambient glows */}
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/6 blur-[130px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

                {/* Floating pixel coins */}
                <img src="/coin.png" alt="" className="absolute top-32 left-[8%] w-8 h-8 opacity-30 animate-float-gentle" style={{ imageRendering: 'pixelated' }} />
                <img src="/coin.png" alt="" className="absolute top-48 right-[12%] w-6 h-6 opacity-20 animate-float-gentle" style={{ imageRendering: 'pixelated', animationDelay: '1.2s' }} />
                <img src="/coin.png" alt="" className="absolute bottom-20 left-[18%] w-5 h-5 opacity-15 animate-float-gentle" style={{ imageRendering: 'pixelated', animationDelay: '0.8s' }} />

                <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                    <div
                        className="opacity-0"
                        style={heroInView ? { animation: 'reveal-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s forwards' } : {}}
                    >
                        <span className="inline-block px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-pixel text-emerald-400 tracking-widest uppercase mb-6">
                            Platform Features
                        </span>
                    </div>

                    <h1
                        className="text-5xl lg:text-7xl font-serif-display text-white leading-tight mb-6 opacity-0"
                        style={heroInView ? { animation: 'reveal-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s forwards' } : {}}
                    >
                        Everything You Need to{' '}
                        <span className="animate-shimmer">Gamify Learning</span>
                    </h1>

                    <p
                        className="text-slate-400 text-lg lg:text-xl font-sans-clean leading-relaxed max-w-2xl mx-auto mb-10 opacity-0"
                        style={heroInView ? { animation: 'reveal-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s forwards' } : {}}
                    >
                        Nexus turns your existing curriculum into immersive educational games — with real-time analytics to prove it works.
                    </p>

                    <div
                        className="flex flex-wrap gap-4 justify-center opacity-0"
                        style={heroInView ? { animation: 'reveal-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.5s forwards' } : {}}
                    >
                        <Link href="/auth/sign-up">
                            <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] font-bold text-base rounded-xl transition-all animate-glow-cta shadow-[0_4px_0_#065f46] hover:translate-y-[2px] hover:shadow-[0_2px_0_#065f46] active:translate-y-[4px] active:shadow-none font-sans-clean">
                                Start for Free
                            </button>
                        </Link>
                        <Link href="/pricing">
                            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-base rounded-xl transition-all border border-white/10 hover:border-white/20 font-sans-clean flex items-center gap-2">
                                See Pricing <ArrowRight size={16} />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── MAIN FEATURE CARDS ── */}
            <section ref={cardsRef} className="py-20 relative">
                <div className="max-w-6xl mx-auto px-6">

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {FEATURES_MAIN.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <div
                                    key={f.label}
                                    className={`relative bg-[#0d281e] border ${f.border} rounded-2xl p-8 overflow-hidden group cursor-default hover:-translate-y-1 hover:shadow-lg ${f.shadow} transition-all duration-300 opacity-0`}
                                    style={cardsInView ? { animation: `reveal-up 0.7s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.12}s forwards` } : {}}
                                >
                                    {/* Background glow */}
                                    <div className={`absolute inset-0 ${f.glow} pointer-events-none`} />
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-white/2 to-transparent pointer-events-none" />

                                    <div className="relative z-10">
                                        {/* Label */}
                                        <span className={`text-[9px] font-pixel ${f.accent} tracking-[0.25em] uppercase`}>
                                            {f.label}
                                        </span>

                                        {/* Icon + Title */}
                                        <div className="flex items-start gap-4 mt-4 mb-4">
                                            <div className={`p-3 rounded-xl bg-white/5 border ${f.border} shrink-0`}>
                                                <Icon size={22} className={f.accent} />
                                            </div>
                                            <h3 className="text-2xl font-serif-display text-white leading-tight">
                                                {f.title}
                                            </h3>
                                        </div>

                                        {/* Description */}
                                        <p className="text-slate-400 text-sm font-sans-clean leading-relaxed mb-6">
                                            {f.description}
                                        </p>

                                        {/* Checklist details */}
                                        <ul className="space-y-2">
                                            {f.details.map(d => (
                                                <li key={d} className="flex items-center gap-2 text-sm font-sans-clean text-slate-300">
                                                    <CheckCircle2 size={14} className={f.accent} />
                                                    {d}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── SECONDARY FEATURES GRID ── */}
            <section ref={secondaryRef} className="py-20 relative">
                {/* Subtle divider glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

                <div className="max-w-6xl mx-auto px-6">
                    <div
                        className="text-center mb-14 opacity-0"
                        style={secondaryInView ? { animation: 'reveal-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s forwards' } : {}}
                    >
                        <span className="text-[10px] font-pixel text-emerald-400 tracking-[0.3em] uppercase">More Power</span>
                        <h2 className="text-4xl lg:text-5xl font-serif-display text-white mt-3">
                            Built for Real Classrooms
                        </h2>
                        <p className="text-slate-400 text-base font-sans-clean mt-3 max-w-xl mx-auto">
                            Every detail designed so teachers can focus on teaching, not technology.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {SECONDARY_FEATURES.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <div
                                    key={f.title}
                                    className="relative bg-[#0d281e] border border-white/5 rounded-xl p-6 overflow-hidden group hover:border-emerald-500/20 hover:-translate-y-1 transition-all duration-300 opacity-0"
                                    style={secondaryInView ? { animation: `reveal-up 0.6s cubic-bezier(0.16,1,0.3,1) ${0.15 + i * 0.08}s forwards` } : {}}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    <div className="relative z-10">
                                        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/15 inline-flex mb-4">
                                            <Icon size={18} className="text-emerald-400" />
                                        </div>
                                        <h4 className="text-base font-bold text-white mb-2 font-sans-clean">{f.title}</h4>
                                        <p className="text-slate-400 text-sm font-sans-clean leading-relaxed">{f.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section ref={ctaRef} className="py-24 relative overflow-hidden">
                {/* Grid background */}
                <div
                    className="absolute inset-0 animate-grid-pulse pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(52,211,153,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.04) 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a1f18] via-transparent to-[#0a1f18] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/8 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
                    <div
                        className="opacity-0"
                        style={ctaInView ? { animation: 'reveal-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s forwards' } : {}}
                    >
                        <img src="/coin.png" alt="" className="w-10 h-10 mx-auto mb-6 animate-float-gentle" style={{ imageRendering: 'pixelated' }} />
                        <h2 className="text-4xl lg:text-5xl font-serif-display text-white mb-4">
                            Ready to Level Up Your Class?
                        </h2>
                        <p className="text-slate-400 text-lg font-sans-clean mb-8">
                            Join thousands of educators turning lectures into adventures. Free to start, no credit card needed.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link href="/auth/sign-up">
                                <button className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] font-bold text-lg rounded-xl transition-all animate-glow-cta shadow-[0_4px_0_#065f46] hover:translate-y-[2px] hover:shadow-[0_2px_0_#065f46] active:translate-y-[4px] active:shadow-none font-sans-clean">
                                    Get Started Free
                                </button>
                            </Link>
                            <Link href="/pricing">
                                <button className="px-10 py-4 bg-white hover:bg-slate-100 text-[#0d281e] font-bold text-lg rounded-xl transition-all shadow-[0_4px_0px_#94a3b8] hover:translate-y-[2px] hover:shadow-[0_2px_0px_#94a3b8] active:translate-y-[4px] active:shadow-none font-sans-clean">
                                    View Pricing
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            </main>

            {/* ── FOOTER ── */}
            <footer className="border-t border-white/5 py-10">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <img src="/NEXUSLOGO.png" alt="Nexus" className="w-8 h-8 object-contain" />
                        <span className="text-white font-serif-display text-lg">Nexus</span>
                    </div>
                    <div className="flex gap-8 text-sm text-slate-500 font-sans-clean">
                        <Link href="/landing" className="hover:text-slate-300 transition-colors">Home</Link>
                        <Link href="/features" className="hover:text-slate-300 transition-colors">Features</Link>
                        <Link href="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
                        <Link href="/auth/login" className="hover:text-slate-300 transition-colors">Sign In</Link>
                    </div>
                    <p className="text-xs text-slate-600 font-sans-clean">© 2025 Nexus. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
