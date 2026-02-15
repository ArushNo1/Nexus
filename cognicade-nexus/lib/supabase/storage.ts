import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Upload a file to Supabase Storage
 * @param supabaseClient - Optional pre-configured Supabase client (e.g. service-role).
 *                         When omitted, a cookie-based server client is created.
 */
export async function uploadToStorage(
    bucket: 'videos' | 'audio' | 'sprites',
    filePath: string,
    userId: string,
    filename?: string,
    supabaseClient?: SupabaseClient
): Promise<{ url: string | null; error: Error | null }> {
    try {
        const supabase = supabaseClient ?? await createClient();

        // Read the file
        const fileBuffer = await fs.readFile(filePath);

        // Generate filename if not provided
        const finalFilename = filename || path.basename(filePath);

        // Create user-specific path
        const storagePath = `${userId}/${finalFilename}`;

        // Determine content type
        const ext = path.extname(filePath).toLowerCase();
        const contentTypeMap: Record<string, string> = {
            '.mp4': 'video/mp4',
            '.mp3': 'audio/mpeg',
            '.svg': 'image/svg+xml',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
        };
        const contentType = contentTypeMap[ext] || 'application/octet-stream';

        // Upload to storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(storagePath, fileBuffer, {
                contentType,
                upsert: true, // Overwrite if exists
            });

        if (error) {
            console.error(`[storage] Upload error:`, error);
            return { url: null, error };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(storagePath);

        return { url: publicUrl, error: null };
    } catch (err) {
        console.error(`[storage] Exception:`, err);
        return { url: null, error: err as Error };
    }
}

/**
 * Upload multiple files to Supabase Storage
 */
export async function uploadMultipleToStorage(
    bucket: 'videos' | 'audio' | 'sprites',
    files: { path: string; filename?: string }[],
    userId: string
): Promise<{ urls: string[]; errors: (Error | null)[] }> {
    const results = await Promise.all(
        files.map(file => uploadToStorage(bucket, file.path, userId, file.filename))
    );

    return {
        urls: results.map(r => r.url || ''),
        errors: results.map(r => r.error),
    };
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFromStorage(
    bucket: 'videos' | 'audio' | 'sprites',
    filePath: string
): Promise<{ success: boolean; error: Error | null }> {
    try {
        const supabase = await createClient();

        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            console.error(`[storage] Delete error:`, error);
            return { success: false, error };
        }

        return { success: true, error: null };
    } catch (err) {
        console.error(`[storage] Exception:`, err);
        return { success: false, error: err as Error };
    }
}
