-- Add image_url column to players table if it doesn't exist
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS image_url TEXT; 

-- Create friend_relationships table
CREATE TABLE IF NOT EXISTS friend_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Create index for faster friend lookups
CREATE INDEX IF NOT EXISTS idx_friend_relationships_user_id ON friend_relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_relationships_friend_id ON friend_relationships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friend_relationships_status ON friend_relationships(status);

-- Create index for user_game_history for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_game_history_score ON user_game_history(score DESC);
CREATE INDEX IF NOT EXISTS idx_user_game_history_game_date ON user_game_history(game_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_game_history_difficulty ON user_game_history(difficulty);

-- Create index for user_stats for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_stats_win_rate ON user_stats(win_rate DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_best_streak ON user_stats(best_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_correct_answers ON user_stats(total_correct_answers DESC); 