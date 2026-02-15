'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LandingNavbar from '@/components/ui/landing-navbar';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) router.replace('/dashboard');
        });
    }, [router]);

    const handleGoogleSignIn = async () => {
        const supabase = createClient();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/auth/confirm` },
            });
            if (error) throw error;
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'An error occurred');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a1f18] text-slate-100 relative overflow-hidden">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;800&family=Press+Start+2P&display=swap');
                .font-pixel { font-family: 'Press Start 2P', cursive; }
                .font-serif-display { font-family: 'DM Serif Display', serif; }
                .font-sans-clean { font-family: 'Inter', sans-serif; }
                @keyframes chalk-drift {
                    0% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
                    50% { transform: translateY(-12px) rotate(calc(var(--rot, 0deg) + 3deg)); }
                    100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
                }
                .animate-chalk-drift { animation: chalk-drift var(--dur, 6s) ease-in-out infinite; }
            `}</style>

            <LandingNavbar scrolled={scrolled} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            {/* Ambient glows */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/[0.04] blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/[0.04] blur-[100px] rounded-full pointer-events-none" />

            {/* Floating chalk formulas */}
            <div className="hidden lg:block fixed inset-0 pointer-events-none select-none font-serif-display text-white z-0 overflow-hidden">
                <span className="absolute top-[15%] left-[5%] text-2xl opacity-[0.06] animate-chalk-drift" style={{ '--rot': '8deg', '--dur': '9s' } as React.CSSProperties}>f(x) = ax + b</span>
                <span className="absolute top-[35%] right-[6%] text-3xl opacity-[0.05] animate-chalk-drift" style={{ '--rot': '-5deg', '--dur': '7s', animationDelay: '2s' } as React.CSSProperties}>E = mc²</span>
                <span className="absolute bottom-[25%] left-[8%] text-xl opacity-[0.05] animate-chalk-drift" style={{ '--rot': '4deg', '--dur': '10s', animationDelay: '1s' } as React.CSSProperties}>∑ n²</span>
                <span className="absolute bottom-[15%] right-[10%] text-2xl opacity-[0.06] animate-chalk-drift" style={{ '--rot': '-7deg', '--dur': '8s', animationDelay: '3s' } as React.CSSProperties}>a² + b² = c²</span>
            </div>

            {/* Form */}
            <div className="relative z-10 flex items-center justify-center min-h-screen pt-24 pb-12 px-6">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-serif-display text-white mb-2">Welcome back</h1>
                        <p className="text-slate-400 font-sans-clean">Sign in to continue your journey</p>
                    </div>

                    {/* Card */}
                    <div className="relative bg-[#0d281e] border border-emerald-500/10 rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent pointer-events-none" />
                        <div className="relative z-10 p-8">
                            <div className="space-y-5">
                                {/* Error */}
                                {error && (
                                    <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <p className="text-red-400 text-sm font-sans-clean">{error}</p>
                                    </div>
                                )}

                                {/* Google Sign In */}
                                <button
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    disabled={isLoading}
                                    className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-sm transition-all font-sans-clean ${
                                        isLoading
                                            ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                            : 'bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] shadow-[0_4px_0_#065f46] hover:translate-y-[2px] hover:shadow-[0_2px_0_#065f46] active:translate-y-[4px] active:shadow-none'
                                    }`}
                                >
                                    {isLoading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : <><svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>Continue with Google</>}
                                </button>
                            </div>

                            {/* Footer link */}
                            <p className="mt-6 text-center text-sm text-slate-500 font-sans-clean">
                                Don&apos;t have an account?{' '}
                                <Link href="/auth/sign-up" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
