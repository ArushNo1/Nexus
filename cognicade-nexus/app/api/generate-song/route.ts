import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// ── TypeScript Interfaces ──────────────────────────────────────────────────

interface SongData {
    title: string;
    genre: string;
    duration: string;
    description: string;
    keyTakeaways: string[];
}

interface SongResponse extends SongData {
    audioUrl: string | null;
    generatedAt: string;
    agent: string;
}

// ── Mozart Agent: Background Music Generator ───────────────────────────────

/**
 * Mozart Agent generates procedural background music
 * using audio synthesis (numpy + pydub). No TTS — real instrumental music.
 */

const GEMINI_MODELS = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash'];

async function generateSongWithGemini(lessonData: any): Promise<SongResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    const title = lessonData.lessonPlan?.title || 'Educational Concept';
    const subject = lessonData.lessonPlan?.subject || 'Learning';
    const objectives = lessonData.lessonPlan?.objectives || [];
    const content = lessonData.lessonPlan?.content || {};

    const prompt = `You are Mozart, an expert game music composer. Create background music specifications for an educational game.

GAME INFORMATION:
Title: ${title}
Subject: ${subject}
Learning Objectives: ${objectives.join(', ')}
Game Theme: ${content.introduction || ''} ${content.procedure || ''}

TASK: Describe the ideal background music for this educational game.
Pick a genre that fits the subject (e.g., ambient for science, chiptune for math, lo-fi for history).

Return JSON:
{
  "title": "string - creative music title",
  "genre": "string - one of: ambient, chiptune, lo-fi, orchestral, synthwave",
  "duration": "1:30",
  "description": "string - description of mood, tempo, instruments",
  "keyTakeaways": ["how the music enhances learning"]
}

IMPORTANT: Return ONLY valid JSON. No markdown fences.`;

    for (const model of GEMINI_MODELS) {
        try {
            console.log(`[generate-song] Trying model: ${model}`);
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.9,
                            responseMimeType: 'application/json',
                        },
                    }),
                }
            );

            if (response.status === 429) {
                console.warn(`[generate-song] Rate limited on ${model}, trying next...`);
                continue;
            }

            if (!response.ok) {
                console.error(`[generate-song] Gemini API error (${model}):`, response.status, await response.text());
                continue;
            }

            const result = await response.json();
            const responseContent = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!responseContent) {
                console.warn(`[generate-song] No content from ${model}, trying next...`);
                continue;
            }

            const cleaned = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const songData = JSON.parse(cleaned);

            // Generate actual instrumental music using our synthesizer
            let audioUrl = null;
            try {
                audioUrl = await generateInstrumentalMusic(title, songData.genre || 'ambient');
            } catch (audioError) {
                console.warn('Music generation failed:', audioError);
            }

            console.log(`[generate-song] Successfully generated with ${model}`);
            return {
                ...songData,
                audioUrl,
                generatedAt: new Date().toISOString(),
                agent: 'Mozart (Procedural Synth)',
            };
        } catch (error) {
            console.error(`[generate-song] Error with model ${model}:`, error);
            continue;
        }
    }

    throw new Error('All Gemini models failed. You may have exceeded your API quota. Please try again later.');
}

async function generateInstrumentalMusic(title: string, genre: string): Promise<string | null> {
    const timestamp = Date.now();
    const outputPath = path.join(process.cwd(), 'public', 'generated', `song-${timestamp}.mp3`);
    const scriptPath = path.join(process.cwd(), 'python_scripts', 'generate_music.py');

    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true }).catch(() => { });

    try {
        const cleanTitle = title.replace(/"/g, '').replace(/'/g, '');
        const cleanGenre = genre.replace(/"/g, '').replace(/'/g, '');
        const command = `python3 "${scriptPath}" "${cleanTitle}" "${cleanGenre}" "${outputPath}" 90`;

        console.log('[generate-song] Generating instrumental music...');
        const { stdout } = await execAsync(command, { timeout: 60000 });

        const result = JSON.parse(stdout);
        if (!result.success) {
            throw new Error(result.error || 'Music generation failed');
        }

        console.log(`[generate-song] Music generated: ${result.bpm} BPM, ${result.progression} progression, ${result.scale} scale`);
        return `/generated/song-${timestamp}.mp3`;
    } catch (error) {
        console.error('Music generation error:', error);
        await fs.unlink(outputPath).catch(() => { });
        throw error;
    }
}

// ── API Route Handler ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { lessonData } = body;

        if (!lessonData) {
            return NextResponse.json(
                { error: 'Lesson data is required' },
                { status: 400 }
            );
        }

        const songData = await generateSongWithGemini(lessonData);

        return NextResponse.json({
            success: true,
            ...songData,
        });
    } catch (error: any) {
        console.error('Error in song generation:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate background music' },
            { status: 500 }
        );
    }
}
