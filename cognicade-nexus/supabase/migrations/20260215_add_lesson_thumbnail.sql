-- Add thumbnail_url column to lessons table
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
