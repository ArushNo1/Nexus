# Classroom System Setup Guide

This guide will help you set up the classroom management system for Nexus.

## Database Setup

### Step 1: Run Migrations

You need to run the migration files in Supabase to create the necessary tables.

#### Option A: Using Supabase Dashboard (Recommended for first time)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migrations in order:
   - First run: `supabase/migrations/20260214_create_lessons_and_videos.sql`
   - Then run: `supabase/migrations/20260214_create_classroom_system.sql`
   - Finally run: `supabase/migrations/20260214_update_lesson_policies.sql`

#### Option B: Using Supabase CLI

```bash
# Make sure you're in the cognicade-nexus directory
cd cognicade-nexus

# Link to your Supabase project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations to Supabase
supabase db push

# Or apply specific migrations
supabase db push --file supabase/migrations/20260214_create_classroom_system.sql
```

### Step 2: Verify Tables

After running migrations, verify that these tables exist in your Supabase database:

- `user_profiles` - Stores user role (teacher/student) and profile info
- `classrooms` - Teacher-created classrooms
- `classroom_members` - Students enrolled in classrooms
- `lesson_assignments` - Lessons assigned to classrooms
- `student_progress` - Student progress on lessons
- `game_sessions` - Individual game play sessions

## How It Works

### For Teachers:

1. **Sign up** → Profile is created with role "teacher"
2. **Create classroom** → Gets auto-generated join code (e.g., "ABC123")
3. **Create lesson** → Build game from lesson plan
4. **Assign lesson to classroom** → Students can now access it
5. **View student progress** → See who's playing and their scores

### For Students:

1. **Sign up** → Profile is created with role "student"
2. **Join classroom** → Enter teacher's join code
3. **View assigned lessons** → See games teacher has assigned
4. **Play game** → Progress is tracked automatically
5. **View progress** → See scores and completion

## Database Schema Overview

```
user_profiles
├── id (UUID, FK to auth.users)
├── role (teacher | student)
├── full_name
└── email

classrooms
├── id (UUID)
├── teacher_id (FK to auth.users)
├── name
├── subject
├── join_code (unique 6-char code)
└── is_active

classroom_members
├── classroom_id (FK to classrooms)
├── student_id (FK to auth.users)
└── joined_at

lesson_assignments
├── lesson_id (FK to lessons)
├── classroom_id (FK to classrooms)
├── assigned_by (FK to auth.users)
├── is_published (boolean)
└── due_date

student_progress
├── student_id (FK to auth.users)
├── lesson_id (FK to lessons)
├── classroom_id (FK to classrooms)
├── status (not_started | in_progress | completed)
├── score
├── completion_percentage
└── time_spent_seconds
```

## Security (Row Level Security)

All tables have RLS enabled with these key policies:

- Teachers can only see/edit their own classrooms and lessons
- Students can only see classrooms they've joined
- Students can only see published assignments
- Progress tracking is private per student (teachers can view their classroom students)

## Next Steps

After setting up the database:

1. Create the classroom management UI (in progress)
2. Add role selection during sign-up
3. Build the classroom join flow
4. Implement lesson assignment interface
5. Create student dashboard to view assigned lessons
