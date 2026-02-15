-- Create games table (if it doesn't already exist)
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_audience TEXT,
    html_src TEXT,
    design_doc TEXT,
    status TEXT DEFAULT 'pending', -- pending, generating, done, failed
    errors TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_games_lesson_id ON games(lesson_id);
CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- RLS Policies for games (matches the lessons/videos pattern)
CREATE POLICY "Users can view their own games"
    ON games FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own games"
    ON games FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own games"
    ON games FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own games"
    ON games FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
