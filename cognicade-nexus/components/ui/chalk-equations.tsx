'use client';

/**
 * Ghost chalkboard equations that float in the background.
 * Drop this into any page to fill empty space with subtle, animated formulas.
 */
export default function ChalkEquations() {
    return (
        <>
            <style jsx global>{`
                @keyframes chalk-drift {
                    0% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
                    50% { transform: translateY(-12px) rotate(calc(var(--rot, 0deg) + 3deg)); }
                    100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
                }
                .animate-chalk-drift { animation: chalk-drift var(--dur, 6s) ease-in-out infinite; }
            `}</style>
            <div className="fixed inset-0 pointer-events-none select-none font-serif-display text-white z-0 overflow-hidden">
                <span className="absolute top-[8%] left-[5%] text-3xl opacity-[0.04] animate-chalk-drift" style={{ '--rot': '12deg', '--dur': '7s' } as React.CSSProperties}>∫ x² dx</span>
                <span className="absolute top-[15%] right-[8%] text-4xl opacity-[0.05] animate-chalk-drift" style={{ '--rot': '-6deg', '--dur': '8s' } as React.CSSProperties}>E = mc²</span>
                <span className="absolute top-[35%] left-[3%] text-2xl opacity-[0.04] animate-chalk-drift" style={{ '--rot': '5deg', '--dur': '9s', animationDelay: '1s' } as React.CSSProperties}>C₆H₁₂O₆</span>
                <span className="absolute top-[55%] right-[5%] text-3xl opacity-[0.05] animate-chalk-drift" style={{ '--rot': '-8deg', '--dur': '6s', animationDelay: '2s' } as React.CSSProperties}>Σ n²</span>
                <span className="absolute top-[72%] left-[8%] text-2xl opacity-[0.04] animate-chalk-drift" style={{ '--rot': '3deg', '--dur': '10s', animationDelay: '0.5s' } as React.CSSProperties}>∇ × B = μ₀J</span>
                <span className="absolute top-[25%] right-[15%] text-xl opacity-[0.03] animate-chalk-drift" style={{ '--rot': '-4deg', '--dur': '7.5s', animationDelay: '3s' } as React.CSSProperties}>π r²</span>
                <span className="absolute top-[85%] right-[12%] text-3xl opacity-[0.05] animate-chalk-drift" style={{ '--rot': '7deg', '--dur': '8.5s', animationDelay: '1.5s' } as React.CSSProperties}>F = ma</span>
                <span className="absolute top-[45%] left-[12%] text-2xl opacity-[0.03] animate-chalk-drift" style={{ '--rot': '-10deg', '--dur': '9.5s', animationDelay: '4s' } as React.CSSProperties}>ΔG = ΔH − TΔS</span>
                <span className="absolute top-[65%] right-[20%] text-xl opacity-[0.03] animate-chalk-drift" style={{ '--rot': '2deg', '--dur': '6.5s', animationDelay: '2.5s' } as React.CSSProperties}>λ = h/p</span>
                <span className="absolute top-[5%] left-[22%] text-2xl opacity-[0.04] animate-chalk-drift" style={{ '--rot': '-3deg', '--dur': '11s', animationDelay: '3.5s' } as React.CSSProperties}>∂²ψ/∂x²</span>
                <span className="absolute top-[90%] left-[10%] text-xl opacity-[0.03] animate-chalk-drift" style={{ '--rot': '9deg', '--dur': '7s', animationDelay: '5s' } as React.CSSProperties}>a² + b² = c²</span>
                <span className="absolute top-[48%] right-[30%] text-lg opacity-[0.03] animate-chalk-drift" style={{ '--rot': '4deg', '--dur': '8s', animationDelay: '1s' } as React.CSSProperties}>dx/dt = αx</span>
                <span className="absolute top-[78%] left-[35%] text-lg opacity-[0.04] animate-chalk-drift" style={{ '--rot': '-5deg', '--dur': '9s', animationDelay: '3s' } as React.CSSProperties}>∮ E · dA = Q/ε₀</span>
            </div>
        </>
    );
}
