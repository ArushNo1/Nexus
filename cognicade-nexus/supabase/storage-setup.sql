-- Create storage buckets for educational content

-- Videos bucket (public access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Audio files bucket (public access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- Sprites bucket (public access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('sprites', 'sprites', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for videos bucket
CREATE POLICY "Anyone can view videos"
ON storage.objects FOR SELECT
TO PUBLIC
USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for audio bucket
CREATE POLICY "Anyone can view audio files"
ON storage.objects FOR SELECT
TO PUBLIC
USING (bucket_id = 'audio');

CREATE POLICY "Authenticated users can upload audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Users can update their own audio"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own audio"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for sprites bucket
CREATE POLICY "Anyone can view sprites"
ON storage.objects FOR SELECT
TO PUBLIC
USING (bucket_id = 'sprites');

CREATE POLICY "Authenticated users can upload sprites"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'sprites');

-- Sprites are shared, so anyone authenticated can update/delete
CREATE POLICY "Authenticated users can update sprites"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'sprites');

CREATE POLICY "Authenticated users can delete sprites"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'sprites');
