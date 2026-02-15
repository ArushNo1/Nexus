'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Gamepad2,
    TrendingDown,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import LandingNavbar from '@/components/ui/landing-navbar';
import { createClient } from '@/lib/supabase/client';

/* --- DATA CONSTANTS --- */
const GAME_MODES = [
    { label: 'RPG MODE', subject: 'History', title: 'The Timekeeper', color: 'text-emerald-300', bg: 'bg-emerald-900/40', border: 'border-emerald-500/20' },
    { label: 'BATTLE', subject: 'Calculus', title: 'Derivative Dungeon', color: 'text-red-300', bg: 'bg-red-900/40', border: 'border-red-500/20' },
    { label: 'SIM', subject: 'Physics', title: 'Gravity Lab', color: 'text-blue-300', bg: 'bg-blue-900/40', border: 'border-blue-500/20' },
    { label: 'PUZZLE', subject: 'Logic', title: 'Code Breaker', color: 'text-purple-300', bg: 'bg-purple-900/40', border: 'border-purple-500/20' },
    { label: 'RACING', subject: 'Vocab', title: 'Speed Reader', color: 'text-yellow-300', bg: 'bg-yellow-900/40', border: 'border-yellow-500/20' },
];

type Particle = { id: number; x: number; y: number; size: number; color: string; createdAt: number };

const PARTICLE_COLORS = ['#FFD700', '#ffffff', '#7dd3fc', '#fbbf24', '#34d399'];
let particleId = 0;

export default function NexusLanding() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [varInView, setVarInView] = useState(false);
    const [whyInView, setWhyInView] = useState(false);
    const [ctaInView, setCtaInView] = useState(false);
    const mousePos = useRef<{ x: number; y: number } | null>(null);
    const emitInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const varRef = useRef<HTMLElement>(null);
    const whyRef = useRef<HTMLElement>(null);
    const ctaRef = useRef<HTMLElement>(null);

    // Redirect to dashboard if user is logged in
    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
            }
        };
        checkAuth();
    }, [router]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Intersection observers for scroll-reveal animations
    useEffect(() => {
        const opts = { threshold: 0.12 };
        const make = (setter: (v: boolean) => void) =>
            new IntersectionObserver(([e]) => { if (e.isIntersecting) setter(true); }, opts);
        const o1 = make(setVarInView); const o2 = make(setWhyInView); const o3 = make(setCtaInView);
        if (varRef.current) o1.observe(varRef.current);
        if (whyRef.current) o2.observe(whyRef.current);
        if (ctaRef.current) o3.observe(ctaRef.current);
        return () => { o1.disconnect(); o2.disconnect(); o3.disconnect(); };
    }, []);

    // Cull particles older than 700ms
    useEffect(() => {
        if (particles.length === 0) return;
        const timer = setTimeout(() => {
            const now = Date.now();
            setParticles(p => p.filter(pt => now - pt.createdAt < 700));
        }, 50);
        return () => clearTimeout(timer);
    }, [particles]);

    const spawnParticles = useCallback((x: number, y: number) => {
        const now = Date.now();
        const count = Math.floor(Math.random() * 2) + 2;
        const newParticles: Particle[] = Array.from({ length: count }, () => ({
            id: particleId++,
            x: x + (Math.random() - 0.5) * 12,
            y: y + (Math.random() - 0.5) * 12,
            size: Math.random() * 10 + 5,
            color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
            createdAt: now,
        }));
        setParticles(p => [...p.slice(-60), ...newParticles]);
    }, []);

    const handleGameMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }, []);

    const handleGameMouseEnter = useCallback(() => {
        emitInterval.current = setInterval(() => {
            if (mousePos.current) {
                spawnParticles(mousePos.current.x, mousePos.current.y);
            }
        }, 40); // ~25 bursts/sec
    }, [spawnParticles]);

    const handleGameMouseLeave = useCallback(() => {
        if (emitInterval.current) clearInterval(emitInterval.current);
        emitInterval.current = null;
        mousePos.current = null;
        setParticles([]);
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
            .bg-academic-dark { background-color: #0d281e; }
            
            /* CHALK TEXTURE */
            .bg-chalk-texture {
                background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
            }

            /* CRT SCANLINE EFFECT */
            .scanlines {
                background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1));
                background-size: 100% 4px;
                pointer-events: none;
            }

            /* ANIMATIONS */
            @keyframes float-pixel {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-6px); }
            }
            .animate-float-pixel { animation: float-pixel 3s step-end infinite; }

            /* Chalk floating equations */
            @keyframes chalk-drift {
                0% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
                50% { transform: translateY(-12px) rotate(calc(var(--rot, 0deg) + 3deg)); }
                100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
            }
            .animate-chalk-drift { animation: chalk-drift var(--dur, 6s) ease-in-out infinite; }

            /* Chalk writing reveal */
            @keyframes chalk-write {
                0% { clip-path: inset(0 100% 0 0); opacity: 0; }
                20% { opacity: var(--start-opacity, 0.1); }
                100% { clip-path: inset(0 0% 0 0); opacity: var(--start-opacity, 0.1); }
            }
            .animate-chalk-write { animation: chalk-write var(--write-dur, 3s) ease-out forwards; }

            /* Gentle pulse glow for chalk */
            @keyframes chalk-glow {
                0%, 100% { text-shadow: 0 0 8px rgba(255,255,255,0.1); }
                50% { text-shadow: 0 0 20px rgba(255,255,255,0.25); }
            }
            .animate-chalk-glow { animation: chalk-glow 4s ease-in-out infinite; }

            /* Game side coin spin */
            @keyframes coin-float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-8px); }
            }
            .animate-coin-spin { animation: coin-float 1.4s ease-in-out infinite; }

            /* Question block bounce */
            @keyframes block-bump {
                0%, 100% { transform: translateY(0px); }
                15% { transform: translateY(-10px); }
                30% { transform: translateY(0px); }
            }
            .animate-block-bump { animation: block-bump 3s ease-in-out infinite; }

            /* Star twinkle */
            @keyframes twinkle {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.3); }
            }
            .animate-twinkle { animation: twinkle var(--twinkle-dur, 2s) ease-in-out infinite; }

            /* Pipe grow */
            @keyframes pipe-grow {
                0% { transform: scaleY(0); transform-origin: bottom; }
                100% { transform: scaleY(1); transform-origin: bottom; }
            }
            .animate-pipe-grow { animation: pipe-grow 0.8s ease-out forwards; }

            /* Particle float up */
            @keyframes particle-up {
                0% { transform: translateY(0) scale(1); opacity: 0.6; }
                100% { transform: translateY(-60px) scale(0.3); opacity: 0; }
            }
            .animate-particle-up { animation: particle-up var(--particle-dur, 3s) ease-out infinite; }

            /* Cursor trail particle */
            @keyframes particleFade {
                0%   { opacity: 1;   transform: translateY(0px)   scale(1)   rotate(0deg); }
                100% { opacity: 0;   transform: translateY(-24px) scale(0.2) rotate(180deg); }
            }

            /* Marquee for variety cards */
            @keyframes marquee {
                0%   { transform: translateX(0); }
                100% { transform: translateX(-33.333%); }
            }
            .animate-marquee { animation: marquee 30s linear infinite; }

            /* Gentle float for ambient elements */
            @keyframes float-gentle {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50%       { transform: translateY(-10px) rotate(1deg); }
            }
            .animate-float-gentle { animation: float-gentle 4s ease-in-out infinite; }

            /* Scroll-reveal: slide up and fade in */
            @keyframes reveal-up {
                0%   { opacity: 0; transform: translateY(36px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .animate-reveal-up { animation: reveal-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

            /* EEG / brain-wave line draw */
            @keyframes eeg-draw {
                0%   { stroke-dashoffset: 600; opacity: 0; }
                5%   { opacity: 1; }
                100% { stroke-dashoffset: 0; opacity: 1; }
            }

            /* Attention-span chart draw */
            @keyframes chart-draw {
                0%   { stroke-dashoffset: 700; }
                100% { stroke-dashoffset: 0; }
            }

            /* ZZZ drift animations */
            @keyframes zzz1 {
                0%   { opacity: 0; transform: translate(0,   0px) scale(0.6); }
                20%  { opacity: 1; }
                100% { opacity: 0; transform: translate(6px, -28px) scale(1.1); }
            }
            @keyframes zzz2 {
                0%   { opacity: 0; transform: translate(0,   0px) scale(0.5); }
                20%  { opacity: 1; }
                100% { opacity: 0; transform: translate(10px,-36px) scale(1.0); }
            }
            @keyframes zzz3 {
                0%   { opacity: 0; transform: translate(0,   0px) scale(0.4); }
                20%  { opacity: 1; }
                100% { opacity: 0; transform: translate(14px,-44px) scale(0.9); }
            }
            .animate-zzz1 { animation: zzz1 2.4s ease-out infinite; }
            .animate-zzz2 { animation: zzz2 2.4s ease-out infinite 0.6s; }
            .animate-zzz3 { animation: zzz3 2.4s ease-out infinite 1.2s; }

            /* CTA button glow pulse */
            @keyframes glow-cta {
                0%, 100% { box-shadow: 0 4px 0 #065f46, 0 0 28px rgba(52,211,153,0.35); }
                50%       { box-shadow: 0 4px 0 #065f46, 0 0 55px rgba(52,211,153,0.6); }
            }
            .animate-glow-cta { animation: glow-cta 2.2s ease-in-out infinite; }

            /* Shimmer sweep across text */
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

            /* Grid pulse for CTA background */
            @keyframes grid-pulse {
                0%, 100% { opacity: 0.4; }
                50%       { opacity: 0.9; }
            }
            .animate-grid-pulse { animation: grid-pulse 5s ease-in-out infinite; }

            /* --- NEW CUSTOM CURSOR --- */
            .cursor-pixel {
                cursor: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCA4VjI0SDEwVjI2SDEyVjI4SDE4VjI2SDIwVjI0SDIyVjIySDI0VjE0SDIyVjEySDIwVjEwSDE4VjhIOFoiIGZpbGw9IndoaXRlIi8+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04IDhINlYyNEg4VjhoWk0xMCAyNEg4VjI2SDEwVjI0Wk0xMiAyNkgxMFYyOEgxMlYyNlpNMTggMjZIMTJWMjZIMTh6TTIwIDI0SDE4VjI2SDIwVjI0Wk0yMiAyMkgyMFYyNEgyMlYyMlpNMjQgMTRIMjJWMjJIMjRWMTRaTTIyIDEySDIwVjE0SDIyVjEyWk0yMCAxMEgxOFYxMkgyMFYxMFpNMTggOEgxNlYxMEgxOFY4WiIgZmlsbD0iYmxhY2siLz48L3N2Zz4='), auto;
            }
        `}</style>

            {/* ================= NAV ================= */}
            <LandingNavbar scrolled={scrolled} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            {/* ================= HERO SECTION (SPLIT WORLD) ================= */}
            {/* Section owns the gradient — no panel divs have any background */}
            <section className="relative min-h-[100vh] w-full overflow-hidden flex flex-col lg:block"
                style={{ background: 'linear-gradient(to right, #0d281e 0%, #0d281e 38%, #0b4a62 52%, #0b82b2 65%, #1a9fc8 76%, #38bdf8 88%, #38bdf8 100%)' }}>

                {/* === FULL-WIDTH GAME LAYER (behind everything) === */}
                <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none">
                    {/* Subtle vertical sky depth on right half */}
                    <div className="absolute inset-y-0 right-0 w-1/2" />
                    <div className="absolute inset-0 scanlines opacity-20 mix-blend-overlay" />

                    {/* Clouds */}
                    <img src="/cloud_0.png" className="absolute top-[20%] right-[42%] w-36 opacity-85 animate-float-pixel" style={{ imageRendering: 'pixelated' }} alt="" />
                    <img src="/cloud_1.png" className="absolute top-[18%] right-[8%] w-36 opacity-65 animate-float-pixel" style={{ imageRendering: 'pixelated', animationDelay: '1.5s' }} alt="" />
                    <img src="/cloud_2.png" className="absolute top-[6%] right-[26%] w-32 opacity-70 animate-float-pixel" style={{ imageRendering: 'pixelated', animationDelay: '0.8s' }} alt="" />

                    {/* Ground — FULL WIDTH */}
                    <div className="absolute left-0 right-0 h-20" style={{ bottom: '10px', backgroundImage: "url('/ground.png')", backgroundRepeat: 'repeat-x', backgroundSize: 'auto 100%', imageRendering: 'pixelated' }} />
                    {/* Wave cutoff — organic transition, no gradient */}
                    <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }}>
                        <svg viewBox="0 0 1440 72" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '72px' }}>
                            <path d="M0,52 C160,22 320,64 560,42 C740,24 920,60 1120,36 C1280,18 1400,48 1440,40 L1440,72 L0,72 Z" fill="#0a1f18"/>
                        </svg>
                    </div>

                    {/* Platform 1 — right side */}
                    <img src="/platform.png" className="absolute bottom-32 right-[38%] w-32" style={{ imageRendering: 'pixelated' }} alt="" />
                    <img src="/coin.png" alt="" className="absolute bottom-[calc(8rem+5rem)] right-[42%] w-6 h-6 animate-coin-spin z-10" style={{ imageRendering: 'pixelated' }} />

                    {/* Platform 2 — far right */}
                    <img src="/platform.png" className="absolute bottom-44 right-[8%] w-28" style={{ imageRendering: 'pixelated' }} alt="" />
                    <img src="/coin.png" alt="" className="absolute bottom-[calc(11rem+5rem)] right-[12%] w-6 h-6 animate-coin-spin z-10" style={{ imageRendering: 'pixelated', animationDelay: '0.5s' }} />

                    {/* Platform 3 + flag */}
                    <div className="absolute bottom-[30%] right-[22%]">
                        <img src="/flag.png" alt="" className="absolute -top-[-5%] left-2 w-14 h-14 z-10" style={{ imageRendering: 'pixelated' }} />
                        <img src="/platform.png" className="w-24" style={{ imageRendering: 'pixelated' }} alt="" />
                    </div>
                </div>

                {/* === CHALK FORMULAS — full section width, no compositing boundary === */}
                <div className="hidden lg:block absolute inset-0 pointer-events-none select-none font-serif-display text-white z-10">
                    <span className="absolute top-[8%] left-[5%] text-3xl opacity-[0.08] animate-chalk-drift" style={{ '--rot': '12deg', '--dur': '7s' } as React.CSSProperties}>∫ x² dx</span>
                    <span className="absolute top-[15%] left-[46%] text-4xl opacity-[0.1] animate-chalk-drift" style={{ '--rot': '-6deg', '--dur': '8s' } as React.CSSProperties}>E = mc²</span>
                    <span className="absolute top-[35%] left-[3%] text-2xl opacity-[0.07] animate-chalk-drift" style={{ '--rot': '5deg', '--dur': '9s', animationDelay: '1s' } as React.CSSProperties}>C₆H₁₂O₆</span>
                    <span className="absolute top-[55%] left-[47%] text-3xl opacity-[0.09] animate-chalk-drift" style={{ '--rot': '-8deg', '--dur': '6s', animationDelay: '2s' } as React.CSSProperties}>Σ n²</span>
                    <span className="absolute top-[72%] left-[8%] text-2xl opacity-[0.07] animate-chalk-drift" style={{ '--rot': '3deg', '--dur': '10s', animationDelay: '0.5s' } as React.CSSProperties}>∇ × B = μ₀J</span>
                    <span className="absolute top-[25%] left-[28%] text-xl opacity-[0.06] animate-chalk-drift" style={{ '--rot': '-4deg', '--dur': '7.5s', animationDelay: '3s' } as React.CSSProperties}>π r²</span>
                    <span className="absolute top-[85%] left-[44%] text-3xl opacity-[0.09] animate-chalk-drift" style={{ '--rot': '7deg', '--dur': '8.5s', animationDelay: '1.5s' } as React.CSSProperties}>F = ma</span>
                    <span className="absolute top-[45%] left-[30%] text-2xl opacity-[0.06] animate-chalk-drift" style={{ '--rot': '-10deg', '--dur': '9.5s', animationDelay: '4s' } as React.CSSProperties}>ΔG = ΔH − TΔS</span>
                    <span className="absolute top-[65%] left-[20%] text-xl opacity-[0.05] animate-chalk-drift" style={{ '--rot': '2deg', '--dur': '6.5s', animationDelay: '2.5s' } as React.CSSProperties}>λ = h/p</span>
                    <span className="absolute top-[5%] left-[22%] text-2xl opacity-[0.07] animate-chalk-drift" style={{ '--rot': '-3deg', '--dur': '11s', animationDelay: '3.5s' } as React.CSSProperties}>∂²ψ/∂x²</span>
                    <span className="absolute top-[90%] left-[10%] text-xl opacity-[0.05] animate-chalk-drift" style={{ '--rot': '9deg', '--dur': '7s', animationDelay: '5s' } as React.CSSProperties}>a² + b² = c²</span>
                    <span className="absolute top-[48%] left-[30%] text-lg opacity-[0.06] animate-chalk-drift" style={{ '--rot': '4deg', '--dur': '8s', animationDelay: '1s' } as React.CSSProperties}>dx/dt = αx</span>
                    <span className="absolute top-[78%] left-[35%] text-lg opacity-[0.07] animate-chalk-drift" style={{ '--rot': '-5deg', '--dur': '9s', animationDelay: '3s' } as React.CSSProperties}>∮ E · dA = Q/ε₀</span>
                    <div className="absolute top-[20%] left-[15%] w-1 h-1 rounded-full bg-white/20 animate-particle-up" style={{ '--particle-dur': '4s' } as React.CSSProperties} />
                    <div className="absolute top-[50%] left-[35%] w-1.5 h-1.5 rounded-full bg-white/15 animate-particle-up" style={{ '--particle-dur': '5s', animationDelay: '1s' } as React.CSSProperties} />
                    <div className="absolute top-[70%] left-[8%] w-1 h-1 rounded-full bg-white/20 animate-particle-up" style={{ '--particle-dur': '3.5s', animationDelay: '2s' } as React.CSSProperties} />
                </div>

                {/* === LEFT CONTENT (academic) — absolutely positioned on desktop === */}
                <div className="relative lg:absolute lg:inset-y-0 lg:left-0 lg:w-1/2 flex flex-col justify-center px-8 lg:px-20 py-24 lg:py-0 z-20">
                    <div className="max-w-xl">
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

                            {user ? (
                                <Link href="/dashboard">
                                    <button className="group flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-[#0d281e] font-bold rounded-lg transition-all shadow-[0_4px_0px_#94a3b8] hover:translate-y-[2px] hover:shadow-[0_2px_0px_#94a3b8] active:translate-y-[4px] active:shadow-none font-sans-clean">
                                        Go to Dashboard
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                            ) : (
                                <Link href="/auth/login">
                                    <button className="group flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-[#0d281e] font-bold rounded-lg transition-all shadow-[0_4px_0px_#94a3b8] hover:translate-y-[2px] hover:shadow-[0_2px_0px_#94a3b8] active:translate-y-[4px] active:shadow-none font-sans-clean">
                                        Start Building
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* === RIGHT CONTENT (game) — absolutely positioned on desktop, handles particle cursor === */}
                <div className="relative lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 flex items-center justify-center min-h-[50vh] lg:min-h-0 z-20"
                    style={{ cursor: "url('/custom_cursor_32.png') 0 0, auto" }}
                    onMouseMove={handleGameMouseMove} onMouseEnter={handleGameMouseEnter} onMouseLeave={handleGameMouseLeave}>
                    {/* Cursor particle trail */}
                    {particles.map(pt => (
                        <div
                            key={pt.id}
                            className="absolute pointer-events-none z-50"
                            style={{
                                left: pt.x - pt.size / 2,
                                top: pt.y - pt.size / 2,
                                width: pt.size,
                                height: pt.size,
                                backgroundColor: pt.color,
                                borderRadius: pt.id % 3 === 0 ? '0' : '50%',
                                boxShadow: `0 0 ${pt.size * 3}px ${pt.color}, 0 0 ${pt.size * 5}px ${pt.color}66`,
                                animation: `particleFade 700ms ease-out forwards`,
                                animationDelay: '0ms',
                                transform: `translateX(${(pt.id % 2 === 0 ? 1 : -1) * 4}px)`,
                            } as React.CSSProperties}
                        />
                    ))}

                    {/* PLAY Text */}
                    <div className="relative -top-[3%] z-20 transform -rotate-2">
                        <h2 className="text-[5rem] md:text-[8rem] lg:text-[9rem] text-[#FFD700] leading-none select-none font-pixel tracking-tighter"
                            style={{
                                textShadow: '6px 6px 0px #b45309, 10px 10px 0px rgba(0,0,0,0.3)',
                                animation: 'float-pixel 3s ease-in-out infinite'
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
            <section ref={varRef} className="py-14 bg-[#0a1f18] relative flex items-center overflow-hidden">

                {/* Left: title — fixed width, sits on top of the fade */}
                <div className={`shrink-0 w-72 pl-12 z-20 relative transition-all duration-700 ${varInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                    <h2 className="text-3xl font-bold font-serif-display text-white leading-tight whitespace-nowrap">Choose your<br />adventure</h2>
                    <p className="text-slate-400 mt-3 text-sm font-sans-clean leading-snug max-w-[180px]">The curriculum adapts to the genre.</p>
                </div>

                {/* Right: auto-scrolling cards */}
                <div className="flex-1 overflow-hidden relative">
                    {/* Left fade — bleeds cards into the title column */}
                    <div className="absolute left-0 top-0 h-full w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #0a1f18 30%, transparent)' }} />
                    <div className="flex gap-6 w-max animate-marquee hover:[animation-play-state:paused] py-4">
                        {[...GAME_MODES, ...GAME_MODES, ...GAME_MODES].map((game, i) => (
                            <div key={i} className={`
                                group relative w-72 h-44 rounded-xl border ${game.border} ${game.bg}
                                backdrop-blur-sm p-5 flex flex-col justify-between hover:scale-105 hover:bg-opacity-50 transition-all cursor-pointer shadow-lg shrink-0
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
                </div>
            </section>

            {/* ================= WHY NEXUS SECTION ================= */}
            <section ref={whyRef} className="py-16 bg-[#0a1f18] relative overflow-hidden">
                {/* Ambient background glows */}
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/4 blur-[120px] rounded-full pointer-events-none animate-float-gentle" />
                <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-sky-500/4 blur-[100px] rounded-full pointer-events-none animate-float-gentle" style={{ animationDelay: '2s' }} />

                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    {/* Header */}
                    <div className={`text-center mb-10 transition-all duration-700 ${whyInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4 font-pixel">The Problem & The Fix</p>
                        <h2 className="text-5xl lg:text-6xl font-bold font-serif-display text-white leading-tight">
                            Why <span className="text-emerald-400 italic">Nexus?</span>
                        </h2>
                    </div>

                    {/* 3 Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

                        {/* ── Card 1: Addictive by design ── */}
                        <div
                            className="relative bg-[#0d281e] border border-emerald-500/10 rounded-2xl p-6 overflow-hidden group cursor-pointer"
                            style={{
                                transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1), border-color 0.3s, box-shadow 0.3s',
                                transitionDelay: whyInView ? '100ms' : '0ms',
                                opacity: whyInView ? 1 : 0,
                                transform: whyInView ? 'translateY(0)' : 'translateY(40px)',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 24px 60px rgba(52,211,153,0.12)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(52,211,153,0.3)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.borderColor = ''; }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                            {/* Animated EEG wave */}
                            <div className="mb-5 relative h-14 overflow-hidden rounded-lg bg-black/20">
                                <svg viewBox="0 0 260 56" className="w-full h-full" preserveAspectRatio="none">
                                    <path
                                        d="M0,28 L18,28 L26,6 L34,50 L42,18 L50,38 L58,28 L78,28 L86,10 L94,46 L102,20 L110,36 L118,28 L138,28 L146,8 L154,48 L162,16 L170,40 L178,28 L200,28 L208,12 L216,44 L224,22 L232,34 L240,28 L260,28"
                                        fill="none" stroke="#34d399" strokeWidth="2"
                                        style={{ strokeDasharray: 600, strokeDashoffset: whyInView ? 0 : 600, transition: 'stroke-dashoffset 2.2s ease-out 0.4s' }}
                                    />
                                    <path d="M0,28 L18,28 L26,6 L34,50 L42,18 L50,38 L58,28 L78,28 L86,10 L94,46 L102,20 L110,36 L118,28 L138,28 L146,8 L154,48 L162,16 L170,40 L178,28 L200,28 L208,12 L216,44 L224,22 L232,34 L240,28 L260,28"
                                        fill="none" stroke="#34d399" strokeWidth="1" opacity="0.15" />
                                </svg>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#0d281e] via-transparent to-[#0d281e] pointer-events-none" />
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-full text-emerald-400 text-[9px] font-bold uppercase tracking-wider font-pixel mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                ENGAGEMENT +340%
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 font-sans-clean">It hooks them in</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Game mechanics trigger the same dopamine loops as the best mobile games. Except the reward is knowledge.</p>
                        </div>

                        {/* ── Card 2: Attention spans (center, taller) ── */}
                        <div
                            className="relative bg-[#0d281e] border border-red-500/10 rounded-2xl p-6 overflow-hidden group cursor-pointer md:-mt-6 md:mb-6"
                            style={{
                                transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1), border-color 0.3s, box-shadow 0.3s',
                                transitionDelay: whyInView ? '220ms' : '0ms',
                                opacity: whyInView ? 1 : 0,
                                transform: whyInView ? 'translateY(0)' : 'translateY(40px)',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 24px 60px rgba(239,68,68,0.12)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(239,68,68,0.35)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.borderColor = ''; }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
                            {/* Declining chart */}
                            <div className="mb-5 relative h-20 rounded-lg bg-black/20 overflow-hidden">
                                <svg viewBox="0 0 260 80" className="w-full h-full" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="redFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f87171" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    {[20, 40, 60].map(y => <line key={y} x1="0" y1={y} x2="260" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />)}
                                    <path d="M0,8 C40,10 80,20 120,36 C160,52 200,62 260,72"
                                        fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"
                                        style={{ strokeDasharray: 700, strokeDashoffset: whyInView ? 0 : 700, transition: 'stroke-dashoffset 2.4s ease-out 0.6s' }} />
                                    <path d="M0,8 C40,10 80,20 120,36 C160,52 200,62 260,72 L260,80 L0,80 Z"
                                        fill="url(#redFill)" style={{ opacity: whyInView ? 1 : 0, transition: 'opacity 1s ease-out 1.5s' }} />
                                </svg>
                                <div className="absolute top-1 right-2 flex items-center gap-1 text-red-400 text-[9px] font-pixel">
                                    <TrendingDown size={10} />−78% since 2000
                                </div>
                            </div>
                            <div className="flex items-end gap-3 mb-3">
                                <span className="text-4xl font-bold font-pixel text-red-400">47s</span>
                                <span className="text-slate-600 text-sm mb-1 line-through font-sans-clean">8 min</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 font-sans-clean">Average student attention span</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Shrinking every year. Traditional instruction can't keep up. Nexus resets the clock with every new mechanic introduced.</p>
                        </div>

                        {/* ── Card 3: Slides put them to sleep ── */}
                        <div
                            className="relative bg-[#0d281e] border border-white/5 rounded-2xl p-6 overflow-hidden group cursor-pointer"
                            style={{
                                transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1), border-color 0.3s, box-shadow 0.3s',
                                transitionDelay: whyInView ? '340ms' : '0ms',
                                opacity: whyInView ? 1 : 0,
                                transform: whyInView ? 'translateY(0)' : 'translateY(40px)',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 24px 60px rgba(100,116,139,0.1)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(100,116,139,0.3)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.borderColor = ''; }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent pointer-events-none" />
                            {/* Sleeping monitor + ZZZ */}
                            <div className="mb-5 relative h-14 flex items-center justify-center rounded-lg bg-black/20">
                                <div className="relative">
                                    <div className="w-16 h-10 bg-slate-800/80 border-2 border-slate-600 rounded-md flex items-center justify-center text-xl relative">
                                        😴
                                        <span className="absolute -top-5 left-9 text-slate-300 font-bold text-lg animate-zzz1 font-sans-clean select-none">Z</span>
                                        <span className="absolute -top-7 left-11 text-slate-500 font-bold text-base animate-zzz2 font-sans-clean select-none">z</span>
                                        <span className="absolute -top-9 left-13 text-slate-600 font-bold text-sm animate-zzz3 font-sans-clean select-none">z</span>
                                    </div>
                                    <div className="w-5 h-1.5 bg-slate-700 mx-auto rounded-b" />
                                    <div className="w-9 h-0.5 bg-slate-700 mx-auto rounded" />
                                </div>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-500/10 rounded-full text-slate-500 text-[9px] font-bold uppercase tracking-wider font-pixel mb-3">
                                RETENTION: 5%
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 font-sans-clean">Slides put them to sleep</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Passive learning retains 5% of information. Active game-based learning retains up to 75%. The math is simple.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= CTA SECTION ================= */}
            <section ref={ctaRef} className="relative py-20 bg-[#0a1f18] overflow-hidden">
                {/* Animated grid */}
                <div
                    className="absolute inset-0 pointer-events-none animate-grid-pulse"
                    style={{ backgroundImage: 'linear-gradient(rgba(52,211,153,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.04) 1px, transparent 1px)', backgroundSize: '64px 64px' }}
                />
                {/* Radial centre glow */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(52,211,153,0.09), transparent)' }} />

                {/* Floating coins */}
                <img src="/coin.png" alt="" className="absolute top-[18%] left-[8%] w-8 opacity-25 animate-float-gentle" style={{ imageRendering: 'pixelated' }} />
                <img src="/coin.png" alt="" className="absolute top-[65%] left-[4%] w-6 opacity-15 animate-float-gentle" style={{ imageRendering: 'pixelated', animationDelay: '1.6s' }} />
                <img src="/coin.png" alt="" className="absolute top-[25%] right-[7%] w-9 opacity-20 animate-float-gentle" style={{ imageRendering: 'pixelated', animationDelay: '0.9s' }} />
                <img src="/coin.png" alt="" className="absolute top-[70%] right-[10%] w-6 opacity-15 animate-float-gentle" style={{ imageRendering: 'pixelated', animationDelay: '2.2s' }} />
                <img src="/coin.png" alt="" className="absolute top-[45%] left-[18%] w-5 opacity-10 animate-float-gentle" style={{ imageRendering: 'pixelated', animationDelay: '3s' }} />
                <img src="/coin.png" alt="" className="absolute top-[40%] right-[20%] w-5 opacity-10 animate-float-gentle" style={{ imageRendering: 'pixelated', animationDelay: '1.2s' }} />

                <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
                    <p
                        className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-6 font-pixel"
                        style={{ opacity: ctaInView ? 1 : 0, transform: ctaInView ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease 0ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0ms' }}
                    >
                        Start Today
                    </p>
                    <h2
                        className="text-5xl lg:text-7xl font-serif-display text-white leading-tight mb-6"
                        style={{ opacity: ctaInView ? 1 : 0, transform: ctaInView ? 'translateY(0)' : 'translateY(28px)', transition: 'opacity 0.7s ease 150ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) 150ms' }}
                    >
                        Immerse yourself in the<br />
                        <span className="animate-shimmer">joy of learning.</span>
                    </h2>
                    <p
                        className="text-slate-400 text-lg mb-12 max-w-xl mx-auto font-sans-clean"
                        style={{ opacity: ctaInView ? 1 : 0, transform: ctaInView ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.7s ease 280ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) 280ms' }}
                    >
                        Become an educator transforming your classrooms with game-powered learning.
                    </p>
                    <div
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        style={{ opacity: ctaInView ? 1 : 0, transform: ctaInView ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease 400ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) 400ms' }}
                    >
                        {user ? (
                            <Link href="/dashboard">
                                <button className="group relative px-12 py-5 bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] font-bold text-lg rounded-xl transition-colors font-sans-clean animate-glow-cta shadow-[0_4px_0_#065f46] hover:translate-y-[2px] hover:shadow-[0_2px_0_#065f46] active:translate-y-[4px] active:shadow-none">
                                    Go to Dashboard
                                    <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                                </button>
                            </Link>
                        ) : (
                            <Link href="/auth/login">
                                <button className="group relative px-12 py-5 bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] font-bold text-lg rounded-xl transition-colors font-sans-clean animate-glow-cta shadow-[0_4px_0_#065f46] hover:translate-y-[2px] hover:shadow-[0_2px_0_#065f46] active:translate-y-[4px] active:shadow-none">
                                    Get Started
                                    <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
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