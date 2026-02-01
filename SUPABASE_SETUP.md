# Supabase Setup Guide

## Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Sign up for free account
3. Create a new project

## Step 2: Create Database Table
1. In Supabase dashboard, go to **SQL Editor**
2. Run this SQL:

```sql
CREATE TABLE player_scores (
    id BIGSERIAL PRIMARY KEY,
    player_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    score INTEGER NOT NULL,
    time_taken TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional)
ALTER TABLE player_scores ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for game)
CREATE POLICY "Allow public inserts" ON player_scores
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow public reads (for leaderboard)
CREATE POLICY "Allow public reads" ON player_scores
    FOR SELECT TO anon
    USING (true);
```

## Step 3: Get API Credentials
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **anon public key** (long string starting with eyJ...)

## Step 4: Update .env File
Edit `sql-escape-room/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...your_actual_key_here
```

## Step 5: Start Server
```bash
node server/server.js
```

## Step 6: Test
Play the game and complete all levels. Check Supabase dashboard → Table Editor → player_scores to see the data.

## View Scores in Supabase
1. Go to **Table Editor**
2. Click **player_scores** table
3. See all player data with names, roll numbers, scores, and times

## Export Data
In Supabase, you can:
- Click **Export to CSV** to download all scores
- Use SQL queries to filter/sort data
- Create custom views for leaderboards
