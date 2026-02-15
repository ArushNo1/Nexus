import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { uploadToStorage, uploadMultipleToStorage } from '@/lib/supabase/storage';
import OpenAI from 'openai';

const execAsync = promisify(exec);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── TypeScript Interfaces ──────────────────────────────────────────────────

interface Beat {
    startSec: number;
    durationSec: number;
    layout: 'process' | 'transformation' | 'cycle' | 'comparison' | 'list' | 'focus' | 'split' | 'equation' | 'graph' | 'diagram';
    heading?: string;
    elements: string[];
    highlight?: string;
    text?: string;
    subtitle?: string;
}

interface VideoScene {
    narration: string;
    beats: Beat[];
    audioUrl?: string | null;
    spriteUrls?: Record<string, string | null>;
    backgroundImageUrl?: string | null;
    bgImagePrompt?: string;
}

interface VideoPalette {
    primary: string;
    secondary: string;
    tertiary: string;
    bg: string;
    surface: string;
}

interface VideoData {
    title: string;
    targetAudience: string;
    scenes: VideoScene[];
    keyTakeaways: string[];
    palette?: VideoPalette;
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

async function fetchBackgroundImage(
    prompt: string,
    outputPath: string
): Promise<boolean> {
    try {
        console.log('[bg-image] Generating via DALL-E:', prompt.slice(0, 100));

        const result = await openai.images.generate({
            model: 'dall-e-3',
            prompt,
            n: 1,
            size: '1792x1024',
            response_format: 'url',
        });

        const dalleUrl = result.data[0]?.url;
        if (!dalleUrl) {
            console.warn('[bg-image] No URL returned from DALL-E');
            return false;
        }

        const response = await fetch(dalleUrl, { signal: AbortSignal.timeout(30000) });
        if (!response.ok) {
            console.warn('[bg-image] Failed to download DALL-E image:', response.status);
            return false;
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.writeFile(outputPath, buffer);
        console.log('[bg-image] Saved:', outputPath, `(${Math.round(buffer.length / 1024)}KB)`);
        return true;
    } catch (e) {
        console.error('[bg-image] Failed:', e);
        return false;
    }
}

async function renderVideoWithRemotion(
    videoData: VideoData,
    userId: string,
    supabase: SupabaseClient
): Promise<{ videoUrl: string | null; audioFiles: string[]; spriteFiles: string[] }> {
    const timestamp = Date.now();
    const tempDir = path.join(process.cwd(), 'temp', `video-${timestamp}`);
    const outputPath = path.join(tempDir, `video-${timestamp}.mp4`);
    const compositionId = 'EduVideo';

    try {
        await fs.mkdir(tempDir, { recursive: true });

        // 1. Fetch sprites for all elements across all beats in all scenes
        console.log('[generate-video] Fetching sprites...');
        const allElements = new Set<string>();
        videoData.scenes.forEach(scene => {
            scene.beats?.forEach(beat => {
                beat.elements?.forEach(el => allElements.add(el));
            });
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
                const { url } = await uploadToStorage('audio', audioPath, userId, audioFilename, supabase);

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
                    const { url } = await uploadToStorage('sprites', fullPath, 'shared', spriteName, supabase);
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

        // 3.5. Fetch background images for each scene (in parallel)
        console.log('[generate-video] Fetching background images...');
        const bgImageDir = path.join(tempDir, 'bg-images');
        await fs.mkdir(bgImageDir, { recursive: true });

        const bgImagePromises = scenesWithSupabaseAssets.map(async (scene, i) => {
            const prompt = (scene as any).bgImagePrompt
                || `simple flat cartoonish illustration of ${scene.narration.split('.')[0].slice(0, 80)}, minimalist, bold colors, dark background`;
            const bgImagePath = path.join(bgImageDir, `bg-${timestamp}-${i}.jpg`);
            const success = await fetchBackgroundImage(prompt, bgImagePath);

            if (success) {
                const bgFilename = `bg-${timestamp}-${i}.jpg`;
                const { url } = await uploadToStorage('bg-images', bgImagePath, userId, bgFilename, supabase);
                return url || null;
            }
            return null;
        });

        const bgImageUrls = await Promise.all(bgImagePromises);
        console.log('[generate-video] Background images fetched:', bgImageUrls.filter(Boolean).length, '/', scenesWithSupabaseAssets.length);

        // Attach background image URLs to scenes
        bgImageUrls.forEach((url, i) => {
            if (url) {
                (scenesWithSupabaseAssets[i] as any).backgroundImageUrl = url;
            }
        });

        // 4. Write props file
        const propsData = {
            title: videoData.title,
            targetAudience: videoData.targetAudience,
            scenes: scenesWithSupabaseAssets,
            palette: videoData.palette,
            totalDurationSec: videoData._totalDurationSec,
        };

        console.log('[generate-video] Props data:', JSON.stringify(propsData, null, 2).slice(0, 500));

        const propsPath = path.join(tempDir, `props-${timestamp}.json`);
        await fs.writeFile(propsPath, JSON.stringify(propsData, null, 2));

        // 5. Render with Remotion CLI
        console.log('[generate-video] Running Remotion render...');
        // Calculate total frames for dynamic duration
        const totalDurationSec = videoData._totalDurationSec || (videoData.scenes.length * 28 + 6);
        const totalFrames = Math.ceil(totalDurationSec * 30); // 30fps
        const renderCmd = `npx remotion render remotion/Root.tsx ${compositionId} "${outputPath}" --props="${propsPath}" --gl=angle --frames=0-${totalFrames - 1}`;

        const { stdout, stderr } = await execAsync(renderCmd, {
            timeout: 300000,
        });
        console.log('[generate-video] Remotion stdout:', stdout);
        if (stderr) console.warn('[generate-video] Remotion stderr:', stderr);

        // 6. Upload video to Supabase
        console.log('[generate-video] Uploading video to Supabase...');
        const videoFilename = `video-${timestamp}.mp4`;
        const { url: videoUrl, error: uploadError } = await uploadToStorage('videos', outputPath, userId, videoFilename, supabase);
        if (uploadError) {
            console.error('[generate-video] Video upload failed:', uploadError);
        } else {
            console.log('[generate-video] Video uploaded successfully:', videoUrl);
        }

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
    userId: string,
    supabase: SupabaseClient,
    gameDesignDoc?: string | null
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

    const prompt = `You are Edison, an elite educational video director. You write SCREENPLAYS — precise, timestamped storyboards that synchronize visuals with narration beat by beat.

LESSON INFORMATION (use this content exactly — do not invent a different topic):
Title: ${title}
Subject: ${subject}
Grade Level: ${gradeLevel}
Learning Objectives: ${objectives.join(', ')}
Introduction: ${content.introduction || ''}
Main Content: ${content.procedure || ''}
Closure: ${content.closure || ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREENPLAY STRUCTURE — Each scene has a narration + a sequence of timed BEATS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A BEAT is a visual moment: it shows specific icons/elements on screen for a set duration.
When a beat starts, the visuals CHANGE to match what is being said at that exact second.
Think of it like a slide in a presentation — but timed to the voice.

Generate 2-5 scenes depending on the complexity of the topic:
  - Simple topics (a single concept, e.g. "What is gravity?"): 2 scenes
  - Medium topics (a process or moderate idea): 3 scenes
  - Complex topics (multiple related concepts, e.g. "The American Revolution"): 4-5 scenes

Each scene should have 60-100 words of narration. The narration word count drives the scene duration:
  words / 2.8 = scene duration in seconds (Edge TTS speaks at ~2.8 words/sec)

Each scene must have 2-4 beats. Beat timing rules:
  - First beat must start at startSec: 0
  - Each beat's startSec = previous beat's startSec + previous beat's durationSec
  - Beats are timed proportionally within the scene duration
  - Minimum beat duration: 5 seconds

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYOUT TYPES — pick the one that best fits WHAT IS BEING SAID at that beat:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"focus"          — 1-3 key concepts shown large and centered. Use when introducing the main idea or a key term.
                   Example: "Photosynthesis is how plants make food" → elements: ["Plant", "Sun", "Food"]

"process"        — A → B → C sequential flow with arrows. Use when explaining ordered steps. MAX 4 elements for horizontal, 5 for vertical.
                   Example: "first mix, then heat, then cool" → elements: ["Mix", "Heat", "Cool"]

"transformation" — Left side (inputs) ⟹ Right side (outputs). Use for reactions, conversions, cause and effect.
                   Example: "water and CO2 become glucose and oxygen" → elements: ["Water", "CO2", "Glucose", "Oxygen"]

"cycle"          — Elements arranged in a circle with arrows. Use for repeating processes, feedback loops.
                   Example: "evaporates, condenses, precipitates, collects" → elements: ["Evaporation", "Condensation", "Precipitation", "Collection"]

"comparison"     — Side A vs Side B divided layout. Use when contrasting two things.
                   Example: "acids vs bases" → elements: ["Sour taste", "pH below 7", "Bitter taste", "pH above 7"]

"list"           — Numbered items revealed one by one. Use for enumerating facts, properties, or rules.
                   Example: "three laws of motion" → elements: ["Inertia", "F = ma", "Action-Reaction"]

"split"          — Two equal columns side by side. Use for parallel concepts.
                   Example: "potential vs kinetic energy" → elements: ["Height", "Stored", "Motion", "Speed"]

"equation"       — ★ MATH/SCIENCE STAR LAYOUT. Large animated equation centered on screen with term cards below.
                   SET "text" to the equation string. Use ^ for superscripts and _ for subscripts.
                   For multi-char sub/superscripts use braces: x^{2n}, a_{ij}
                   You can also use: √, π, ÷, ×, ≤, ≥, ≠, →, ∞
                   NEVER use Unicode subscript/superscript characters (₂, ², ₃, ³, etc.)
                   SET "subtitle" to explain what the equation means in plain English.
                   Elements are the key terms/variables visualized as small cards below the equation.

                   USE FOR: formulas, theorems, definitions, identities, laws
                   Example: Pythagorean theorem →
                     text: "a^2 + b^2 = c^2"
                     subtitle: "The sum of squares of the two shorter sides equals the square of the hypotenuse"
                     elements: ["Triangle", "Right Angle", "Hypotenuse"]

                   Example: Quadratic formula →
                     text: "x = (-b ± √(b^2 - 4ac)) ÷ 2a"
                     subtitle: "Finds the roots of any quadratic equation ax^2 + bx + c = 0"
                     elements: ["Parabola", "Root", "Coefficient"]

                   Example: Newton's second law →
                     text: "F = m × a"
                     subtitle: "Force equals mass times acceleration"
                     elements: ["Force", "Mass", "Acceleration"]

                   Example: Chemical formula →
                     text: "H_2O → H_2 + O_2"
                     subtitle: "Water breaks down into hydrogen and oxygen"
                     elements: ["Water", "Hydrogen", "Oxygen"]

"graph"          — ★ DATA VISUALIZATION. Animated bar chart with axes, grid, and labeled bars.
                   SET "text" to the chart title or equation being visualized.
                   SET "subtitle" to explain what the graph shows.
                   Elements become labeled bars — each element is a category/data point.

                   USE FOR: comparing quantities, showing data, visualizing functions, distributions
                   Example: Comparing planet sizes →
                     text: "Relative Planet Sizes"
                     subtitle: "Diameter compared to Earth"
                     elements: ["Mercury", "Venus", "Earth", "Mars", "Jupiter"]

                   Example: Population growth →
                     text: "Population Over Decades"
                     elements: ["1980", "1990", "2000", "2010", "2020"]

"diagram"        — ★ GEOMETRIC/STRUCTURAL. Draws animated shapes with labeled vertices/sides connected by lines.
                   SET "text" to the theorem or property being shown.
                   SET "subtitle" to explain the visual.
                   Elements become labeled points/vertices of the geometric figure.

                   USE FOR: geometry, molecular structures, network graphs, proofs, spatial relationships
                   Example: Triangle angles →
                     text: "Interior angles sum to 180°"
                     subtitle: "∠A + ∠B + ∠C = 180°"
                     elements: ["Angle A", "Angle B", "Angle C"]

                   Example: Water molecule →
                     text: "H_2O Molecular Structure"
                     elements: ["Hydrogen", "Oxygen", "Hydrogen"]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUBJECT-AWARE VISUAL STRATEGY — Match layouts to the subject:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MATH/ALGEBRA/CALCULUS:
  - MUST use "equation" layout for every formula, theorem, or identity
  - Use "graph" to visualize functions, data, or comparisons
  - Use "diagram" for geometric proofs and shapes
  - Use "process" for step-by-step problem solving
  - The "text" field is CRITICAL for math — it shows the actual equation on screen
  - Example flow: equation → process (steps to solve) → graph (visual result)

SCIENCE (Physics, Chemistry, Biology):
  - Use "equation" for laws and formulas (F=ma, E=mc^2, PV=nRT)
  - Use "transformation" for chemical reactions and energy conversions
  - Use "diagram" for molecular structures and anatomical features
  - Use "cycle" for biological cycles (water cycle, cell cycle)
  - Use "graph" for experimental data and measurements

HISTORY/SOCIAL STUDIES:
  - Use "process" for timelines and cause-effect chains
  - Use "comparison" for contrasting civilizations, policies, or eras
  - Use "list" for key events, dates, or principles
  - Use "focus" for introducing key figures or concepts
  - AVOID equation/graph/diagram — these are not visual fits for humanities

LANGUAGE ARTS/LITERATURE:
  - Use "focus" for themes, characters, and key quotes
  - Use "comparison" for comparing characters or themes
  - Use "list" for literary devices, plot points, or vocabulary
  - Use "split" for parallel plotlines or before/after analysis
  - AVOID equation/graph/diagram unless analyzing data

GEOGRAPHY/EARTH SCIENCE:
  - Use "diagram" for tectonic plates, rock layers, weather systems
  - Use "cycle" for water cycle, rock cycle, carbon cycle
  - Use "graph" for climate data, elevation, population
  - Use "process" for erosion, formation processes

The layouts you choose MUST match the subject matter. A math video without "equation" layouts looks terrible. A history video with "equation" layouts makes no sense.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HEADING RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Headings should describe WHAT IS HAPPENING visually, not generic labels
  GOOD: "Sunlight Meets Leaf", "Sugar is Born", "Energy Released"
  BAD: "Leaf Diagram", "Step 1", "Key Concepts", "The Process"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NARRATION RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ 60-100 words per scene. The word count determines scene duration (words / 2.8 = seconds)
✓ Conversational, enthusiastic, age-appropriate for ${gradeLevel}
✓ NO special characters, markdown, backslashes, or emojis
✓ In element labels, spell out formulas: "Carbon Dioxide" not "CO_2", "Water" not "H_2O"
✓ In equation "text" fields, use ^ for superscripts and _ for subscripts (NEVER Unicode like ₂ ² ₃ ³)
✓ Each sentence you write maps to a beat — plan beats to match what you say

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ELEMENT (SPRITE) RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ 2-5 elements per beat (icons that illustrate what's being said RIGHT NOW)
✓ 1-3 words each — concrete, searchable icon terms: "Sun", "Brain", "DNA", "River"
✓ Elements MUST match what the narration says at that beat's time window
✓ The heading (2-5 words) summarizes the beat's visual moment
✓ Optional: set "highlight" to one element name to make it glow/pulse (the star of that beat)

✓ Use SINGLE concrete nouns that map to real icons: "Sun", "Leaf", "Heart", "Brain", "Globe", "Lightning", "Atom", "Book", "Microscope", "Gear", "Shield", "Star", "Cloud", "Fire", "Mountain", "Wave", "Tree", "Fish", "Bird", "Clock"
✗ NEVER use multi-word concepts as elements: "Carbon Dioxide" → use "CO2"; "Water Molecule" → use "Water"; "Solar Energy" → use "Sun"; "Leaf Diagram" → use "Leaf"
✗ NEVER use abbreviations the icon API won't find: use "Thermometer" not "Temp", use "Lightning" not "Elec"

GOOD elements: "Nucleus", "Electron", "Volcano", "Heart", "Calculator", "Rocket"
BAD elements: "The process of", "When students", "Key takeaway is" (too long or abstract)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COLOR PALETTE — Match the visual mood to the subject matter:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Choose hex colors that emotionally and conceptually fit "${subject}":
- Biology/Nature: greens (#22c55e), earthy tones (#a16207), soft blues (#38bdf8)
- Chemistry/Physics: electric blues (#3b82f6), purples (#a855f7), cyan (#06b6d4)
- History/Social Studies: warm ambers (#f59e0b), reds (#ef4444), muted golds (#ca8a04)
- Math/Logic: cool teals (#14b8a6), indigos (#6366f1), crisp whites
- Geography/Earth: deep blues (#1d4ed8), greens (#16a34a), earthy browns (#92400e)
- Literature/Language: purples (#9333ea), pinks (#ec4899), warm creams
- Technology/Engineering: electric blues (#2563eb), oranges (#f97316), silvers

Rules:
- "bg" must be VERY dark (lightness < 15%) — e.g. "#0a1a12", "#0f0a1e", "#1a0f05"
- "surface" must be dark (lightness 15-25%) — e.g. "#132010", "#1a1040", "#241508"
- "primary", "secondary", "tertiary" must have HIGH contrast on dark backgrounds (lightness > 50%)
- Colors must be vibrant, not muddy — use saturated hues
- All three accent colors should be visually distinct from each other

Return JSON (NO markdown fences, ONLY raw JSON):
{
  "title": "${title}",
  "targetAudience": "${gradeLevel}",
  "palette": {
    "primary": "#22c55e",
    "secondary": "#38bdf8",
    "tertiary": "#a3e635",
    "bg": "#071a0e",
    "surface": "#0f2d18"
  },
  "scenes": [
    {
      "narration": "60-100 words of narration text...",
      "bgImagePrompt": "simple flat cartoonish illustration of a right triangle with colorful sides",
      "beats": [
        {
          "startSec": 0,
          "durationSec": 12,
          "layout": "equation",
          "heading": "The Key Formula",
          "text": "a² + b² = c²",
          "subtitle": "The Pythagorean theorem relates the sides of a right triangle",
          "elements": ["Triangle", "Right Angle", "Hypotenuse"],
          "highlight": "Triangle"
        },
        {
          "startSec": 12,
          "durationSec": 10,
          "layout": "diagram",
          "heading": "Seeing It Visually",
          "text": "Right Triangle",
          "elements": ["Side a", "Side b", "Side c"],
          "highlight": "Side c"
        }
      ]
    }
  ],
  "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3"]
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BACKGROUND IMAGE PROMPT RULES (bgImagePrompt):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Each scene MUST have a "bgImagePrompt" field — a 5-12 word visual description for generating a background image.
- Start with "simple flat cartoonish illustration of" for a clean, minimalist cartoon style
- Describe what the scene is ABOUT visually, not the layout
- GOOD: "simple flat cartoonish illustration of photosynthesis in a green leaf"
- GOOD: "simple flat cartoonish illustration of ancient Roman soldiers in battle"
- BAD: "list of elements" (too abstract)
- BAD: "educational video background" (too generic)

CRITICAL: beats[0].startSec must be 0. palette.bg lightness MUST be < 15%. Generate 2-5 scenes based on topic complexity. For math/science: ALWAYS use "equation" layout when showing a formula. Set "text" and "subtitle" on equation/graph/diagram beats. For humanities: stick to focus/process/list/comparison layouts.${gameDesignDoc ? `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GAME TUTORIAL — Add ONE final scene as a brief game tutorial
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

An interactive game has been generated for this lesson. After all educational content scenes, add ONE additional scene that serves as a quick game tutorial. This scene should:
- Briefly explain what the game is and how to play it
- Mention the key controls or mechanics
- Encourage the student to try the game after watching the video
- Use "focus" or "list" layout — keep it simple and inviting
- 60-80 words of narration

Here is the game's design document for reference:
${gameDesignDoc}

IMPORTANT: This tutorial scene is the LAST scene. All educational content comes first.` : ''}`;


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

            console.log(`[generate-video] AI returned title: "${videoData.title}", scenes: ${videoData.scenes?.length}, palette: ${JSON.stringify(videoData.palette)}`);

            // Calculate scene duration from narration word count
            videoData.scenes?.forEach((scene: any, si: number) => {
                // Estimate scene duration from word count (~2.8 words/sec for Edge TTS)
                const wordCount = (scene.narration || '').split(/\s+/).filter(Boolean).length;
                const sceneDurationSec = Math.max(10, Math.ceil(wordCount / 2.8));
                scene._durationSec = sceneDurationSec; // Store for later use

                if (!Array.isArray(scene.beats) || scene.beats.length === 0) {
                    scene.beats = [{ startSec: 0, durationSec: sceneDurationSec, layout: 'list', heading: '', elements: [] }];
                }

                // Fix startSec to be sequential
                let cursor = 0;
                scene.beats.forEach((beat: any) => {
                    beat.startSec = cursor;
                    beat.durationSec = Math.max(5, Number(beat.durationSec) || 8);
                    cursor += beat.durationSec;
                });

                // Scale beats to match actual narration duration
                const total = scene.beats.reduce((s: number, b: any) => s + b.durationSec, 0);
                if (total !== sceneDurationSec) {
                    const scale = sceneDurationSec / total;
                    let sc = 0;
                    scene.beats.forEach((beat: any, bi: number) => {
                        beat.startSec = Math.round(sc);
                        beat.durationSec = bi === scene.beats.length - 1
                            ? sceneDurationSec - Math.round(sc)
                            : Math.max(5, Math.round(beat.durationSec * scale));
                        sc += beat.durationSec;
                    });
                }

                console.log(`[generate-video] Scene ${si + 1}: ${wordCount} words → ${sceneDurationSec}s, ${scene.beats.length} beats — ${scene.beats.map((b: any) => `${b.startSec}s+${b.durationSec}s(${b.layout})`).join(', ')}`);
            });

            // Calculate total video duration
            const totalDuration = videoData.scenes.reduce((sum: number, s: any) => sum + (s._durationSec || 25), 0) + 6; // +6 for intro+outro
            videoData._totalDurationSec = totalDuration;
            console.log(`[generate-video] Total video duration: ${totalDuration}s (${videoData.scenes.length} scenes)`);

            // Validate palette — ensure it has all required fields and valid hex colors
            const hexRe = /^#[0-9a-fA-F]{6}$/;
            const p = videoData.palette;
            if (!p || !hexRe.test(p.primary) || !hexRe.test(p.secondary) || !hexRe.test(p.tertiary) || !hexRe.test(p.bg) || !hexRe.test(p.surface)) {
                console.warn('[generate-video] Palette missing or malformed, using subject-based fallback');
                // Subject-based fallback palettes
                const subjectLower = (subject || '').toLowerCase();
                if (subjectLower.includes('bio') || subjectLower.includes('nature') || subjectLower.includes('environment')) {
                    videoData.palette = { primary: '#22c55e', secondary: '#38bdf8', tertiary: '#a3e635', bg: '#071a0e', surface: '#0f2d18' };
                } else if (subjectLower.includes('chem') || subjectLower.includes('phys')) {
                    videoData.palette = { primary: '#3b82f6', secondary: '#a855f7', tertiary: '#06b6d4', bg: '#07091f', surface: '#10143a' };
                } else if (subjectLower.includes('hist') || subjectLower.includes('social')) {
                    videoData.palette = { primary: '#f59e0b', secondary: '#ef4444', tertiary: '#fcd34d', bg: '#1a0e05', surface: '#2d1a08' };
                } else if (subjectLower.includes('math') || subjectLower.includes('calcul') || subjectLower.includes('algebra')) {
                    videoData.palette = { primary: '#14b8a6', secondary: '#6366f1', tertiary: '#e2e8f0', bg: '#040f12', surface: '#0a1e24' };
                } else if (subjectLower.includes('geo') || subjectLower.includes('earth')) {
                    videoData.palette = { primary: '#60a5fa', secondary: '#4ade80', tertiary: '#fbbf24', bg: '#050e1a', surface: '#0a1d30' };
                } else if (subjectLower.includes('tech') || subjectLower.includes('computer') || subjectLower.includes('engineer')) {
                    videoData.palette = { primary: '#38bdf8', secondary: '#f97316', tertiary: '#a3e635', bg: '#050d14', surface: '#0a1824' };
                } else {
                    videoData.palette = { primary: '#818cf8', secondary: '#34d399', tertiary: '#fb923c', bg: '#0a0a1a', surface: '#13132a' };
                }
            }

            // Generate video with Remotion (includes audio generation and Supabase upload)
            let videoUrl = null;
            try {
                const result = await renderVideoWithRemotion(videoData, userId, supabase);
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
        // SSR client reads cookies → verifies the logged-in user
        const authClient = await createServerClient();
        const { data: { user }, error: authError } = await authClient.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please sign in.' },
                { status: 401 }
            );
        }

        // Service role client bypasses RLS and survives after the response is sent
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SERVICE_ROLE_KEY || '',
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const body = await req.json();
        const { lessonData, lessonId: providedLessonId, gameDesignDoc } = body;

        if (!lessonData) {
            return NextResponse.json(
                { error: 'Lesson data is required' },
                { status: 400 }
            );
        }

        // 1. Use existing lesson or save a new one
        let savedLesson: { id: string } | null = null;
        if (providedLessonId) {
            console.log('[generate-video] Using existing lesson:', providedLessonId);
            savedLesson = { id: providedLessonId };
        } else {
            console.log('[generate-video] Saving lesson to database...');
            const { data: newLesson, error: lessonError } = await supabase
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
                console.warn('[generate-video] Could not save lesson to DB:', lessonError.message);
            } else {
                savedLesson = newLesson;
                console.log('[generate-video] Lesson saved:', newLesson.id);
            }
        }

        // 2. Create a "pending" video record so the UI can show progress immediately
        let videoRowId: string | null = null;
        if (savedLesson) {
            console.log('[generate-video] Creating pending video record...');
            const { data: videoRow, error: insertError } = await supabase
                .from('videos')
                .insert({
                    lesson_id: savedLesson.id,
                    user_id: user.id,
                    title: lessonData.lessonPlan?.title || 'Educational Video',
                    status: 'processing',
                    scenes: [],
                })
                .select('id')
                .single();

            if (insertError) {
                console.warn('[generate-video] Could not create pending video:', insertError.message, insertError);
            } else {
                videoRowId = videoRow.id;
                console.log('[generate-video] Pending video record created:', videoRowId);
            }
        }

        // Return immediately so the client can redirect
        // Then continue generating in the background
        const responsePayload = {
            success: true,
            lessonId: savedLesson?.id ?? null,
            videoId: videoRowId,
            status: 'processing',
        };

        // Fire-and-forget: generate video and update the DB record when done
        (async () => {
            try {
                const videoData = await generateVideoWithGemini(lessonData, user.id, supabase, gameDesignDoc);

                if (videoRowId) {
                    const { error: updateError } = await supabase
                        .from('videos')
                        .update({
                            title: videoData.title,
                            target_audience: videoData.targetAudience,
                            scenes: videoData.scenes,
                            key_takeaways: videoData.keyTakeaways || [],
                            video_url: videoData.videoUrl,
                            thumbnail_url: videoData.thumbnailUrl,
                            status: videoData.videoUrl ? 'completed' : 'failed',
                            error_message: videoData.videoUrl ? null : 'Video rendering failed',
                        })
                        .eq('id', videoRowId);

                    if (updateError) {
                        console.warn('[generate-video] Could not update video record:', updateError.message);
                    } else {
                        console.log('[generate-video] Video record updated successfully');
                    }
                }
            } catch (err: any) {
                console.error('[generate-video] Background generation failed:', err);
                if (videoRowId) {
                    await supabase
                        .from('videos')
                        .update({
                            status: 'failed',
                            error_message: err.message || 'Video generation failed',
                        })
                        .eq('id', videoRowId)
                        .catch(() => {});
                }
            }
        })();

        return NextResponse.json(responsePayload);
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
