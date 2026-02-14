'use client';

import React from 'react';
import {
    Beaker,
    Map,
    Gamepad2,
    Trophy,
    TrendingDown,
    MonitorOff,
    FileQuestion,
    Menu,
    X,
    Instagram,
    Youtube
} from 'lucide-react';

const STAR_POSITIONS = [
    { top: '5%', left: '12%', delay: '0.3s' },
    { top: '8%', left: '45%', delay: '1.1s' },
    { top: '12%', left: '78%', delay: '0.7s' },
    { top: '15%', left: '30%', delay: '1.8s' },
    { top: '20%', left: '60%', delay: '0.2s' },
    { top: '25%', left: '85%', delay: '1.4s' },
    { top: '28%', left: '20%', delay: '0.9s' },
    { top: '32%', left: '55%', delay: '1.6s' },
    { top: '35%', left: '90%', delay: '0.5s' },
    { top: '40%', left: '15%', delay: '1.2s' },
    { top: '45%', left: '70%', delay: '0.1s' },
    { top: '48%', left: '40%', delay: '1.9s' },
    { top: '52%', left: '25%', delay: '0.8s' },
    { top: '55%', left: '65%', delay: '1.3s' },
    { top: '10%', left: '92%', delay: '0.6s' },
    { top: '18%', left: '8%', delay: '1.7s' },
    { top: '38%', left: '50%', delay: '0.4s' },
    { top: '42%', left: '35%', delay: '1.0s' },
    { top: '22%', left: '75%', delay: '1.5s' },
    { top: '30%', left: '5%', delay: '0.0s' },
];

const GAME_PREVIEWS = [
    { mode: 'RPG MODE', color: 'text-green-400', placeholder: '[ Pixel Wizard ]', subject: 'History Quest' },
    { mode: 'BATTLE MODE', color: 'text-red-400', placeholder: '[ Fighter Arena ]', subject: 'Math Battles' },
    { mode: 'BUILDER MODE', color: 'text-blue-400', placeholder: '[ Level Editor ]', subject: 'Science Lab' },
    { mode: 'PUZZLE MODE', color: 'text-purple-400', placeholder: '[ Puzzle Board ]', subject: 'Logic Games' },
    { mode: 'RACE MODE', color: 'text-yellow-400', placeholder: '[ Track & Finish ]', subject: 'Speed Math' },
    { mode: 'STORY MODE', color: 'text-pink-400', placeholder: '[ Visual Novel ]', subject: 'Literature' },
];

const CROSSING_ELEMENTS = [
    { learnIcon: '\u2211', gameIcon: '\u2605', topPos: '30%', delay: '0s' },
    { learnIcon: '\u269B', gameIcon: '\u2666', topPos: '50%', delay: '2.67s' },
    { learnIcon: '\u03C0', gameIcon: '\u2694', topPos: '65%', delay: '5.33s' },
];

export default function NexusLanding() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen font-sans">

            {/* ================= NAV ================= */}
            <nav className="fixed top-0 w-full bg-[#1a2e1a]/90 backdrop-blur-md border-b chalk-line z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <span className="text-2xl font-black tracking-widest text-[#e8f5e9] font-pixel">
                                NEXUS
                            </span>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#" className="text-[#a5c8a5] hover:text-[#e8f5e9] font-chalk transition-colors">About</a>
                            <a href="#" className="text-[#a5c8a5] hover:text-[#e8f5e9] font-chalk transition-colors">Features</a>
                            <a href="#" className="text-[#a5c8a5] hover:text-[#e8f5e9] font-chalk transition-colors">Pricing</a>
                            <button className="chalk-box bg-transparent text-[#e8f5e9] px-4 py-2 font-chalk font-bold hover:bg-[#7ec87e]/20 transition-colors">
                                Sign in
                            </button>
                        </div>

                        <div className="md:hidden flex items-center">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#e8f5e9]">
                                {isMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {isMenuOpen && (
                        <div className="md:hidden pb-4 space-y-2">
                            <a href="#" className="block text-[#a5c8a5] hover:text-[#e8f5e9] font-chalk py-2">About</a>
                            <a href="#" className="block text-[#a5c8a5] hover:text-[#e8f5e9] font-chalk py-2">Features</a>
                            <a href="#" className="block text-[#a5c8a5] hover:text-[#e8f5e9] font-chalk py-2">Pricing</a>
                            <button className="chalk-box bg-transparent text-[#e8f5e9] px-4 py-2 font-chalk font-bold w-full text-left">
                                Sign in
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* ================= HERO SECTION ================= */}
            <section className="min-h-screen relative grid lg:grid-cols-2 overflow-hidden">

                {/* CHALKBOARD SIDE */}
                <div className="relative bg-[#1a2e1a] flex flex-col justify-center px-8 md:px-12 py-32 lg:py-24 overflow-hidden">
                    {/* Chalk grid texture */}
                    <div
                        className="absolute inset-0 opacity-[0.06]"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(0deg, #7ec87e 0px, transparent 1px, transparent 32px)',
                            backgroundSize: '100% 32px',
                        }}
                    />

                    {/* Floating learning decorations */}
                    <div className="absolute top-20 left-8 animate-float-slow opacity-30 font-chalk text-[#a5c8a5] text-sm select-none">
                        x = (-b &plusmn; &radic;&Delta;) / 2a
                    </div>
                    <div className="absolute top-36 right-16 animate-float-medium opacity-25">
                        <Beaker size={36} className="text-[#a5c8a5]" />
                    </div>
                    <div className="absolute bottom-32 left-12 animate-float-slow opacity-20" style={{ animationDelay: '1s' }}>
                        <Map size={32} className="text-[#a5c8a5]" />
                    </div>
                    <div className="absolute bottom-20 right-10 animate-float-medium opacity-15 font-chalk text-[#a5c8a5] text-xs select-none" style={{ animationDelay: '2s' }}>
                        Fe + O&#x2082; &rarr; Fe&#x2082;O&#x2083;
                    </div>
                    <div className="absolute top-48 left-1/3 animate-float-fast opacity-20 font-chalk text-[#a5c8a5] text-xs select-none" style={{ animationDelay: '0.5s' }}>
                        E = mc&sup2;
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold chalk-text font-chalk leading-tight relative z-10">
                        Make learning<br />
                        <span className="chalk-underline text-[#a5c8a5] italic">feel like...</span>
                    </h1>

                    {/* Chalk note */}
                    <div className="mt-6 max-w-xs chalk-box p-4 transform -rotate-1 relative z-10 bg-[#1f3522]/60">
                        <p className="font-chalk text-[#a5c8a5] text-sm">
                            &ldquo;What if every lesson was<br />a level to beat?&rdquo;
                        </p>
                    </div>

                    {/* Mobile divider */}
                    <div className="lg:hidden mt-12 border-t chalk-line" />
                </div>

                {/* JAGGED DIVIDER */}
                <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 z-20 -translate-x-1/2 w-16 pointer-events-none">
                    <svg viewBox="0 0 64 800" preserveAspectRatio="none" className="w-full h-full">
                        <path
                            d="M32,0 L20,50 L44,100 L16,150 L40,200 L18,250 L42,300 L14,350 L38,400 L20,450 L44,500 L16,550 L40,600 L18,650 L42,700 L22,750 L32,800"
                            fill="none"
                            stroke="rgba(232,245,233,0.2)"
                            strokeWidth="2"
                            strokeDasharray="6 4"
                        />
                    </svg>
                </div>

                {/* CROSSING ELEMENTS (positioned in parent section to span both halves) */}
                {CROSSING_ELEMENTS.map((el, i) => (
                    <div
                        key={i}
                        className="hidden lg:block absolute z-30 w-16 h-16"
                        style={{ top: el.topPos, left: 'calc(50% - 32px)' }}
                    >
                        {/* Learning icon — fades out at midpoint */}
                        <div
                            className="absolute inset-0 flex items-center justify-center font-chalk text-[#a5c8a5] text-2xl"
                            style={{ animation: `crossFromLeft 8s linear infinite`, animationDelay: el.delay }}
                        >
                            {el.learnIcon}
                        </div>
                        {/* Game icon — fades in at midpoint */}
                        <div
                            className="absolute inset-0 flex items-center justify-center text-[#fbbf24] text-2xl font-pixel"
                            style={{ animation: `crossToGame 8s linear infinite`, animationDelay: el.delay }}
                        >
                            {el.gameIcon}
                        </div>
                    </div>
                ))}

                {/* GAME SIDE */}
                <div className="relative bg-[#0d0d1a] flex flex-col items-center justify-center overflow-hidden min-h-[400px] lg:min-h-0">
                    {/* Pixel sky gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a3e] to-[#0d0d1a]" />

                    {/* Stars */}
                    {STAR_POSITIONS.map((star, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full animate-pixel-blink"
                            style={{ top: star.top, left: star.left, animationDelay: star.delay }}
                        />
                    ))}

                    {/* PLAY text */}
                    <h2 className="relative z-10 text-7xl md:text-8xl lg:text-9xl font-black font-pixel tracking-widest text-[#fbbf24] pixel-text-shadow select-none">
                        PLAY
                    </h2>

                    {/* Platforms */}
                    <div className="absolute bottom-32 left-8 w-28 h-4 bg-[#22c55e] border-b-4 border-green-800 pixel-shadow" />
                    <div className="absolute bottom-48 right-12 w-20 h-4 bg-[#22c55e] border-b-4 border-green-800 pixel-shadow" />
                    <div className="absolute bottom-64 left-20 w-16 h-4 bg-[#22c55e] border-b-4 border-green-800 pixel-shadow" />

                    {/* Coins */}
                    <div className="absolute bottom-36 left-14 animate-coin-bounce">
                        <div className="w-6 h-6 rounded-full bg-[#fbbf24] border-2 border-yellow-600 flex items-center justify-center text-xs font-black text-yellow-800">$</div>
                    </div>
                    <div className="absolute bottom-52 right-16 animate-coin-bounce" style={{ animationDelay: '0.2s' }}>
                        <div className="w-6 h-6 rounded-full bg-[#fbbf24] border-2 border-yellow-600 flex items-center justify-center text-xs font-black text-yellow-800">$</div>
                    </div>

                    {/* Pixel character */}
                    <div className="absolute bottom-36 left-1/2 -translate-x-1/2 flex flex-col items-center z-10" style={{ imageRendering: 'pixelated' as React.CSSProperties['imageRendering'] }}>
                        <div className="w-4 h-4 bg-red-500" />
                        <div className="w-6 h-6 bg-amber-300" />
                        <div className="w-6 h-4 bg-blue-500" />
                        <div className="flex gap-1">
                            <div className="w-2 h-4 bg-blue-700" />
                            <div className="w-2 h-4 bg-blue-700" />
                        </div>
                    </div>

                    {/* Score HUD */}
                    <div className="absolute top-4 right-4 font-pixel text-[#fbbf24] text-xs z-10">
                        <div>SCORE</div>
                        <div className="text-white">001200</div>
                        <div className="mt-1">&#10084;&#10084;&#10084;</div>
                    </div>
                </div>
            </section>

            {/* ================= VARIETY SECTION ================= */}
            <section className="py-24 bg-[#1a2e1a]">
                <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-5 gap-0 items-center">

                    {/* LEFT: text */}
                    <div className="lg:col-span-2 z-10 pr-8 mb-8 lg:mb-0">
                        <h2 className="text-4xl md:text-5xl font-bold chalk-text font-chalk mb-4">
                            No two<br />experiences are<br />the same.
                        </h2>
                        <p className="text-[#a5c8a5] font-chalk mt-4 text-lg">
                            Every student gets a unique adventure, tailored to how they learn best.
                        </p>
                    </div>

                    {/* RIGHT: scrolling feed */}
                    <div className="lg:col-span-3 overflow-hidden relative marquee-fade-left">
                        <div className="marquee-track">
                            {GAME_PREVIEWS.concat(GAME_PREVIEWS).map((preview, i) => (
                                <div
                                    key={i}
                                    className="min-w-[260px] h-44 mx-3 chalk-box bg-[#1f3522] rounded-xl p-4 flex flex-col justify-between shrink-0"
                                >
                                    <div className={`text-xs font-pixel ${preview.color} px-2 py-1 rounded w-fit bg-black/30`}>
                                        {preview.mode}
                                    </div>
                                    <div className="h-24 bg-[#1a2e1a]/80 rounded flex items-center justify-center font-pixel text-[#a5c8a5] text-xs">
                                        {preview.placeholder}
                                    </div>
                                    <div className="font-chalk text-[#a5c8a5] text-xs">{preview.subject}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= WHY NEXUS ================= */}
            <section className="py-24 bg-[#1f3522]">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center chalk-text font-chalk mb-16">
                        Why Nexus?
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* CARD 1: Complex Topics */}
                        <div className="flip-card-container h-72 cursor-pointer">
                            <div className="flip-card-inner">
                                <div className="flip-card-face chalk-box bg-[#1a2e1a] rounded-2xl p-8 flex flex-col gap-4">
                                    <FileQuestion className="text-[#a5c8a5]" size={40} />
                                    <h3 className="text-xl font-bold chalk-text font-chalk">Complex Topics</h3>
                                    <div className="space-y-2 mt-2">
                                        <div className="h-2 w-full bg-[#a5c8a5]/20 rounded" />
                                        <div className="h-2 w-3/4 bg-[#a5c8a5]/20 rounded" />
                                        <div className="h-2 w-5/6 bg-[#a5c8a5]/15 rounded" />
                                        <div className="h-2 w-2/3 bg-[#a5c8a5]/15 rounded" />
                                    </div>
                                </div>
                                <div className="flip-card-back bg-[#7ec87e]/10 chalk-box rounded-2xl p-8 flex flex-col justify-center gap-3">
                                    <div className="text-3xl">
                                        <Gamepad2 className="text-[#7ec87e]" size={36} />
                                    </div>
                                    <h3 className="text-xl font-bold text-[#7ec87e] font-chalk">
                                        We gamify the hard stuff.
                                    </h3>
                                    <p className="text-[#a5c8a5] font-chalk text-sm leading-relaxed">
                                        Every complex concept becomes a game mechanic. Boss fights for calculus, treasure hunts for history.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: Attention Spans */}
                        <div className="flip-card-container h-72 cursor-pointer">
                            <div className="flip-card-inner">
                                <div className="flip-card-face chalk-box bg-[#1a2e1a] rounded-2xl p-8 flex flex-col gap-4 overflow-hidden relative">
                                    <TrendingDown className="text-red-400" size={40} />
                                    <h3 className="text-xl font-bold chalk-text font-chalk">
                                        Shortening <span className="chalk-underline">Attention Spans</span>
                                    </h3>
                                    <p className="text-[#a5c8a5] font-chalk text-sm">Students disengage faster than ever.</p>
                                    <svg viewBox="0 0 100 40" className="w-full text-red-400/40 mt-auto">
                                        <polyline points="0,5 20,12 40,8 60,25 80,35 100,38" fill="none" stroke="currentColor" strokeWidth="3" />
                                    </svg>
                                </div>
                                <div className="flip-card-back bg-[#fbbf24]/10 chalk-box rounded-2xl p-8 flex flex-col justify-center gap-3">
                                    <div className="text-3xl">
                                        <Trophy className="text-[#fbbf24]" size={36} />
                                    </div>
                                    <h3 className="text-xl font-bold text-[#fbbf24] font-chalk">
                                        Engagement is built-in.
                                    </h3>
                                    <p className="text-[#a5c8a5] font-chalk text-sm leading-relaxed">
                                        Game loops &mdash; rewards, progress bars, unlockables &mdash; keep students locked in for hours.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CARD 3: Traditional Slides */}
                        <div className="flip-card-container h-72 cursor-pointer">
                            <div className="flip-card-inner">
                                <div className="flip-card-face chalk-box bg-[#1a2e1a] rounded-2xl p-8 flex flex-col gap-4">
                                    <MonitorOff className="text-yellow-500" size={40} />
                                    <h3 className="text-xl font-bold chalk-text font-chalk">
                                        Traditional Slides<br />
                                        <span className="chalk-underline">don&apos;t work.</span>
                                    </h3>
                                    <div className="flex justify-center py-2 text-4xl select-none">&#x1F634;</div>
                                </div>
                                <div className="flip-card-back bg-purple-900/20 chalk-box rounded-2xl p-8 flex flex-col justify-center gap-3">
                                    <div className="text-3xl select-none">&#x1F680;</div>
                                    <h3 className="text-xl font-bold text-purple-300 font-chalk">
                                        Interactive by default.
                                    </h3>
                                    <p className="text-[#a5c8a5] font-chalk text-sm leading-relaxed">
                                        No more passive watching. Students make choices, solve puzzles, and learn by doing.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= CTA ================= */}
            <section className="py-32 relative overflow-hidden bg-[#1a2e1a]">
                {/* Notebook lines */}
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, #7ec87e 0px, transparent 1px, transparent 28px)',
                        backgroundSize: '100% 28px',
                    }}
                />
                {/* Margin line */}
                <div className="absolute inset-y-0 left-16 w-px bg-red-500/15" />

                <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold chalk-text font-chalk leading-tight mb-10">
                        Immerse yourself in the<br />
                        <span className="text-[#7ec87e] chalk-underline">joy of learning.</span>
                    </h2>

                    <button className="relative font-pixel text-lg md:text-xl font-black px-10 md:px-12 py-4 md:py-5 bg-[#7ec87e] text-[#1a2e1a] border-b-4 border-green-800 pixel-shadow hover:-translate-y-1 hover:shadow-[4px_8px_0_rgba(0,0,0,0.5)] active:translate-y-1 active:border-b-0 transition-all duration-150">
                        GET STARTED
                    </button>

                    <p className="mt-6 text-[#a5c8a5] font-chalk text-sm">
                        Free to try. No credit card required.
                    </p>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="bg-[#1a2e1a] border-t chalk-line py-12">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <span className="font-pixel font-black text-2xl text-[#e8f5e9] tracking-widest block mb-3">NEXUS</span>
                        <div className="text-sm text-[#a5c8a5] font-chalk">&copy; 2026 Nexus Inc.</div>
                        <div className="flex gap-4 mt-4 text-[#a5c8a5]">
                            <Instagram size={20} className="hover:text-pink-400 cursor-pointer transition-colors" />
                            <Youtube size={20} className="hover:text-red-400 cursor-pointer transition-colors" />
                        </div>
                    </div>

                    {[
                        { title: 'Product', links: ['Features', 'Pricing'] },
                        { title: 'Company', links: ['About', 'Contact Us'] },
                        { title: 'Legal', links: ['Privacy', 'TOS', 'Legal'] },
                    ].map((col) => (
                        <div key={col.title}>
                            <h4 className="font-bold chalk-text font-chalk mb-4">{col.title}</h4>
                            <ul className="space-y-2 text-sm text-[#a5c8a5] font-chalk">
                                {col.links.map((link) => (
                                    <li key={link}>
                                        <a href="#" className="hover:text-[#e8f5e9] transition-colors">{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </footer>
        </div>
    );
}
