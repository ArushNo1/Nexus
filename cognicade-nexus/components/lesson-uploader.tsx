'use client';

import { useState, useRef } from 'react';
import {
    Upload,
    Gamepad2,
    Film,
    Music,
    FileText,
    Download,
    CheckCircle2,
    XCircle,
    Loader2,
    Clock,
    Play,
    ChevronDown,
    ChevronUp,
    Sparkles,
} from 'lucide-react';

interface GenerationStatus {
    game: 'idle' | 'loading' | 'done' | 'error';
    video: 'idle' | 'loading' | 'done' | 'error';
    song: 'idle' | 'loading' | 'done' | 'error';
}

const StatusBadge = ({ state, label, icon: Icon }: { state: string; label: string; icon: React.ElementType }) => {
    const config: Record<string, { bg: string; text: string; border: string; dot: string }> = {
        idle: { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20', dot: 'bg-slate-500' },
        loading: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-400' },
        done: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
        error: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-400' },
    };
    const c = config[state] || config.idle;
    const labels: Record<string, string> = {
        idle: 'Waiting',
        loading: 'Generating...',
        done: 'Complete',
        error: 'Failed',
    };

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${c.bg} ${c.border} transition-all`}>
            <Icon size={18} className={c.text} />
            <span className={`text-sm font-medium font-sans-clean ${c.text}`}>{label}</span>
            <div className="ml-auto flex items-center gap-2">
                {state === 'loading' && <Loader2 size={14} className="text-blue-400 animate-spin" />}
                {state === 'done' && <CheckCircle2 size={14} className="text-emerald-400" />}
                {state === 'error' && <XCircle size={14} className="text-red-400" />}
                {state === 'idle' && <Clock size={14} className="text-slate-500" />}
                <span className={`text-xs ${c.text} font-sans-clean`}>{labels[state]}</span>
            </div>
        </div>
    );
};

export function LessonUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<GenerationStatus>({
        game: 'idle', video: 'idle', song: 'idle'
    });
    const [dragOver, setDragOver] = useState(false);
    const [generateTutorial, setGenerateTutorial] = useState(true);
    const [generateMusic, setGenerateMusic] = useState(true);
    const [showJSON, setShowJSON] = useState(false);
    const [showSchema, setShowSchema] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setError(null);
        }
    };

    const handleExportJSON = () => {
        if (!result?.data) return;
        const exportData = { ...result.data };
        delete exportData._rawText;
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${result.filename?.replace(/\.[^.]+$/, '') || 'lesson-plan'}-parsed.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError(null);
        setResult(null);
        setStatus({ game: 'loading', video: 'idle', song: 'idle' });

        const formData = new FormData();
        formData.append('file', file);

        try {
            const parseResponse = await fetch('/api/parse-lesson', {
                method: 'POST',
                body: formData,
            });

            if (!parseResponse.ok) {
                const errorData = await parseResponse.json();
                throw new Error(errorData.details || errorData.error || 'Failed to parse lesson');
            }

            const parsedData = await parseResponse.json();
            setStatus(prev => ({ ...prev, game: 'done' }));
            setResult({ ...parsedData, generated: {} });

            const promises: Promise<void>[] = [];

            if (generateTutorial) {
                setStatus(prev => ({ ...prev, video: 'loading' }));
                promises.push(
                    fetch('/api/generate-video', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ lessonData: parsedData.data }),
                    })
                        .then(async (res) => {
                            if (!res.ok) {
                                const data = await res.json();
                                throw new Error(data.error || 'Failed to generate tutorial video');
                            }
                            const videoData = await res.json();
                            setResult((prev: any) => ({
                                ...prev,
                                generated: { ...prev.generated, video: videoData }
                            }));
                            setStatus(prev => ({ ...prev, video: 'done' }));
                        })
                        .catch((err) => {
                            console.error('Tutorial video error:', err);
                            setStatus(prev => ({ ...prev, video: 'error' }));
                        })
                );
            }

            if (generateMusic) {
                setStatus(prev => ({ ...prev, song: 'loading' }));
                promises.push(
                    fetch('/api/generate-song', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ lessonData: parsedData.data }),
                    })
                        .then(async (res) => {
                            if (!res.ok) {
                                const data = await res.json();
                                throw new Error(data.error || 'Failed to generate background music');
                            }
                            const songData = await res.json();
                            setResult((prev: any) => ({
                                ...prev,
                                generated: { ...prev.generated, song: songData }
                            }));
                            setStatus(prev => ({ ...prev, song: 'done' }));
                        })
                        .catch((err) => {
                            console.error('Background music error:', err);
                            setStatus(prev => ({ ...prev, song: 'error' }));
                        })
                );
            }

            await Promise.allSettled(promises);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred during processing.');
            setStatus({ game: 'error', video: 'error', song: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const hasProgress = status.game !== 'idle' || status.video !== 'idle' || status.song !== 'idle';

    return (
        <div className="space-y-8 w-full max-w-5xl mx-auto">

            {/* ── Upload Card ── */}
            <div className="relative bg-[#0d281e] border border-emerald-500/10 rounded-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent pointer-events-none" />

                <div className="relative z-10 p-8">
                    {/* Card header */}
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <Sparkles className="text-emerald-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif-display text-white">Create Educational Game</h2>
                            <p className="text-slate-400 text-sm font-sans-clean mt-0.5">Upload a lesson plan to generate an interactive game, concept video, and background music.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        {/* Drop zone */}
                        <div
                            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                                dragOver
                                    ? 'border-emerald-400 bg-emerald-500/10'
                                    : file
                                        ? 'border-emerald-500/30 bg-emerald-500/[0.04]'
                                        : 'border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.02]'
                            }`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.txt,.md,.json,.pptx,.docx"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {file ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="p-3 rounded-full bg-emerald-500/10">
                                        <FileText className="text-emerald-400" size={28} />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium font-sans-clean">{file.name}</p>
                                        <p className="text-slate-500 text-xs font-sans-clean mt-1">
                                            {(file.size / 1024).toFixed(1)} KB — Click or drop to replace
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="p-4 rounded-full bg-white/5 border border-white/10">
                                        <Upload className="text-slate-400" size={28} />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium font-sans-clean">Drop your lesson plan here</p>
                                        <p className="text-slate-500 text-sm font-sans-clean mt-1">or click to browse</p>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                                        {['PDF', 'TXT', 'MD', 'JSON', 'PPTX', 'DOCX'].map(ext => (
                                            <span key={ext} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-500 text-[10px] font-pixel">
                                                {ext}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Asset toggles */}
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-slate-300 font-sans-clean">Assets to Generate</p>
                            <div className="flex flex-wrap gap-3">
                                {/* Game — always on */}
                                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                    <Gamepad2 size={16} />
                                    <span className="text-sm font-medium font-sans-clean">Game</span>
                                    <span className="text-[9px] font-pixel text-emerald-500/60 ml-1">ALWAYS</span>
                                </div>

                                {/* Video toggle */}
                                <button
                                    type="button"
                                    onClick={() => setGenerateTutorial(!generateTutorial)}
                                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium font-sans-clean ${
                                        generateTutorial
                                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                            : 'bg-white/[0.02] border-white/10 text-slate-500 hover:border-white/20'
                                    }`}
                                >
                                    <Film size={16} />
                                    Concept Video
                                    <div className={`w-8 h-4 rounded-full relative transition-all ${generateTutorial ? 'bg-blue-500/40' : 'bg-white/10'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${generateTutorial ? 'left-4 bg-blue-400' : 'left-0.5 bg-slate-500'}`} />
                                    </div>
                                </button>

                                {/* Music toggle */}
                                <button
                                    type="button"
                                    onClick={() => setGenerateMusic(!generateMusic)}
                                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium font-sans-clean ${
                                        generateMusic
                                            ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                            : 'bg-white/[0.02] border-white/10 text-slate-500 hover:border-white/20'
                                    }`}
                                >
                                    <Music size={16} />
                                    Background Music
                                    <div className={`w-8 h-4 rounded-full relative transition-all ${generateMusic ? 'bg-purple-500/40' : 'bg-white/10'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${generateMusic ? 'left-4 bg-purple-400' : 'left-0.5 bg-slate-500'}`} />
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={!file || loading}
                            className={`group flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-base transition-all font-sans-clean ${
                                !file || loading
                                    ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                    : 'bg-emerald-500 hover:bg-emerald-400 text-[#0d281e] shadow-[0_4px_0_#065f46] hover:translate-y-[2px] hover:shadow-[0_2px_0_#065f46] active:translate-y-[4px] active:shadow-none'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    Generate Game
                                </>
                            )}
                        </button>

                        {/* Progress tracker */}
                        {hasProgress && (
                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 font-pixel">Pipeline Progress</p>
                                <div className="grid gap-2">
                                    <StatusBadge state={status.game} label="Game Data" icon={Gamepad2} />
                                    {generateTutorial && <StatusBadge state={status.video} label="Concept Video" icon={Film} />}
                                    {generateMusic && <StatusBadge state={status.song} label="Background Music" icon={Music} />}
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                <XCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                                <p className="text-red-400 text-sm font-sans-clean">{error}</p>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* ── Results ── */}
            {result && (
                <>
                    {/* Game Data Card */}
                    <div className="relative bg-[#0d281e] border border-emerald-500/10 rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none" />
                        <div className="relative z-10 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <Gamepad2 className="text-emerald-400" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-serif-display text-white">Game Data</h2>
                                    <p className="text-slate-500 text-sm font-sans-clean">Parsed lesson plan data that drives the educational game</p>
                                </div>
                            </div>

                            {result.data?.lessonPlan && (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {[
                                        { label: 'Title', value: result.data.lessonPlan.title },
                                        { label: 'Subject', value: result.data.lessonPlan.subject },
                                        { label: 'Grade Level', value: result.data.lessonPlan.gradeLevel },
                                        { label: 'Duration', value: result.data.lessonPlan.duration },
                                    ].map((item, i) => (
                                        <div key={i} className="px-4 py-3 rounded-xl bg-black/20 border border-white/5">
                                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-pixel mb-1">{item.label}</p>
                                            <p className="text-white font-medium font-sans-clean">{item.value || '—'}</p>
                                        </div>
                                    ))}

                                    {result.data.lessonPlan.objectives?.length > 0 && (
                                        <div className="sm:col-span-2 px-4 py-3 rounded-xl bg-black/20 border border-white/5">
                                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-pixel mb-2">Learning Objectives</p>
                                            <ul className="space-y-1.5">
                                                {result.data.lessonPlan.objectives.map((obj: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300 font-sans-clean">
                                                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                                                        {obj}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tutorial Video Card */}
                    {result.generated?.video && (
                        <div className="relative bg-[#0d281e] border border-blue-500/10 rounded-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />
                            <div className="relative z-10 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                        <Film className="text-blue-400" size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-serif-display text-white">Concept Video</h2>
                                        <p className="text-slate-500 text-sm font-sans-clean">Learn the concept and get introduced to the game</p>
                                    </div>
                                </div>

                                {/* Video metadata */}
                                <div className="flex flex-wrap gap-3 mb-6">
                                    {result.generated.video.title && (
                                        <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-sans-clean">
                                            {result.generated.video.title}
                                        </span>
                                    )}
                                    {result.generated.video.duration && (
                                        <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-sm font-sans-clean flex items-center gap-1.5">
                                            <Clock size={14} />
                                            {result.generated.video.duration}
                                        </span>
                                    )}
                                </div>

                                {/* Video player */}
                                {result.generated.video.videoUrl ? (
                                    <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
                                        <video controls className="w-full" preload="auto">
                                            <source src={result.generated.video.videoUrl} type="video/mp4" />
                                        </video>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                                        <Loader2 className="text-yellow-400 animate-spin" size={18} />
                                        <p className="text-yellow-400 text-sm font-sans-clean">Video is still rendering. The script is shown below.</p>
                                    </div>
                                )}

                                {/* Script */}
                                {result.generated.video.script && (
                                    <div className="mt-6">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-pixel mb-3">Video Script</p>
                                        <div className="bg-black/30 border border-white/5 rounded-xl p-5">
                                            <pre className="whitespace-pre-wrap text-sm text-slate-300 font-sans-clean leading-relaxed">
                                                {result.generated.video.script}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {/* Scenes */}
                                {result.generated.video.scenes?.length > 0 && (
                                    <div className="mt-6">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-pixel mb-3">Video Scenes</p>
                                        <div className="space-y-3">
                                            {result.generated.video.scenes.map((scene: any, idx: number) => (
                                                <div key={idx} className="bg-black/30 border border-white/5 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Play size={12} className="text-blue-400" />
                                                        <span className="text-blue-400 text-xs font-bold font-sans-clean">Scene {idx + 1}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-300 font-sans-clean leading-relaxed">{scene.narration}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Background Music Banner */}
                    {result.generated?.song && (
                        <div className="relative bg-[#0d281e] border border-purple-500/10 rounded-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] to-transparent pointer-events-none" />
                            <div className="relative z-10 p-6 flex items-center gap-4">
                                <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                    <Music className="text-purple-400" size={20} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-medium font-sans-clean">Background music generated</h3>
                                    <p className="text-slate-400 text-sm font-sans-clean">
                                        "{result.generated.song.title}" — {result.generated.song.genre}, {result.generated.song.duration}
                                        {result.generated.song.audioUrl && <span className="text-slate-600"> · Saved as game asset</span>}
                                    </p>
                                </div>
                                <CheckCircle2 className="text-purple-400 shrink-0" size={20} />
                            </div>
                        </div>
                    )}

                    {/* Export / Data Section */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* JSON Data */}
                        <div className="relative bg-[#0d281e] border border-white/5 rounded-2xl overflow-hidden">
                            <div className="relative z-10 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                            <FileText className="text-slate-400" size={18} />
                                        </div>
                                        <h3 className="text-lg font-serif-display text-white">Extracted Structure</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowJSON(!showJSON)}
                                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all"
                                        >
                                            {showJSON ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                        <button
                                            onClick={handleExportJSON}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-medium font-sans-clean"
                                        >
                                            <Download size={14} />
                                            Export
                                        </button>
                                    </div>
                                </div>
                                {showJSON && (
                                    <div className="bg-black/30 border border-white/5 rounded-xl p-4 overflow-auto max-h-[500px]">
                                        <pre className="text-xs font-mono text-slate-400 whitespace-pre-wrap break-all">
                                            {JSON.stringify(result.data, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Schema */}
                        <div className="relative bg-[#0d281e] border border-white/5 rounded-2xl overflow-hidden">
                            <div className="relative z-10 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                            <FileText className="text-slate-400" size={18} />
                                        </div>
                                        <h3 className="text-lg font-serif-display text-white">Schema Definition</h3>
                                    </div>
                                    <button
                                        onClick={() => setShowSchema(!showSchema)}
                                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all"
                                    >
                                        {showSchema ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                </div>
                                {showSchema && (
                                    <div className="bg-black/30 border border-white/5 rounded-xl p-4 overflow-auto max-h-[500px]">
                                        <pre className="text-xs font-mono text-slate-400 whitespace-pre-wrap break-all">
                                            {JSON.stringify(result.schema, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
