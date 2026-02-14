'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function LessonUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

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
            const response = await fetch('/api/parse-lesson', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to parse lesson');
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred during parsing.');
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
                                {loading ? 'Processing...' : 'Analyze Structure'}
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
            )}
        </div>
    );
}
