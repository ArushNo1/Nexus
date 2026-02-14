'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface GenerationStatus {
    game: 'idle' | 'loading' | 'done' | 'error';
    video: 'idle' | 'loading' | 'done' | 'error';
    song: 'idle' | 'loading' | 'done' | 'error';
}

export function LessonUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<GenerationStatus>({
        game: 'idle', video: 'idle', song: 'idle'
    });

    // Options for what to generate alongside the game
    const [generateTutorial, setGenerateTutorial] = useState(true);
    const [generateMusic, setGenerateMusic] = useState(true);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
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
            // Step 1: Parse the lesson plan
            const parseResponse = await fetch('/api/parse-lesson', {
                method: 'POST',
                body: formData,
            });

            if (!parseResponse.ok) {
                const errorData = await parseResponse.json();
                throw new Error(errorData.details || errorData.error || 'Failed to parse lesson');
            }

            const parsedData = await parseResponse.json();

            // Step 2: Set the game data (game = parsed data for now)
            setStatus(prev => ({ ...prev, game: 'done' }));
            setResult({ ...parsedData, generated: {} });

            // Step 3: Generate tutorial video and background music in parallel
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

    const StatusBadge = ({ state }: { state: string }) => {
        const styles: Record<string, string> = {
            idle: 'bg-muted text-muted-foreground',
            loading: 'bg-blue-500/20 text-blue-400 animate-pulse',
            done: 'bg-green-500/20 text-green-400',
            error: 'bg-red-500/20 text-red-400',
        };
        const labels: Record<string, string> = {
            idle: '⏸ Waiting',
            loading: '⏳ Generating...',
            done: '✅ Done',
            error: '❌ Failed',
        };
        return (
            <span className={`text-xs px-2 py-1 rounded-full ${styles[state] || styles.idle}`}>
                {labels[state] || state}
            </span>
        );
    };

    return (
        <div className="space-y-8 w-full max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>🎮 Create Educational Game</CardTitle>
                    <CardDescription>
                        Upload a lesson plan to generate an interactive educational game, concept video, and background music.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label htmlFor="lesson-file">Lesson Plan File</Label>
                            <Input
                                id="lesson-file"
                                type="file"
                                accept=".pdf,.txt,.md,.json,.pptx,.docx"
                                onChange={handleFileChange}
                            />
                            <p className="text-[0.8rem] text-muted-foreground">
                                Accepted: PDF, TXT, MD, JSON, PPTX, DOCX
                            </p>
                        </div>

                        {/* Asset generation options */}
                        <div className="space-y-3">
                            <Label>Game Assets to Generate</Label>
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={true}
                                        disabled
                                        className="rounded"
                                    />
                                    <span className="text-sm">🎮 Game <span className="text-muted-foreground">(always)</span></span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={generateTutorial}
                                        onChange={(e) => setGenerateTutorial(e.target.checked)}
                                        className="rounded"
                                    />
                                    <span className="text-sm">🎬 Concept & Game Intro Video</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={generateMusic}
                                        onChange={(e) => setGenerateMusic(e.target.checked)}
                                        className="rounded"
                                    />
                                    <span className="text-sm">🎵 Background Music <span className="text-muted-foreground">(backend asset)</span></span>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={!file || loading}>
                                {loading ? 'Generating...' : 'Generate Game'}
                            </Button>
                            {file && <span className="text-sm text-muted-foreground">{file.name}</span>}
                        </div>

                        {/* Generation progress */}
                        {(status.game !== 'idle' || status.video !== 'idle' || status.song !== 'idle') && (
                            <div className="flex flex-wrap gap-3 items-center text-sm">
                                <span className="font-medium">Progress:</span>
                                <span className="flex items-center gap-1">🎮 Game <StatusBadge state={status.game} /></span>
                                {generateTutorial && <span className="flex items-center gap-1">🎬 Video <StatusBadge state={status.video} /></span>}
                                {generateMusic && <span className="flex items-center gap-1">🎵 Music <StatusBadge state={status.song} /></span>}
                            </div>
                        )}

                        {error && (
                            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                                Error: {error}
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>

            {result && (
                <>
                    {/* Game Data */}
                    <Card>
                        <CardHeader>
                            <CardTitle>🎮 Game Data</CardTitle>
                            <CardDescription>Parsed lesson plan data that drives the educational game</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {result.data?.lessonPlan && (
                                <div className="grid gap-2">
                                    <p><strong>Title:</strong> {result.data.lessonPlan.title}</p>
                                    <p><strong>Subject:</strong> {result.data.lessonPlan.subject}</p>
                                    <p><strong>Grade Level:</strong> {result.data.lessonPlan.gradeLevel}</p>
                                    <p><strong>Duration:</strong> {result.data.lessonPlan.duration}</p>
                                    {result.data.lessonPlan.objectives?.length > 0 && (
                                        <div>
                                            <strong>Learning Objectives:</strong>
                                            <ul className="list-disc list-inside ml-2 mt-1 text-sm text-muted-foreground">
                                                {result.data.lessonPlan.objectives.map((obj: string, i: number) => (
                                                    <li key={i}>{obj}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Tutorial Video */}
                    {result.generated?.video && (
                        <Card>
                            <CardHeader>
                                <CardTitle>🎬 Concept & Game Intro Video</CardTitle>
                                <CardDescription>Learn the concept and get introduced to the game</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p><strong>Title:</strong> {result.generated.video.title}</p>
                                    <p><strong>Duration:</strong> {result.generated.video.duration}</p>
                                </div>

                                {result.generated.video.videoUrl ? (
                                    <div>
                                        <video controls className="w-full rounded-lg border" preload="auto">
                                            <source src={result.generated.video.videoUrl} type="video/mp4" />
                                        </video>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 p-3 rounded-md text-sm">
                                        ⚠️ Video rendering is still processing. The script is shown below.
                                    </div>
                                )}

                                {result.generated.video.script && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Video Script:</h3>
                                        <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-md border">
                                            <pre className="whitespace-pre-wrap font-sans text-sm">
                                                {result.generated.video.script}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {result.generated.video.scenes?.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Video Scenes:</h3>
                                        <div className="space-y-3">
                                            {result.generated.video.scenes.map((scene: any, idx: number) => (
                                                <div key={idx} className="bg-slate-100 dark:bg-slate-950 p-3 rounded-md border">
                                                    <p className="text-sm font-medium text-primary">Scene {idx + 1}</p>
                                                    <p className="text-sm mt-1">{scene.narration}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}


                    {/* Background Music (backend asset - just confirm it was generated) */}
                    {result.generated?.song && (
                        <div className="bg-green-500/10 text-green-600 dark:text-green-400 p-3 rounded-md text-sm flex items-center gap-2">
                            <span>🎵</span>
                            <span>
                                <strong>Background music generated</strong> — "{result.generated.song.title}" ({result.generated.song.genre}, {result.generated.song.duration})
                                {result.generated.song.audioUrl && <span className="text-muted-foreground"> • Saved as game asset</span>}
                            </span>
                        </div>
                    )}

                    {/* Export Section */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card className="h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div>
                                    <CardTitle>Extracted Structure (JSON)</CardTitle>
                                    <CardDescription>The structured data powering the game.</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleExportJSON} className="shrink-0">
                                    📥 Export JSON
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-md overflow-auto max-h-[500px] border">
                                    <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                                        {JSON.stringify(result.data, null, 2)}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Schema Definition</CardTitle>
                                <CardDescription>The JSON schema structure used for validation.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-md overflow-auto max-h-[500px] border">
                                    <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                                        {JSON.stringify(result.schema, null, 2)}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
