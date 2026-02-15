'use client';

import Link from 'next/link';
import { Menu, X, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface LandingNavbarProps {
  scrolled: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export default function LandingNavbar({ scrolled, isMenuOpen, setIsMenuOpen }: LandingNavbarProps) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user ?? null);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };
  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0d281e]/90 backdrop-blur-md py-4 border-b border-white/5 shadow-md' : 'bg-transparent py-8'}`}>
      <div className="w-full px-8 lg:px-12 xl:px-16 2xl:px-24 flex justify-between items-center">
        {/* Logo */}
        <Link href="/landing" className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <img src="/NEXUSLOGO.png" alt="Nexus" className="w-12 h-12 object-contain" />
          <span className="text-2xl text-white font-serif-display">Nexus</span>
        </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-12 text-sm font-medium text-slate-300">
          <Link href="/features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
{/* Conditional Auth Button */}
          {!isLoading && (
            user ? (
              <button onClick={handleLogout} className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all shadow-md flex items-center gap-2">
                Logout
              </button>
            ) : (
              <Link href="/auth/login">
                <button className="px-6 py-2.5 bg-white text-[#0d281e] font-bold rounded-lg hover:bg-slate-200 transition-all shadow-md">
                  Sign In
                </button>
              </Link>
            )
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </nav>
  );
}
