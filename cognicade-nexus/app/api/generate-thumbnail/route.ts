import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { uploadToStorage } from '@/lib/supabase/storage';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const authClient = await createServerClient();
        const { data: { user }, error: authError } = await authClient.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { lessonId, title, subject } = await req.json();

        if (!lessonId || !title) {
            return NextResponse.json({ error: 'lessonId and title are required' }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SERVICE_ROLE_KEY || '',
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        // Build a visual prompt from the lesson title and subject
        const prompt = `simple flat cartoonish educational illustration of ${title}${subject ? `, ${subject}` : ''}, minimalist, bold colors, clean shapes, dark background, no text`;

        console.log('[generate-thumbnail] Generating image for lesson:', lessonId);

        let buffer: Buffer | null = null;
        try {
            const result = await openai.images.generate({
                model: 'dall-e-3',
                prompt,
                n: 1,
                size: '1024x1024',
                response_format: 'url',
            });

            const dalleUrl = result.data[0]?.url;
            if (dalleUrl) {
                const response = await fetch(dalleUrl, { signal: AbortSignal.timeout(30000) });
                if (response.ok) {
                    buffer = Buffer.from(await response.arrayBuffer());
                } else {
                    console.error('[generate-thumbnail] Failed to download DALL-E image:', response.status);
                }
            }
        } catch (err) {
            console.error('[generate-thumbnail] DALL-E generation failed:', err);
        }

        // Fallback: generate a simple SVG placeholder if DALL-E is unavailable
        if (!buffer) {
            console.warn('[generate-thumbnail] DALL-E unavailable, using placeholder');
            const initials = title.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
            const hue = [...title].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
                <rect width="800" height="600" fill="hsl(${hue}, 50%, 25%)"/>
                <text x="400" y="320" text-anchor="middle" font-family="sans-serif" font-size="120" font-weight="bold" fill="hsl(${hue}, 70%, 70%)">${initials}</text>
            </svg>`;
            buffer = Buffer.from(svg);
        }

        // Save to temp file, upload to Supabase, then clean up
        const isSvg = buffer[0] === 0x3C; // '<' — SVG fallback
        const ext = isSvg ? 'svg' : 'png';
        const tempDir = path.join(process.cwd(), 'temp');
        await fs.mkdir(tempDir, { recursive: true });
        const tempPath = path.join(tempDir, `thumb-${lessonId}.${ext}`);
        await fs.writeFile(tempPath, buffer);

        const filename = `thumb-${lessonId}.${ext}`;
        const { url: thumbnailUrl } = await uploadToStorage('thumbnails', tempPath, user.id, filename, supabase);

        await fs.unlink(tempPath).catch(() => {});

        if (!thumbnailUrl) {
            return NextResponse.json({ error: 'Failed to upload thumbnail' }, { status: 500 });
        }

        // Update the lesson row with the thumbnail URL
        const { error: updateError } = await supabase
            .from('lessons')
            .update({ thumbnail_url: thumbnailUrl })
            .eq('id', lessonId);

        if (updateError) {
            console.error('[generate-thumbnail] DB update failed:', updateError);
            return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
        }

        console.log('[generate-thumbnail] Success:', thumbnailUrl);
        return NextResponse.json({ thumbnailUrl });
    } catch (error: any) {
        console.error('[generate-thumbnail] Error:', error);
        return NextResponse.json({ error: error.message || 'Thumbnail generation failed' }, { status: 500 });
    }
}
