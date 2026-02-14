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
        <div className="min-h-screen bg-background text-foreground py-12 px-6">
                <LandingNavbar scrolled={scrolled} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
                <header className="mb-12 text-center mt-20">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                        Nexus Lesson Parser
                    </h1>
                    <p className="text-xl text-muted-foreground w-full max-w-2xl mx-auto">
                        Convert unstructured lesson plans into structured data compatible with the Nexus Agent system.
                    </p>
                </header>

                <main className="container mx-auto">
                    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
                        <LessonUploader />
                    </Suspense>
                </main>
            </div>
    );
}
