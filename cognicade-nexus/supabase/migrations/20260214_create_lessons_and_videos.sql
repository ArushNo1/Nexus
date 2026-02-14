-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject TEXT,
    grade_level TEXT,
    objectives TEXT[],
    content JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_audience TEXT,
    scenes JSONB NOT NULL,
    key_takeaways TEXT[],
    video_url TEXT,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audio_files table (for scene narrations)
CREATE TABLE IF NOT EXISTS audio_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    scene_index INTEGER NOT NULL,
    narration_text TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    duration_seconds DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sprites table (cached sprites)
CREATE TABLE IF NOT EXISTS sprites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    element_name TEXT NOT NULL UNIQUE,
    sprite_url TEXT NOT NULL,
    source TEXT, -- iconify, custom, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lessons_user_id ON lessons(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_created_at ON lessons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_lesson_id ON videos(lesson_id);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_audio_files_video_id ON audio_files(video_id);
CREATE INDEX IF NOT EXISTS idx_sprites_element_name ON sprites(element_name);

-- Enable Row Level Security
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lessons
CREATE POLICY "Users can view their own lessons"
    ON lessons FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lessons"
    ON lessons FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lessons"
    ON lessons FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lessons"
    ON lessons FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for videos
CREATE POLICY "Users can view their own videos"
    ON videos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos"
    ON videos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
    ON videos FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
    ON videos FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for audio_files
CREATE POLICY "Users can view audio files for their videos"
    ON audio_files FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM videos
        WHERE videos.id = audio_files.video_id
        AND videos.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert audio files for their videos"
    ON audio_files FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM videos
        WHERE videos.id = audio_files.video_id
        AND videos.user_id = auth.uid()
    ));

-- Sprites are public (read-only for all, write for authenticated users)
CREATE POLICY "Everyone can view sprites"
    ON sprites FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Authenticated users can insert sprites"
    ON sprites FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
