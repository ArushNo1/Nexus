import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// ── TypeScript Interfaces ──────────────────────────────────────────────────

interface VideoScene {
    narration: string;
    animationType: string;
    elements: string[];
    audioUrl?: string | null;
}

interface VideoData {
    title: string;
    targetAudience: string;
    scenes: VideoScene[];
    keyTakeaways: string[];
    [key: string]: any;
}

interface VideoResponse extends VideoData {
    videoUrl: string | null;
    thumbnailUrl: string | null;
    generatedAt: string;
    agent: string;
}

// ── Edison Agent: Educational Video Generator ──────────────────────────────

async function generateSceneAudio(
    narration: string,
    outputPath: string
): Promise<boolean> {
    const scriptPath = path.join(
        process.cwd(),
        'python_scripts',
        'generate_audio.py'
    );

    // Clean text: remove any escaped chars, markdown, etc.
    const cleanText = narration
        .replace(/\\n/g, ' ')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\/g, '')
        .replace(/[*_#`~]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Write text to a temp file to avoid shell escaping issues
    const textPath = outputPath.replace('.mp3', '.txt');
    await fs.writeFile(textPath, cleanText);

    // Updated command: read from file
    const cmd = `python3 "${scriptPath}" "$(cat '${textPath}')" "en-US-AriaNeural" "${outputPath}"`;

    try {
        await execAsync(cmd, { timeout: 30000 });
        // Clean up text file
        await fs.unlink(textPath).catch(() => { });
        const stat = await fs.stat(outputPath);
        return stat.size > 0;
    } catch (e) {
        console.error('[audio-gen] Failed:', e);
        await fs.unlink(textPath).catch(() => { });
        return false;
    }
}

async function renderVideoWithRemotion(
    videoData: VideoData
): Promise<string | null> {
    const timestamp = Date.now();
    const outputPath = path.join(
        process.cwd(),
        'public',
        'generated',
        `video-${timestamp}.mp4`
    );
    const compositionId = 'EduVideo';

    try {
        const genDir = path.dirname(outputPath);
        await fs.mkdir(genDir, { recursive: true }).catch(() => { });

        // 1. Generate audio for each scene
        console.log('[generate-video] Generating scene audio...');
        const scenesWithAudio: VideoScene[] = [];

        for (let i = 0; i < videoData.scenes.length; i++) {
            const scene = videoData.scenes[i];
            const audioFilename = `narration-${timestamp}-${i}.mp3`;
            const audioPath = path.join(genDir, audioFilename);

            const success = await generateSceneAudio(scene.narration, audioPath);

            if (success) {
                console.log(`[generate-video] Audio scene ${i + 1} OK`);
                scenesWithAudio.push({
                    ...scene,
                    audioUrl: `/generated/${audioFilename}`,
                });
            } else {
                console.warn(`[generate-video] Audio scene ${i + 1} FAILED`);
                scenesWithAudio.push({ ...scene, audioUrl: null });
            }
        }

        // 2. Write props file
        const propsData = {
            title: videoData.title,
            targetAudience: videoData.targetAudience,
            scenes: scenesWithAudio,
        };

        console.log('[generate-video] Props data:', JSON.stringify(propsData, null, 2).slice(0, 500));

        const propsPath = path.join(genDir, `props-${timestamp}.json`);
        await fs.writeFile(propsPath, JSON.stringify(propsData, null, 2));

        // 3. Render with Remotion CLI
        console.log('[generate-video] Running Remotion render...');
        const renderCmd = `npx remotion render remotion/Root.tsx ${compositionId} "${outputPath}" --props="${propsPath}" --gl=angle`;

        const { stdout, stderr } = await execAsync(renderCmd, {
            timeout: 300000,
        });
        console.log('[generate-video] Remotion stdout:', stdout);
        if (stderr) console.warn('[generate-video] Remotion stderr:', stderr);

        // 4. Clean up props file
        await fs.unlink(propsPath).catch(() => { });

        return `/generated/video-${timestamp}.mp4`;
    } catch (error) {
        console.error('Remotion rendering error:', error);
        throw error;
    }
}

// ── Gemini Model Fallback Chain ───────────────────────────────────────────

const GEMINI_MODELS = [
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
];

async function generateVideoWithGemini(
    lessonData: any
): Promise<VideoResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    // Extract lesson information
    const title = lessonData.lessonPlan?.title || 'Educational Concept';
    const subject = lessonData.lessonPlan?.subject || 'Learning';
    const objectives = lessonData.lessonPlan?.objectives || [];
    const content = lessonData.lessonPlan?.content || {};
    const gradeLevel = lessonData.lessonPlan?.gradeLevel || 'General';

    console.log(`[generate-video] Lesson title: "${title}", subject: "${subject}", grade: "${gradeLevel}"`);

    const prompt = `You are Edison, an expert at creating educational videos.

LESSON INFORMATION (YOU MUST USE THIS CONTENT — DO NOT INVENT A DIFFERENT TOPIC):
Title: ${title}
Subject: ${subject}
Grade Level: ${gradeLevel}
Learning Objectives: ${objectives.join(', ')}
Introduction: ${content.introduction || ''}
Main Content: ${content.procedure || ''}
Closure: ${content.closure || ''}

TASK: Generate exactly 3 scenes for an animated video about "${title}" for ${gradeLevel} students.

CRITICAL: The video MUST be about "${title}". Do NOT change the topic.

FOR EACH SCENE, provide:
1. "narration" — 60-80 words of spoken narration (this gets converted to speech audio). Full sentences, educational, engaging.
2. "animationType" — one of: "process", "transformation", "cycle", "comparison", "list"
   - "process": shows a step-by-step flow (A -> B -> C). Good for showing how something works.
   - "transformation": shows inputs becoming outputs (ingredients -> result). Good for reactions, conversions.
   - "cycle": shows a circular loop of steps. Good for cycles (water cycle, life cycle).
   - "comparison": shows two sides. Good for comparing/contrasting.
   - "list": shows items appearing one by one. Good for facts, features, characteristics.
3. "elements" — an array of 4-6 SHORT labels (1-3 words each) that represent the key visual elements to animate.
   For "process": elements flow left to right with arrows
   For "transformation": first half are inputs, second half are outputs
   For "cycle": elements form a circle
   For "comparison": elements split into two groups
   For "list": elements appear one by one

EXAMPLES:
- Topic "Photosynthesis", animationType "transformation", elements: ["Sunlight", "Water", "CO2", "Glucose", "Oxygen"]
- Topic "Water Cycle", animationType "cycle", elements: ["Evaporation", "Condensation", "Precipitation", "Collection"]
- Topic "Fractions", animationType "process", elements: ["Whole Pizza", "Cut in Half", "1/2 Each", "Equal Parts"]

Return JSON:
{
  "title": "${title}",
  "targetAudience": "${gradeLevel}",
  "scenes": [
    {
      "narration": "string (60-80 words)",
      "animationType": "process|transformation|cycle|comparison|list",
      "elements": ["string", "string", "string", "string"]
    }
  ],
  "keyTakeaways": ["string", "string", "string"]
}

IMPORTANT: Return ONLY valid JSON. No markdown fences. The title MUST be "${title}".
NARRATION RULES: The narration will be read by text-to-speech. Use ONLY plain English. NO special characters, NO backslashes, NO markdown formatting, NO emojis. Write naturally as if speaking to a student. Use subscript names spelled out (e.g. say "C O 2" not "CO₂").`;

    for (const model of GEMINI_MODELS) {
        try {
            console.log(`[generate-video] Trying model: ${model}`);
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.7,
                            responseMimeType: 'application/json',
                        },
                    }),
                }
            );

            if (response.status === 429) {
                console.warn(
                    `[generate-video] Rate limited on ${model}, trying next...`
                );
                continue;
            }

            if (!response.ok) {
                console.error(
                    `[generate-video] Gemini API error (${model}):`,
                    response.status,
                    await response.text()
                );
                continue;
            }

            const result = await response.json();
            const responseContent =
                result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!responseContent) {
                console.warn(
                    `[generate-video] No content from ${model}, trying next...`
                );
                continue;
            }

            const cleaned = responseContent
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            const videoData = JSON.parse(cleaned);

            console.log(`[generate-video] AI returned title: "${videoData.title}", scenes: ${videoData.scenes?.length}`);

            // Generate video with Remotion (includes audio generation)
            let videoUrl = null;
            try {
                videoUrl = await renderVideoWithRemotion(videoData);
            } catch (renderError) {
                console.error('Video rendering failed:', renderError);
            }

            console.log(
                `[generate-video] Successfully generated with ${model}`
            );
            return {
                ...videoData,
                videoUrl,
                thumbnailUrl: null,
                generatedAt: new Date().toISOString(),
                agent: 'Edison (Remotion + Edge TTS)',
            };
        } catch (error) {
            console.error(
                `[generate-video] Error with model ${model}:`,
                error
            );
            continue;
        }
    }

    throw new Error(
        'All Gemini models failed. You may have exceeded your API quota. Please try again later.'
    );
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

        const videoData = await generateVideoWithGemini(lessonData);

        return NextResponse.json({
            success: true,
            ...videoData,
        });
    } catch (error: any) {
        console.error('Error in video generation:', error);
        return NextResponse.json(
            {
                error:
                    error.message ||
                    'Failed to generate educational video',
            },
            { status: 500 }
        );
    }
}
