-- Migration to add image-related columns to the players table
-- This migration adds support for storing player images from TheSportsDB
-- or using initials as a fallback

-- Check if the players table exists, if not create it
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  player_name TEXT UNIQUE NOT NULL,
  college TEXT,
  position TEXT,
  team TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add image-related columns if they don't exist
DO $$ 
BEGIN
  -- Add image_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'players' AND column_name = 'image_url') THEN
    ALTER TABLE players ADD COLUMN image_url TEXT;
  END IF;

  -- Add image_type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'players' AND column_name = 'image_type') THEN
    ALTER TABLE players ADD COLUMN image_type TEXT DEFAULT 'initials' CHECK (image_type IN ('url', 'initials'));
  END IF;

  -- Add initials column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'players' AND column_name = 'initials') THEN
    ALTER TABLE players ADD COLUMN initials TEXT;
  END IF;

  -- Add last_updated column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'players' AND column_name = 'last_updated') THEN
    ALTER TABLE players ADD COLUMN last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$; 