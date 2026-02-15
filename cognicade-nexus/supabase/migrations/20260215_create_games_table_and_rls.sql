-- Games table already exists — this migration only adds RLS policies.
-- Table schema for reference:
--   id, lesson_id, user_id, title, target_audience, thumbnail_url,
--   status, errors, created_at, updated_at, design_doc_data, html_src,
--   game_url, folder_path, error_message, completion_percentage

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
