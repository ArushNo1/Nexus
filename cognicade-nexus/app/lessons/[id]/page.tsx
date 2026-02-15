'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/sidebar';
import Link from 'next/link';
import {
    ArrowLeft,
    BookOpen,
    Users,
    Clock,
    Film,
    Music,
    Gamepad2,
    Star,
    CheckCircle2,
    Play,
    Trash2,
    ExternalLink,
    Loader2,
    Target,
    ChevronDown,
    ChevronUp,
    FileText,
} from 'lucide-react';

export default function LessonDetailPage() {
    const params = useParams();
    const router = useRouter();
    const lessonId = params.id as string;

    const [lesson, setLesson] = useState<any>(null);
    const [video, setVideo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);
    const [showObjectives, setShowObjectives] = useState(true);
    const [showScenes, setShowScenes] = useState(false);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        const loadLesson = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            // Get user role
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            setUserRole(profile?.role || null);

            // Get lesson
            const { data: lessonData, error: lessonError } = await supabase
                .from('lessons')
                .select('*')
                .eq('id', lessonId)
                .single();

            if (lessonError || !lessonData) {
                console.error('Failed to load lesson:', lessonError);
                setLoading(false);
                return;
            }

            setLesson(lessonData);

            // Get associated video
            const { data: videoData } = await supabase
                .from('videos')
                .select('*')
                .eq('lesson_id', lessonId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (videoData) {
                setVideo(videoData);
            }

            setLoading(false);
        };

        loadLesson();
    }, [lessonId, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a1f18] text-slate-100">
                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;800&family=Press+Start+2P&display=swap');
                    .font-pixel { font-family: 'Press Start 2P', cursive; }
                    .font-serif-display { font-family: 'DM Serif Display', serif; }
                    .font-sans-clean { font-family: 'Inter', sans-serif; }
                `}</style>
                <Sidebar />
                <div className="min-h-screen transition-[margin] duration-300" style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}>
                    <div className="flex items-center justify-center py-32">
                        <div className="flex items-center gap-3 text-emerald-400 font-sans-clean">
                            <Loader2 size={24} className="animate-spin" />
                            Loading lesson...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="min-h-screen bg-[#0a1f18] text-slate-100">
                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;800&family=Press+Start+2P&display=swap');
                    .font-pixel { font-family: 'Press Start 2P', cursive; }
                    .font-serif-display { font-family: 'DM Serif Display', serif; }
                    .font-sans-clean { font-family: 'Inter', sans-serif; }
                `}</style>
                <Sidebar />
                <div className="min-h-screen transition-[margin] duration-300" style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}>
                    <div className="px-8 py-12 text-center">
                        <BookOpen className="mx-auto text-slate-500 mb-4" size={48} />
                        <h2 className="text-2xl font-serif-display text-white mb-2">Lesson Not Found</h2>
                        <p className="text-slate-400 font-sans-clean mb-6">This lesson doesn't exist or you don't have access to it.</p>
                        <Link href="/lessons">
                            <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] font-bold rounded-lg transition-all shadow-[0_4px_0_#065f46] hover:translate-y-[2px] hover:shadow-[0_2px_0_#065f46] active:translate-y-[4px] active:shadow-none font-sans-clean">
                                Back to Lessons
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a1f18] text-slate-100">
            {/* Global Styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;800&family=Press+Start+2P&display=swap');
                .font-pixel { font-family: 'Press Start 2P', cursive; }
                .font-serif-display { font-family: 'DM Serif Display', serif; }
                .font-sans-clean { font-family: 'Inter', sans-serif; }

                @keyframes float-gentle {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                .animate-float-gentle { animation: float-gentle 4s ease-in-out infinite; }
            `}</style>

            <Sidebar />

            <div className="min-h-screen transition-[margin] duration-300" style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}>

                <div className="px-8 py-8">
                    {/* Back button */}
                    <Link href="/lessons" className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-8 font-sans-clean text-sm">
                        <ArrowLeft size={16} />
                        Back to Lessons
                    </Link>

                    {/* Lesson Header */}
                    <div className="mb-8">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-4xl font-serif-display text-white mb-3">{lesson.title}</h1>
                                <div className="flex flex-wrap gap-3">
                                    {lesson.subject && (
                                        <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-sans-clean flex items-center gap-1.5">
                                            <BookOpen size={14} />
                                            {lesson.subject}
                                        </span>
                                    )}
                                    {lesson.grade_level && (
                                        <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-sans-clean flex items-center gap-1.5">
                                            <Target size={14} />
                                            {lesson.grade_level}
                                        </span>
                                    )}
                                    {lesson.created_at && (
                                        <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-sm font-sans-clean flex items-center gap-1.5">
                                            <Clock size={14} />
                                            {new Date(lesson.created_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {userRole === 'teacher' && (
                                <button
                                    onClick={async () => {
                                        if (!confirm('Are you sure you want to delete this lesson? This cannot be undone.')) return;
                                        const supabase = createClient();
                                        await supabase.from('lessons').delete().eq('id', lesson.id);
                                        router.push('/lessons');
                                    }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg transition-all text-sm font-medium font-sans-clean"
                                >
                                    <Trash2 size={16} />
                                    Delete Lesson
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Main content — left 2/3 */}
                        <div className="xl:col-span-2 space-y-8">

                            {/* Video Section */}
                            {video && (
                                <div className="relative bg-[#0d281e] border border-blue-500/10 rounded-2xl overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />
                                    <div className="relative z-10 p-6">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                                <Film className="text-blue-400" size={18} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-serif-display text-white">Concept Video</h2>
                                                {video.title && <p className="text-slate-500 text-sm font-sans-clean">{video.title}</p>}
                                            </div>
                                            {video.status && (
                                                <span className={`ml-auto px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-pixel ${
                                                    video.status === 'completed'
                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                        : video.status === 'failed'
                                                            ? 'bg-red-500/20 text-red-400'
                                                            : 'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                    {video.status}
                                                </span>
                                            )}
                                        </div>

                                        {video.video_url ? (
                                            <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
                                                <video controls className="w-full" preload="auto">
                                                    <source src={video.video_url} type="video/mp4" />
                                                </video>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                                                <Loader2 className="text-yellow-400 animate-spin" size={18} />
                                                <p className="text-yellow-400 text-sm font-sans-clean">
                                                    {video.status === 'failed'
                                                        ? `Video rendering failed${video.error_message ? `: ${video.error_message}` : ''}`
                                                        : 'Video is still processing...'}
                                                </p>
                                            </div>
                                        )}

                                        {/* Scenes (collapsible) */}
                                        {video.scenes && Array.isArray(video.scenes) && video.scenes.length > 0 && (
                                            <div className="mt-5">
                                                <button
                                                    onClick={() => setShowScenes(!showScenes)}
                                                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-sans-clean"
                                                >
                                                    {showScenes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                    {video.scenes.length} Scene{video.scenes.length !== 1 ? 's' : ''}
                                                </button>
                                                {showScenes && (
                                                    <div className="mt-3 space-y-2">
                                                        {video.scenes.map((scene: any, idx: number) => (
                                                            <div key={idx} className="bg-black/30 border border-white/5 rounded-xl p-4">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Play size={12} className="text-blue-400" />
                                                                    <span className="text-blue-400 text-xs font-bold font-sans-clean">Scene {idx + 1}</span>
                                                                </div>
                                                                <p className="text-sm text-slate-300 font-sans-clean leading-relaxed">{scene.narration}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* No video placeholder */}
                            {!video && (
                                <div className="relative bg-[#0d281e] border border-white/5 rounded-2xl p-8 text-center">
                                    <Film className="mx-auto text-slate-600 mb-3" size={40} />
                                    <p className="text-slate-400 font-sans-clean">No video generated for this lesson yet.</p>
                                    {userRole === 'teacher' && (
                                        <Link href={`/create?id=${lesson.id}`}>
                                            <button className="mt-4 px-5 py-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all text-sm font-medium font-sans-clean">
                                                Generate Video
                                            </button>
                                        </Link>
                                    )}
                                </div>
                            )}

                            {/* Content / Raw Data (collapsible) */}
                            {lesson.content && Object.keys(lesson.content).length > 0 && (
                                <div className="relative bg-[#0d281e] border border-white/5 rounded-2xl overflow-hidden">
                                    <div className="relative z-10 p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                                    <FileText className="text-slate-400" size={18} />
                                                </div>
                                                <h2 className="text-xl font-serif-display text-white">Lesson Content</h2>
                                            </div>
                                            <button
                                                onClick={() => setShowContent(!showContent)}
                                                className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all"
                                            >
                                                {showContent ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        </div>
                                        {showContent && (
                                            <div className="mt-4 bg-black/30 border border-white/5 rounded-xl p-4 overflow-auto max-h-[500px]">
                                                <pre className="text-xs font-mono text-slate-400 whitespace-pre-wrap break-all">
                                                    {JSON.stringify(lesson.content, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar — right 1/3 */}
                        <div className="space-y-6">
                            {/* Lesson Info Card */}
                            <div className="relative bg-[#0d281e] border border-emerald-500/10 rounded-2xl overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none" />
                                <div className="relative z-10 p-6">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                            <Gamepad2 className="text-emerald-400" size={18} />
                                        </div>
                                        <h2 className="text-xl font-serif-display text-white">Lesson Info</h2>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { label: 'Subject', value: lesson.subject },
                                            { label: 'Grade Level', value: lesson.grade_level },
                                            { label: 'Created', value: lesson.created_at ? new Date(lesson.created_at).toLocaleDateString() : null },
                                        ].filter(item => item.value).map((item, i) => (
                                            <div key={i} className="px-4 py-3 rounded-xl bg-black/20 border border-white/5">
                                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-pixel mb-1">{item.label}</p>
                                                <p className="text-white font-medium font-sans-clean text-sm">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Objectives Card */}
                            {lesson.objectives && lesson.objectives.length > 0 && (
                                <div className="relative bg-[#0d281e] border border-emerald-500/10 rounded-2xl overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none" />
                                    <div className="relative z-10 p-6">
                                        <button
                                            onClick={() => setShowObjectives(!showObjectives)}
                                            className="flex items-center justify-between w-full mb-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                                    <Target className="text-emerald-400" size={18} />
                                                </div>
                                                <h2 className="text-xl font-serif-display text-white">Objectives</h2>
                                            </div>
                                            {showObjectives ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                        </button>

                                        {showObjectives && (
                                            <ul className="space-y-2">
                                                {lesson.objectives.map((obj: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300 font-sans-clean">
                                                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                                                        {obj}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Video Key Takeaways */}
                            {video?.key_takeaways && video.key_takeaways.length > 0 && (
                                <div className="relative bg-[#0d281e] border border-blue-500/10 rounded-2xl overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />
                                    <div className="relative z-10 p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                                <Star className="text-blue-400" size={18} />
                                            </div>
                                            <h2 className="text-xl font-serif-display text-white">Key Takeaways</h2>
                                        </div>
                                        <ul className="space-y-2">
                                            {video.key_takeaways.map((point: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300 font-sans-clean">
                                                    <Star size={12} className="text-blue-400 shrink-0 mt-1" />
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
