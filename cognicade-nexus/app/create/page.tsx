import { Suspense } from 'react';
import { LessonUploader } from '@/components/lesson-uploader';

export default function CreateLessonPage() {
    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-6">
                <header className="mb-12 text-center">
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
