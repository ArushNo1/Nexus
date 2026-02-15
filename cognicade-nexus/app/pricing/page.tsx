'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import LandingNavbar from '@/components/ui/landing-navbar';
import {
    CheckCircle2,
    XCircle,
    ArrowRight,
    Sparkles,
    Building2,
    GraduationCap,
    Zap,
} from 'lucide-react';

const PLANS = [
    {
        id: 'free',
        icon: GraduationCap,
        badge: null,
        name: 'Starter',
        price: '$0',
        period: 'forever',
        tagline: 'Perfect for trying Nexus with one class.',
        color: 'slate',
        accent: 'text-slate-300',
        border: 'border-white/8',
        activeBorder: 'border-white/10',
        glow: '',
        buttonClass: 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20',
        buttonLabel: 'Get Started Free',
        href: '/auth/sign-up',
        features: [
            { label: 'Up to 3 lessons', included: true },
            { label: '1 class / 30 students', included: true },
            { label: 'All game modes', included: true },
            { label: 'Basic analytics', included: true },
            { label: 'Advanced analytics', included: false },
            { label: 'Priority support', included: false },
            { label: 'Custom branding', included: false },
            { label: 'API access', included: false },
        ],
    },
    {
        id: 'pro',
        icon: Zap,
        badge: 'Most Popular',
        name: 'Pro',
        price: '$12',
        period: 'per month',
        tagline: 'For educators who want unlimited power.',
        color: 'emerald',
        accent: 'text-emerald-400',
        border: 'border-emerald-500/40',
        activeBorder: 'border-emerald-500/60',
        glow: 'shadow-[0_0_60px_rgba(52,211,153,0.12)]',
        buttonClass: 'bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] shadow-[0_4px_0_#065f46] hover:translate-y-[2px] hover:shadow-[0_2px_0_#065f46] active:translate-y-[4px] active:shadow-none animate-glow-cta',
        buttonLabel: 'Start Pro Trial',
        href: '/auth/sign-up',
        features: [
            { label: 'Unlimited lessons', included: true },
            { label: 'Up to 5 classes / 150 students', included: true },
            { label: 'All game modes', included: true },
            { label: 'Advanced analytics & heatmaps', included: true },
            { label: 'Standards alignment tags', included: true },
            { label: 'Priority email support', included: true },
            { label: 'Custom branding', included: false },
            { label: 'API access', included: false },
        ],
    },
    {
        id: 'school',
        icon: Building2,
        badge: null,
        name: 'School',
        price: 'Custom',
        period: 'contact us',
        tagline: 'For districts and entire institutions.',
        color: 'blue',
        accent: 'text-blue-400',
        border: 'border-blue-500/20',
        activeBorder: 'border-blue-500/30',
        glow: '',
        buttonClass: 'bg-white/5 hover:bg-white/10 text-blue-300 border border-blue-500/20 hover:border-blue-500/40',
        buttonLabel: 'Contact Sales',
        href: 'mailto:hello@nexus.edu',
        features: [
            { label: 'Unlimited lessons', included: true },
            { label: 'Unlimited classes & students', included: true },
            { label: 'All game modes', included: true },
            { label: 'Advanced analytics & heatmaps', included: true },
            { label: 'Standards alignment tags', included: true },
            { label: 'Dedicated account manager', included: true },
            { label: 'Custom branding & SSO', included: true },
            { label: 'Full API access', included: true },
        ],
    },
];

const FAQS = [
    {
        q: 'Can I switch plans later?',
        a: 'Yes — upgrade or downgrade anytime. Changes take effect at the start of your next billing cycle.',
    },
    {
        q: 'Is there a free trial for Pro?',
        a: 'Pro comes with a 14-day free trial. No credit card required to start.',
    },
    {
        q: 'What happens to my lessons if I downgrade?',
        a: 'Your lessons are preserved. On Starter you can view them all, but creating new ones is limited to 3.',
    },
    {
        q: 'Do students need accounts?',
        a: 'No. Students join with a class code — no sign-up, no email required.',
    },
    {
        q: 'Is Nexus FERPA/COPPA compliant?',
        a: 'Yes. We do not collect personally identifiable information from students under 13.',
    },
    {
        q: 'Can I cancel anytime?',
        a: 'Absolutely. Cancel from your dashboard — no cancellation fees, ever.',
    },
];

export default function PricingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [annual, setAnnual] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const [heroInView, setHeroInView] = useState(false);
    const [plansInView, setPlansInView] = useState(false);
    const [faqInView, setFaqInView] = useState(false);
    const [ctaInView, setCtaInView] = useState(false);

    const heroRef = useRef<HTMLElement>(null);
    const plansRef = useRef<HTMLElement>(null);
    const faqRef = useRef<HTMLElement>(null);
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
        const o2 = make(setPlansInView);
        const o3 = make(setFaqInView);
        const o4 = make(setCtaInView);
        if (heroRef.current) o1.observe(heroRef.current);
        if (plansRef.current) o2.observe(plansRef.current);
        if (faqRef.current) o3.observe(faqRef.current);
        if (ctaRef.current) o4.observe(ctaRef.current);
        return () => { o1.disconnect(); o2.disconnect(); o3.disconnect(); o4.disconnect(); };
    }, []);

    const getPrice = (plan: typeof PLANS[number]) => {
        if (plan.price === '$0' || plan.price === 'Custom') return plan.price;
        const base = parseInt(plan.price.replace('$', ''));
        if (annual) return `$${Math.round(base * 0.8)}`;
        return plan.price;
    };

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
                    0%, 100% { transform: translateY(0px); }
                    50%       { transform: translateY(-8px); }
                }
                .animate-float-gentle { animation: float-gentle 3.5s ease-in-out infinite; }

                @keyframes grid-pulse {
                    0%, 100% { opacity: 0.4; }
                    50%       { opacity: 0.9; }
                }
                .animate-grid-pulse { animation: grid-pulse 5s ease-in-out infinite; }

                @keyframes faq-open {
                    0%   { opacity: 0; transform: translateY(-6px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-faq-open { animation: faq-open 0.25s ease-out forwards; }
            `}</style>

            <LandingNavbar scrolled={scrolled} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            <main id="main-content">
            {/* ── HERO ── */}
            <section ref={heroRef} className="relative pt-40 pb-16 overflow-hidden">
                <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/6 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/4 blur-[100px] rounded-full pointer-events-none" />

                {/* Floating coins */}
                <img src="/coin.png" alt="" className="absolute top-36 left-[7%] w-8 h-8 opacity-25 animate-float-gentle" style={{ imageRendering: 'pixelated' }} />
                <img src="/coin.png" alt="" className="absolute top-52 right-[10%] w-6 h-6 opacity-20 animate-float-gentle" style={{ imageRendering: 'pixelated', animationDelay: '1s' }} />
                <img src="/coin.png" alt="" className="absolute bottom-12 left-[22%] w-5 h-5 opacity-15 animate-float-gentle" style={{ imageRendering: 'pixelated', animationDelay: '0.6s' }} />

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <div
                        className="opacity-0"
                        style={heroInView ? { animation: 'reveal-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s forwards' } : {}}
                    >
                        <span className="inline-block px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-pixel text-emerald-400 tracking-widest uppercase mb-6">
                            Simple Pricing
                        </span>
                    </div>

                    <h1
                        className="text-5xl lg:text-7xl font-serif-display text-white leading-tight mb-5 opacity-0"
                        style={heroInView ? { animation: 'reveal-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s forwards' } : {}}
                    >
                        Pay for <span className="animate-shimmer">Learning</span>,
                        <br />Not for Seats
                    </h1>

                    <p
                        className="text-slate-400 text-lg font-sans-clean leading-relaxed max-w-xl mx-auto mb-10 opacity-0"
                        style={heroInView ? { animation: 'reveal-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s forwards' } : {}}
                    >
                        Straightforward plans built for educators. Start free — upgrade when you're ready.
                    </p>

                    {/* Annual toggle */}
                    <div
                        className="flex items-center justify-center gap-3 opacity-0"
                        style={heroInView ? { animation: 'reveal-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.45s forwards' } : {}}
                    >
                        <span className={`text-sm font-sans-clean transition-colors ${!annual ? 'text-white font-semibold' : 'text-slate-500'}`}>Monthly</span>
                        <button
                            role="switch"
                            aria-checked={annual}
                            aria-label="Toggle annual billing"
                            onClick={() => setAnnual(!annual)}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${annual ? 'bg-emerald-500' : 'bg-white/10'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${annual ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                        <span className={`text-sm font-sans-clean transition-colors ${annual ? 'text-white font-semibold' : 'text-slate-500'}`}>
                            Annual
                            <span className="ml-2 px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-500/20 rounded text-emerald-400 text-[10px] font-pixel">
                                −20%
                            </span>
                        </span>
                    </div>
                </div>
            </section>

            {/* ── PRICING CARDS ── */}
            <section ref={plansRef} className="py-12 pb-24 relative">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        {PLANS.map((plan, i) => {
                            const Icon = plan.icon;
                            const isPro = plan.id === 'pro';
                            return (
                                <div
                                    key={plan.id}
                                    className={`relative bg-[#0d281e] border ${isPro ? plan.activeBorder : plan.border} rounded-2xl overflow-hidden transition-all duration-300 opacity-0 ${plan.glow} ${isPro ? 'md:-mt-4 md:mb-4' : ''} hover:-translate-y-1`}
                                    style={plansInView ? { animation: `reveal-up 0.7s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.15}s forwards` } : {}}
                                >
                                    {/* Popular badge */}
                                    {plan.badge && (
                                        <div className="absolute top-0 inset-x-0 flex justify-center">
                                            <span className="bg-emerald-500 text-[#0d281e] text-[9px] font-pixel px-4 py-1 rounded-b-lg tracking-wider">
                                                {plan.badge}
                                            </span>
                                        </div>
                                    )}

                                    {/* Card glow overlay */}
                                    {isPro && <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />}

                                    <div className={`relative z-10 p-7 ${plan.badge ? 'pt-9' : ''}`}>
                                        {/* Plan label + icon */}
                                        <div className="flex items-center gap-2 mb-5">
                                            <div className={`p-2 rounded-lg bg-white/5 border ${plan.border}`}>
                                                <Icon size={16} className={plan.accent} />
                                            </div>
                                            <span className={`text-[9px] font-pixel ${plan.accent} tracking-[0.2em] uppercase`}>
                                                {plan.name}
                                            </span>
                                        </div>

                                        {/* Price */}
                                        <div className="mb-1">
                                            <span className="text-4xl font-bold text-white font-sans-clean">{getPrice(plan)}</span>
                                            {plan.price !== 'Custom' && (
                                                <span className="text-slate-500 text-sm font-sans-clean ml-2">/{annual && plan.price !== '$0' ? 'mo, billed annually' : plan.period}</span>
                                            )}
                                            {plan.price === 'Custom' && (
                                                <span className="text-slate-500 text-sm font-sans-clean ml-2">— {plan.period}</span>
                                            )}
                                        </div>
                                        <p className="text-slate-500 text-sm font-sans-clean mb-6">{plan.tagline}</p>

                                        {/* CTA button */}
                                        <Link href={plan.href}>
                                            <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all font-sans-clean flex items-center justify-center gap-2 ${plan.buttonClass}`}>
                                                {plan.buttonLabel}
                                                <ArrowRight size={14} />
                                            </button>
                                        </Link>

                                        {/* Divider */}
                                        <div className="my-6 h-px bg-white/5" />

                                        {/* Features list */}
                                        <ul className="space-y-3">
                                            {plan.features.map(f => (
                                                <li key={f.label} className="flex items-center gap-3 text-sm font-sans-clean">
                                                    {f.included ? (
                                                        <CheckCircle2 size={15} className={isPro ? 'text-emerald-400' : 'text-slate-400'} />
                                                    ) : (
                                                        <XCircle size={15} className="text-slate-600" />
                                                    )}
                                                    <span className={f.included ? 'text-slate-200' : 'text-slate-600 line-through decoration-slate-700'}>
                                                        {f.label}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footnote */}
                    <p className="text-center text-slate-600 text-xs font-sans-clean mt-8">
                        All plans include SSL, automatic updates, and 99.9% uptime SLA. Prices in USD.
                    </p>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section ref={faqRef} className="py-20 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

                <div className="max-w-3xl mx-auto px-6">
                    <div
                        className="text-center mb-14 opacity-0"
                        style={faqInView ? { animation: 'reveal-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s forwards' } : {}}
                    >
                        <span className="text-[10px] font-pixel text-emerald-400 tracking-[0.3em] uppercase">FAQ</span>
                        <h2 className="text-4xl lg:text-5xl font-serif-display text-white mt-3">Common Questions</h2>
                    </div>

                    <div className="space-y-3">
                        {FAQS.map((faq, i) => (
                            <div
                                key={i}
                                className="bg-[#0d281e] border border-white/5 rounded-xl overflow-hidden hover:border-emerald-500/20 transition-colors opacity-0"
                                style={faqInView ? { animation: `reveal-up 0.6s cubic-bezier(0.16,1,0.3,1) ${0.15 + i * 0.07}s forwards` } : {}}
                            >
                                <button
                                    aria-expanded={openFaq === i}
                                    className="w-full px-6 py-5 text-left flex justify-between items-center gap-4"
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                >
                                    <span className="text-sm font-semibold text-slate-200 font-sans-clean">{faq.q}</span>
                                    <span className={`text-emerald-400 text-lg transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                                </button>
                                {openFaq === i && (
                                    <div className="px-6 pb-5 animate-faq-open">
                                        <p className="text-sm text-slate-400 font-sans-clean leading-relaxed">{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section ref={ctaRef} className="py-24 relative overflow-hidden">
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
                            Start Free Today
                        </h2>
                        <p className="text-slate-400 text-lg font-sans-clean mb-8">
                            No credit card. No hidden fees. Just better student engagement — from day one.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link href="/auth/sign-up">
                                <button className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] font-bold text-lg rounded-xl transition-all animate-glow-cta shadow-[0_4px_0_#065f46] hover:translate-y-[2px] hover:shadow-[0_2px_0_#065f46] active:translate-y-[4px] active:shadow-none font-sans-clean">
                                    Create Free Account
                                </button>
                            </Link>
                            <Link href="/features">
                                <button className="px-10 py-4 bg-white hover:bg-slate-100 text-[#0d281e] font-bold text-lg rounded-xl transition-all shadow-[0_4px_0px_#94a3b8] hover:translate-y-[2px] hover:shadow-[0_2px_0px_#94a3b8] active:translate-y-[4px] active:shadow-none font-sans-clean">
                                    Explore Features
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
