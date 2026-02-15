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

        const response = await fetch(imageUrl, { signal: AbortSignal.timeout(30000) });
        if (!response.ok) {
            console.error('[generate-thumbnail] Pollinations HTTP error:', response.status);
            return NextResponse.json({ error: 'Image generation failed' }, { status: 502 });
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length < 1000) {
            console.error('[generate-thumbnail] Image too small, likely failed');
            return NextResponse.json({ error: 'Image generation returned invalid data' }, { status: 502 });
        }

        // Save to temp file, upload to Supabase, then clean up
        const tempDir = path.join(process.cwd(), 'temp');
        await fs.mkdir(tempDir, { recursive: true });
        const tempPath = path.join(tempDir, `thumb-${lessonId}.jpg`);
        await fs.writeFile(tempPath, buffer);

        const filename = `thumb-${lessonId}.jpg`;
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
