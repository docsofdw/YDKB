-- Create player_images table
CREATE TABLE player_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  difficulty TEXT NOT NULL,
  challenge_date DATE NOT NULL,
  
  -- Add constraint to ensure only one image per player per date
  UNIQUE(player_id, challenge_date)
);

-- Create indexes for faster lookups
CREATE INDEX player_images_player_id_idx ON player_images(player_id);
CREATE INDEX player_images_challenge_date_idx ON player_images(challenge_date); 