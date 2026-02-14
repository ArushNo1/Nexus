import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@/lib/supabase/server';
import { uploadToStorage, uploadMultipleToStorage } from '@/lib/supabase/storage';

const execAsync = promisify(exec);

// ── TypeScript Interfaces ──────────────────────────────────────────────────

interface VideoScene {
    narration: string;
    animationType: string;
    elements: string[];
    audioUrl?: string | null;
    spriteUrls?: Record<string, string | null>;
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

async function fetchSpritesForElements(
    elements: string[],
    timestamp: number
): Promise<Record<string, string | null>> {
    const scriptPath = path.join(
        process.cwd(),
        'python_scripts',
        'fetch_sprites.py'
    );
    const spriteDir = path.join(
        process.cwd(),
        'public',
        'generated',
        'sprites'
    );

    try {
        // Ensure sprite directory exists
        await fs.mkdir(spriteDir, { recursive: true });

        // Call Python script in batch mode
        const elementsJson = JSON.stringify(elements);
        const cmd = `python3 "${scriptPath}" --batch '${elementsJson}' "${spriteDir}"`;

        console.log('[sprite-fetch] Fetching sprites for:', elements.join(', '));

        const { stdout } = await execAsync(cmd, { timeout: 60000 });
        const result = JSON.parse(stdout);

        if (result.success) {
            // Convert absolute paths to relative URLs
            const spriteUrls: Record<string, string | null> = {};
            for (const [element, absPath] of Object.entries(result.sprites)) {
                if (absPath && typeof absPath === 'string') {
                    // Convert /path/to/public/generated/sprites/foo.png → /generated/sprites/foo.png
                    const relativePath = absPath.replace(
                        path.join(process.cwd(), 'public'),
                        ''
                    );
                    spriteUrls[element] = relativePath;
                } else {
                    spriteUrls[element] = null;
                }
            }
            console.log('[sprite-fetch] Success! Fetched', Object.keys(spriteUrls).length, 'sprites');
            return spriteUrls;
        } else {
            console.warn('[sprite-fetch] Failed:', result.error);
            return {};
        }
    } catch (e) {
        console.error('[sprite-fetch] Error:', e);
        return {};
    }
}

async function renderVideoWithRemotion(
    videoData: VideoData,
    userId: string
): Promise<{ videoUrl: string | null; audioFiles: string[]; spriteFiles: string[] }> {
    const timestamp = Date.now();
    const tempDir = path.join(process.cwd(), 'temp', `video-${timestamp}`);
    const outputPath = path.join(tempDir, `video-${timestamp}.mp4`);
    const compositionId = 'EduVideo';

    try {
        await fs.mkdir(tempDir, { recursive: true });

        // 1. Fetch sprites for all elements across all scenes
        console.log('[generate-video] Fetching sprites...');
        const allElements = new Set<string>();
        videoData.scenes.forEach(scene => {
            scene.elements?.forEach(el => allElements.add(el));
        });
        const spriteDir = path.join(tempDir, 'sprites');
        await fs.mkdir(spriteDir, { recursive: true });
        const spriteUrls = await fetchSpritesForElements(Array.from(allElements), timestamp);

        // 2. Generate audio for each scene
        console.log('[generate-video] Generating scene audio...');
        const scenesWithAudio: VideoScene[] = [];
        const audioFilePaths: string[] = [];

        for (let i = 0; i < videoData.scenes.length; i++) {
            const scene = videoData.scenes[i];
            const audioFilename = `narration-${timestamp}-${i}.mp3`;
            const audioPath = path.join(tempDir, audioFilename);

            const success = await generateSceneAudio(scene.narration, audioPath);

            if (success) {
                console.log(`[generate-video] Audio scene ${i + 1} OK`);
                audioFilePaths.push(audioPath);

                // Upload audio to Supabase
                const { url } = await uploadToStorage('audio', audioPath, userId, audioFilename);

                scenesWithAudio.push({
                    ...scene,
                    audioUrl: url || null,
                    spriteUrls,
                });
            } else {
                console.warn(`[generate-video] Audio scene ${i + 1} FAILED`);
                scenesWithAudio.push({ ...scene, audioUrl: null, spriteUrls });
            }
        }

        // 3. Upload sprites to Supabase
        console.log('[generate-video] Uploading sprites to Supabase...');
        const spriteFilePaths: string[] = [];
        const spriteUrlsSupabase: Record<string, string | null> = {};

        for (const [element, localPath] of Object.entries(spriteUrls)) {
            if (localPath && localPath.startsWith('/')) {
                const fullPath = path.join(process.cwd(), 'public', localPath);
                if (await fs.access(fullPath).then(() => true).catch(() => false)) {
                    const spriteName = path.basename(localPath);
                    const { url } = await uploadToStorage('sprites', fullPath, 'shared', spriteName);
                    spriteUrlsSupabase[element] = url;
                    spriteFilePaths.push(fullPath);
                }
            }
        }

        // Update scenes with Supabase sprite URLs
        const scenesWithSupabaseAssets = scenesWithAudio.map(scene => ({
            ...scene,
            spriteUrls: spriteUrlsSupabase,
        }));

        // 4. Write props file
        const propsData = {
            title: videoData.title,
            targetAudience: videoData.targetAudience,
            scenes: scenesWithSupabaseAssets,
        };

        console.log('[generate-video] Props data:', JSON.stringify(propsData, null, 2).slice(0, 500));

        const propsPath = path.join(tempDir, `props-${timestamp}.json`);
        await fs.writeFile(propsPath, JSON.stringify(propsData, null, 2));

        // 5. Render with Remotion CLI
        console.log('[generate-video] Running Remotion render...');
        const renderCmd = `npx remotion render remotion/Root.tsx ${compositionId} "${outputPath}" --props="${propsPath}" --gl=angle`;

        const { stdout, stderr } = await execAsync(renderCmd, {
            timeout: 300000,
        });
        console.log('[generate-video] Remotion stdout:', stdout);
        if (stderr) console.warn('[generate-video] Remotion stderr:', stderr);

        // 6. Upload video to Supabase
        console.log('[generate-video] Uploading video to Supabase...');
        const videoFilename = `video-${timestamp}.mp4`;
        const { url: videoUrl } = await uploadToStorage('videos', outputPath, userId, videoFilename);

        // 7. Clean up temp files
        await fs.rm(tempDir, { recursive: true, force: true }).catch(err => {
            console.warn('[generate-video] Cleanup failed:', err);
        });

        return {
            videoUrl,
            audioFiles: scenesWithSupabaseAssets.map(s => s.audioUrl).filter(Boolean) as string[],
            spriteFiles: Object.values(spriteUrlsSupabase).filter(Boolean) as string[],
        };
    } catch (error) {
        console.error('Remotion rendering error:', error);
        // Clean up on error
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
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
    lessonData: any,
    userId: string
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

    const prompt = `You are Edison, an elite educational video creator who makes STUNNING, VISUALLY CAPTIVATING educational content.

LESSON INFORMATION (YOU MUST USE THIS CONTENT — DO NOT INVENT A DIFFERENT TOPIC):
Title: ${title}
Subject: ${subject}
Grade Level: ${gradeLevel}
Learning Objectives: ${objectives.join(', ')}
Introduction: ${content.introduction || ''}
Main Content: ${content.procedure || ''}
Closure: ${content.closure || ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 YOUR MISSION: Create a PREMIUM educational video about "${title}" for ${gradeLevel} students
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL RULES FOR EXCELLENCE:
✓ Videos are our PRIMARY SELLING POINT - they must look PROFESSIONAL and ENGAGING
✓ Narration does the heavy lifting - make it rich, detailed, and educational (90-120 words per scene)
✓ Visual elements should be MINIMAL TEXT - just 1-3 word labels that represent concepts
✓ Each element will become a HIGH-QUALITY SPRITE (icon/illustration) - choose visually distinct, searchable terms
✓ Think like a top-tier educational content creator (Kurzgesagt, TED-Ed, Khan Academy)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 ANIMATION TYPES - Choose the BEST fit for each concept:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 "process" - Step-by-step flow (A → B → C → D)
   ↳ Perfect for: How things work, sequences, procedures, timelines
   ↳ Elements flow left-to-right or top-to-bottom with arrows
   ↳ Example: "Digestion" → ["Mouth", "Stomach", "Intestines", "Nutrients"]

⚡ "transformation" - Inputs become Outputs (ingredients → result)
   ↳ Perfect for: Chemical reactions, conversions, before/after, cause/effect
   ↳ First half = inputs, second half = outputs, transformation in middle
   ↳ Example: "Photosynthesis" → ["Sunlight", "Water", "CO2", "Glucose", "Oxygen"]

🔁 "cycle" - Circular loop of connected steps
   ↳ Perfect for: Cycles, repeating processes, feedback loops
   ↳ Elements arranged in a circle with continuous flow
   ↳ Example: "Water Cycle" → ["Evaporation", "Condensation", "Precipitation", "Collection"]

⚖️ "comparison" - Side-by-side contrast (A vs B)
   ↳ Perfect for: Compare/contrast, pros/cons, two perspectives
   ↳ Elements split into two groups (left vs right)
   ↳ Example: "Vertebrates vs Invertebrates" → ["Backbone", "Skeleton", "Spine"] vs ["Exoskeleton", "Shell", "Soft Body"]

📋 "list" - Sequential items appearing one by one
   ↳ Perfect for: Facts, features, characteristics, tips, properties
   ↳ Numbered items with smooth reveal animations
   ↳ Example: "Layers of Earth" → ["Crust", "Mantle", "Outer Core", "Inner Core"]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✍️ NARRATION MASTERY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Write 90-120 words per scene (MORE content = better learning)
✓ Be conversational, engaging, and enthusiastic
✓ Explain concepts clearly without relying on visual text
✓ Use storytelling techniques: questions, examples, real-world connections
✓ NO special characters, backslashes, markdown, or emojis
✓ Spell out chemical formulas: "C O 2" not "CO₂", "H 2 O" not "H₂O"
✓ Write as if speaking to an eager student - be inspiring!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 ELEMENT SELECTION (SPRITES):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Choose 4-6 elements per scene (optimal for visual clarity)
✓ Each element = 1-3 words maximum (these become sprite searches)
✓ Use concrete, visually searchable terms: "Sun", "Atom", "Tree", "Brain"
✓ Avoid abstract text or full sentences - think ICONS and ILLUSTRATIONS
✓ Elements should represent KEY CONCEPTS that support the narration
✓ Consider: What would make a great icon/sprite for this concept?

GOOD Elements:
✓ "Sun", "Plant", "Oxygen" (photosynthesis)
✓ "Rain", "Cloud", "Ocean" (water cycle)
✓ "Cell", "DNA", "Nucleus" (biology)
✓ "Addition", "Fraction", "Division" (math)

BAD Elements (too wordy):
✗ "The process of photosynthesis"
✗ "When it rains the water falls"
✗ "Cells contain genetic material"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate EXACTLY 3 scenes that together teach "${title}" comprehensively.

Return JSON (NO markdown fences, ONLY JSON):
{
  "title": "${title}",
  "targetAudience": "${gradeLevel}",
  "scenes": [
    {
      "narration": "string (90-120 words, engaging, educational, conversational)",
      "animationType": "process|transformation|cycle|comparison|list",
      "elements": ["1-3 word sprite term", "another term", "etc"]
    }
  ],
  "keyTakeaways": ["concise takeaway 1", "concise takeaway 2", "concise takeaway 3"]
}

Remember: This video is our SHOWCASE - make it EXCEPTIONAL! 🌟`;

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

            // Generate video with Remotion (includes audio generation and Supabase upload)
            let videoUrl = null;
            try {
                const result = await renderVideoWithRemotion(videoData, userId);
                videoUrl = result.videoUrl;
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
                agent: 'Edison (Remotion + Edge TTS + Supabase)',
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
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please sign in.' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { lessonData } = body;

        if (!lessonData) {
            return NextResponse.json(
                { error: 'Lesson data is required' },
                { status: 400 }
            );
        }

        // 1. Save lesson to database
        console.log('[generate-video] Saving lesson to database...');
        const { data: savedLesson, error: lessonError } = await supabase
            .from('lessons')
            .insert({
                user_id: user.id,
                title: lessonData.lessonPlan?.title || 'Untitled Lesson',
                subject: lessonData.lessonPlan?.subject,
                grade_level: lessonData.lessonPlan?.gradeLevel,
                objectives: lessonData.lessonPlan?.objectives || [],
                content: lessonData.lessonPlan?.content || {},
            })
            .select()
            .single();

        if (lessonError) {
            console.error('[generate-video] Failed to save lesson:', lessonError);
            throw new Error('Failed to save lesson to database');
        }

        console.log('[generate-video] Lesson saved:', savedLesson.id);

        // 2. Generate video
        const videoData = await generateVideoWithGemini(lessonData, user.id);

        // 3. Save video to database
        console.log('[generate-video] Saving video to database...');
        const { data: savedVideo, error: videoError } = await supabase
            .from('videos')
            .insert({
                lesson_id: savedLesson.id,
                user_id: user.id,
                title: videoData.title,
                target_audience: videoData.targetAudience,
                scenes: videoData.scenes,
                key_takeaways: videoData.keyTakeaways || [],
                video_url: videoData.videoUrl,
                thumbnail_url: videoData.thumbnailUrl,
                status: videoData.videoUrl ? 'completed' : 'failed',
                error_message: videoData.videoUrl ? null : 'Video rendering failed',
            })
            .select()
            .single();

        if (videoError) {
            console.error('[generate-video] Failed to save video:', videoError);
            throw new Error('Failed to save video to database');
        }

        console.log('[generate-video] Video saved:', savedVideo.id);

        return NextResponse.json({
            success: true,
            lessonId: savedLesson.id,
            videoId: savedVideo.id,
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
