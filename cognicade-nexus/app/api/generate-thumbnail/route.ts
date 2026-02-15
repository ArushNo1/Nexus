import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { uploadToStorage } from '@/lib/supabase/storage';
import fs from 'fs/promises';
import path from 'path';

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
        const prompt = `dark cinematic educational illustration of ${title}${subject ? `, ${subject}` : ''}, detailed, vibrant colors on dark background`;
        const encodedPrompt = encodeURIComponent(prompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true`;

        console.log('[generate-thumbnail] Fetching image for lesson:', lessonId);

        let buffer: Buffer | null = null;
        const maxRetries = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(imageUrl, { signal: AbortSignal.timeout(30000) });
                if (!response.ok) {
                    console.error(`[generate-thumbnail] Pollinations HTTP error (attempt ${attempt}/${maxRetries}):`, response.status);
                    if (attempt < maxRetries) {
                        await new Promise(r => setTimeout(r, 2000 * attempt));
                        continue;
                    }
                    break;
                }

                const data = Buffer.from(await response.arrayBuffer());
                if (data.length < 1000) {
                    console.error(`[generate-thumbnail] Image too small (attempt ${attempt}/${maxRetries})`);
                    if (attempt < maxRetries) {
                        await new Promise(r => setTimeout(r, 2000 * attempt));
                        continue;
                    }
                    break;
                }

                buffer = data;
                break;
            } catch (fetchErr) {
                console.error(`[generate-thumbnail] Fetch error (attempt ${attempt}/${maxRetries}):`, fetchErr);
                if (attempt < maxRetries) {
                    await new Promise(r => setTimeout(r, 2000 * attempt));
                }
            }
        }

        // Fallback: generate a simple SVG placeholder if Pollinations is unavailable
        if (!buffer) {
            console.warn('[generate-thumbnail] Pollinations unavailable, using placeholder');
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
        const ext = isSvg ? 'svg' : 'jpg';
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
