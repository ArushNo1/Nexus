'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, GraduationCap, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function OnboardingPage() {
    const [role, setRole] = useState<'student' | 'teacher' | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }
            setUser(user);

            // Check if profile already exists
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile) {
                router.push('/dashboard');
            } else {
                setLoading(false);
            }
        };

        checkUser();
    }, [router, supabase]);

    const handleContinue = async () => {
        if (!role || !user) return;
        setSaving(true);

        try {
            // Use UPSERT to handle cases where profile might already exist
            const { error, data } = await supabase.from('user_profiles').upsert(
                {
                    id: user.id,
                    role: role,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || '',
                    avatar_url: user.user_metadata?.avatar_url || '',
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: 'id', // Update if profile already exists
                }
            );

            if (error) {
                console.error('Upsert error details:', error);
                throw error;
            }

            router.push('/dashboard');
        } catch (error: any) {
            console.error('Error creating profile:', error?.message || error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a1f18] flex items-center justify-center text-slate-400">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a1f18] flex flex-col items-center justify-center p-4">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;800&family=Press+Start+2P&display=swap');
                .font-serif-display { font-family: 'DM Serif Display', serif; }
            `}</style>

            <Link href="/" className="mb-8 font-serif-display text-2xl text-emerald-400">
                Cognicade
            </Link>

            <Card className="w-full max-w-md bg-[#0d281e] border-emerald-500/20 shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-white font-serif-display">Welcome!</CardTitle>
                    <CardDescription className="text-slate-400">
                        How will you be using Cognicade?
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div
                            className={cn(
                                "cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-3 transition-all hover:bg-white/5",
                                role === 'student' ? "border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/10" : "border-white/10"
                            )}
                            onClick={() => setRole('student')}
                        >
                            <div className={cn("p-3 rounded-full transition-colors", role === 'student' ? "bg-emerald-500 text-[#0d281e]" : "bg-white/10 text-slate-400")}>
                                <User size={24} />
                            </div>
                            <span className={cn("font-medium", role === 'student' ? "text-emerald-400" : "text-slate-400")}>Student</span>
                            {role === 'student' && <Check size={16} className="text-emerald-500 absolute top-2 right-2 hidden" />}
                        </div>

                        <div
                            className={cn(
                                "cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-3 transition-all hover:bg-white/5",
                                role === 'teacher' ? "border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/10" : "border-white/10"
                            )}
                            onClick={() => setRole('teacher')}
                        >
                            <div className={cn("p-3 rounded-full transition-colors", role === 'teacher' ? "bg-emerald-500 text-[#0d281e]" : "bg-white/10 text-slate-400")}>
                                <GraduationCap size={24} />
                            </div>
                            <span className={cn("font-medium", role === 'teacher' ? "text-emerald-400" : "text-slate-400")}>Teacher</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleContinue}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] font-bold"
                        disabled={!role || saving}
                    >
                        {saving ? (
                            "Setting up..."
                        ) : (
                            <span className="flex items-center gap-2">
                                Continue <ArrowRight size={16} />
                            </span>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
