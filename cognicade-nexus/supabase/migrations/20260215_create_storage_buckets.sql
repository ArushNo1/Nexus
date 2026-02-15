-- Create storage buckets used by the application
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('videos',     'videos',     true),
    ('audio',      'audio',      true),
    ('sprites',    'sprites',    true),
    ('bg-images',  'bg-images',  true),
    ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage objects

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own files"
    ON storage.objects FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Allow authenticated users to update/overwrite their own files
CREATE POLICY "Users can update their own files"
    ON storage.objects FOR UPDATE
    USING (
        auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own files"
    ON storage.objects FOR DELETE
    USING (
        auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Public read access (buckets are marked public)
CREATE POLICY "Public read access"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('videos', 'audio', 'sprites', 'bg-images', 'thumbnails'));
