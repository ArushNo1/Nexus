# Supabase Setup for Cognicade Nexus

This directory contains database migrations and storage setup for the Cognicade Nexus educational video platform.

## Setup Instructions

### 1. Run Database Migration

Go to your Supabase dashboard → SQL Editor → and run the migration file:

```sql
-- Copy and paste the contents of migrations/20260214_create_lessons_and_videos.sql
```

This will create:
- `lessons` table - Stores lesson plans
- `videos` table - Stores generated videos
- `audio_files` table - Stores audio narrations
- `sprites` table - Caches sprite icons
- All necessary indexes and RLS policies

### 2. Set Up Storage Buckets

Go to your Supabase dashboard → Storage → and run the storage setup file:

```sql
-- Copy and paste the contents of storage-setup.sql
```

This will create 3 public storage buckets:
- `videos` - For final rendered video files (.mp4)
- `audio` - For scene narration audio files (.mp3)
- `sprites` - For cached sprite icons (.svg, .png)

All buckets have proper security policies set up.

### 3. Verify Setup

Check that you have:
- ✅ 4 database tables created
- ✅ 3 storage buckets created
- ✅ RLS policies enabled

## How It Works

### Video Generation Flow

1. **User submits lesson plan** → Saved to `lessons` table
2. **AI generates video script** → Scenes with elements
3. **System fetches sprites** → Downloaded from Iconify API → Uploaded to `sprites` bucket
4. **System generates audio** → Edge TTS → Uploaded to `audio` bucket
5. **System renders video** → Remotion → Uploaded to `videos` bucket
6. **Video record saved** → `videos` table with all Supabase URLs
7. **User receives** → All URLs pointing to Supabase Storage

### Storage Structure

```
videos/
  ├── {user_id}/
  │   ├── video-1234567890.mp4
  │   └── video-9876543210.mp4

audio/
  ├── {user_id}/
  │   ├── narration-1234567890-0.mp3
  │   ├── narration-1234567890-1.mp3
  │   └── narration-1234567890-2.mp3

sprites/
  ├── shared/
  │   ├── Sun.svg
  │   ├── Plant.svg
  │   ├── Water.svg
  │   └── Oxygen.svg
```

## Database Schema

### `lessons`
- Stores lesson plan metadata
- Links to user via `user_id`
- Contains objectives, content structure

### `videos`
- Stores generated video metadata
- Links to lesson via `lesson_id`
- Contains scenes data (JSON)
- Contains URLs to Supabase Storage assets
- Tracks generation status

### `audio_files`
- Optional: Track individual scene audio
- Links to video via `video_id`

### `sprites`
- Caches frequently used sprites
- Shared across all users
- Avoids re-downloading same icons

## Security

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own lessons and videos
- Sprites are public read-only
- Storage buckets use user-specific paths
- All uploads require authentication
