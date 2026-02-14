'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

type OutputType = 'game' | 'video' | 'song';

export function LessonUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [outputType, setOutputType] = useState<OutputType>('game');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // First, parse the lesson plan
            const parseResponse = await fetch('/api/parse-lesson', {
                method: 'POST',
                body: formData,
            });

            if (!parseResponse.ok) {
                const errorData = await parseResponse.json();
                throw new Error(errorData.error || 'Failed to parse lesson');
            }

            const parsedData = await parseResponse.json();

            // Then, generate the appropriate output based on selected type
            let apiEndpoint = '';
            switch (outputType) {
                case 'game':
                    setResult({ ...parsedData, outputType: 'game' });
                    setLoading(false);
                    return; // Game generation not implemented yet
                case 'video':
                    apiEndpoint = '/api/generate-video';
                    break;
                case 'song':
                    apiEndpoint = '/api/generate-song';
                    break;
            }

            const generateResponse = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonData: parsedData.data }),
            });

            if (!generateResponse.ok) {
                const errorData = await generateResponse.json();
                throw new Error(errorData.error || `Failed to generate ${outputType}`);
            }

            const generatedData = await generateResponse.json();
            setResult({ ...parsedData, generated: generatedData, outputType });
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred during processing.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 w-full max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Lesson Plan Structure Analysis</CardTitle>
                    <CardDescription>Upload a PDF, Markdown, Word, PowerPoint, or Text file containing your lesson plan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Output Type Selection */}
                        <div className="space-y-3">
                            <Label>Choose Output Type</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setOutputType('game')}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        outputType === 'game'
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                >
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">🎮</div>
                                        <div className="font-semibold">Game</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Interactive educational game
                                        </div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setOutputType('video')}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        outputType === 'video'
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                >
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">🎬</div>
                                        <div className="font-semibold">Video</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Educational video lesson
                                        </div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setOutputType('song')}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        outputType === 'song'
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                >
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">🎵</div>
                                        <div className="font-semibold">Song</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Catchy learning song with lyrics
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label htmlFor="lesson-file">File Upload</Label>
                            <Input
                                id="lesson-file"
                                type="file"
                                accept=".pdf,.txt,.md,.json,.pptx,.docx"
                                onChange={handleFileChange}
                            />
                            <p className="text-[0.8rem] text-muted-foreground">
                                Accepted formats: PDF, TXT, MD, JSON, PPTX, DOCX
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={!file || loading}>
                                {loading
                                    ? `Generating ${outputType}...`
                                    : `Generate ${outputType === 'game' ? 'Game' : outputType === 'video' ? 'Video' : 'Song'}`
                                }
                            </Button>
                            {file && <span className="text-sm text-muted-foreground">{file.name}</span>}
                        </div>

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
                    {/* Show generated content based on output type */}
                    {result.outputType === 'song' && result.generated && (
                        <Card>
                            <CardHeader>
                                <CardTitle>🎵 Generated Educational Song</CardTitle>
                                <CardDescription>Your custom learning song with lyrics</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Song Details:</h3>
                                    <p><strong>Title:</strong> {result.generated.title}</p>
                                    <p><strong>Genre:</strong> {result.generated.genre}</p>
                                    <p><strong>Duration:</strong> {result.generated.duration}</p>
                                </div>

                                {result.generated.audioUrl && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Listen:</h3>
                                        <audio controls className="w-full">
                                            <source src={result.generated.audioUrl} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                )}

                                {result.generated.lyrics && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Lyrics:</h3>
                                        <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-md border">
                                            <pre className="whitespace-pre-wrap font-sans">
                                                {result.generated.lyrics}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {result.outputType === 'video' && result.generated && (
                        <Card>
                            <CardHeader>
                                <CardTitle>🎬 Generated Educational Video</CardTitle>
                                <CardDescription>Your custom learning video</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Video Details:</h3>
                                    <p><strong>Title:</strong> {result.generated.title}</p>
                                    <p><strong>Duration:</strong> {result.generated.duration}</p>
                                </div>

                                {result.generated.videoUrl && (
                                    <div>
                                        <video controls className="w-full rounded-lg border">
                                            <source src={result.generated.videoUrl} type="video/mp4" />
                                            Your browser does not support the video element.
                                        </video>
                                    </div>
                                )}

                                {result.generated.script && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Script:</h3>
                                        <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-md border">
                                            <pre className="whitespace-pre-wrap font-sans text-sm">
                                                {result.generated.script}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Always show the parsed data */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Extracted Structure (Data)</CardTitle>
                                <CardDescription>The structured JSON generated from your file.</CardDescription>
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
