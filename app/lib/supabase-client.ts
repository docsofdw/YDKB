import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SupabaseClient } from '@supabase/supabase-js';

export interface Player {
  id: number;
  name: string;
  college: string;
  position: string;
  image_url?: string;
  team?: string;
}

/**
 * Create a Supabase client for client-side components
 * This is safe to use in client components
 */
export function createSafeClient() {
  const supabase = createClientComponentClient({
    options: {
      global: {
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
        },
      },
    },
  });
  return supabase;
}

/**
 * Create a challenge for today if one doesn't exist
 * @param supabase - Supabase client
 * @returns The created challenge or null if failed
 */
async function createChallengeForToday(supabase: SupabaseClient) {
  try {
    console.log('Creating new challenge for today');
    const today = new Date().toISOString().split('T')[0];
    
    // Get three random players
    const easyPlayer = await getRandomPlayer('easy');
    const hardPlayer = await getRandomPlayer('hard');
    const hofPlayer = await getRandomPlayer('hof');
    
    console.log('Selected players for challenge:', {
      easy: easyPlayer,
      hard: hardPlayer,
      hof: hofPlayer
    });
    
    // Create the challenge
    const { data: challenge, error } = await supabase
      .from('daily_challenges')
      .insert({
        challenge_date: today,
        easy_player_id: easyPlayer.id,
        hard_player_id: hardPlayer.id,
        hof_player_id: hofPlayer.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating challenge:', error);
      return null;
    }
    
    console.log('Successfully created challenge:', challenge);
    return challenge;
  } catch (error) {
    console.error('Error in createChallengeForToday:', error);
    return null;
  }
}

/**
 * Get today's challenge player for a specific difficulty
 * @param difficulty - Difficulty level ('easy', 'hard', or 'hof')
 * @returns Player data
 */
export async function getTodaysChallengePlayer(difficulty = 'easy'): Promise<Player> {
  try {
    console.log(`Getting today's challenge player for difficulty: ${difficulty}`);
    const supabase = createSafeClient();
    if (!supabase) {
      console.log('No Supabase client, returning fallback player');
      return getFallbackPlayer();
    }
    
    const today = new Date().toISOString().split('T')[0];
    console.log('Checking for challenge on date:', today);
    
    // Try to get the challenge for today's date
    let { data: challenge, error: challengeError } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('challenge_date', today)
      .single();
    
    // If no challenge found for today, create one
    if (challengeError || !challenge) {
      console.log('No challenge found for today, creating new challenge');
      challenge = await createChallengeForToday(supabase);
      
      if (!challenge) {
        console.log('Failed to create challenge, getting random player');
        return await getRandomPlayer(difficulty);
      }
    }
    
    console.log('Found/created challenge:', challenge);
    
    // Determine which player ID to use based on difficulty
    const playerIdMap = {
      easy: challenge.easy_player_id,
      hard: challenge.hard_player_id,
      hof: challenge.hof_player_id
    };
    
    const playerId = playerIdMap[difficulty] || challenge.easy_player_id;
    console.log(`Using player ID ${playerId} for difficulty ${difficulty}`);
    
    if (!playerId) {
      console.log('No player ID found, getting random player');
      return await getRandomPlayer(difficulty);
    }
    
    // Get the appropriate columns to select based on schema
    const selectColumns = await getPlayerSelectColumns(supabase);
    console.log('Using columns:', selectColumns);
    
    // Get the player data
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select(selectColumns)
      .eq('id', playerId)
      .single();
    
    if (playerError) {
      console.error('Error getting player data:', playerError);
      return await getRandomPlayer(difficulty);
    }
    
    if (!player) {
      console.log('No player found with ID', playerId);
      return await getRandomPlayer(difficulty);
    }
    
    console.log('Successfully found player:', player);
    return player;
  } catch (error) {
    console.error('Error in getTodaysChallengePlayer:', error);
    return await getRandomPlayer(difficulty);
  }
}

/**
 * Get a random player with a specific difficulty
 * @param difficulty - Difficulty level
 * @returns Player data
 */
export async function getRandomPlayer(difficulty: string | null = null): Promise<Player> {
  try {
    const supabase = createSafeClient();
    if (!supabase) {
      return getFallbackPlayer();
    }
    
    // Get the appropriate columns to select based on schema
    const selectColumns = await getPlayerSelectColumns(supabase);
    
    // Build query
    let query = supabase.from('players').select(selectColumns);
    
    // Add difficulty filter if specified
    if (difficulty && difficulty !== 'random') {
      query = query.eq('difficulty', difficulty);
    }
    
    // Get random player
    const { data, error } = await query.limit(1).single();
    
    if (error || !data) {
      return getFallbackPlayer();
    }
    
    return data;
  } catch (error) {
    return getFallbackPlayer();
  }
}

/**
 * Returns a fallback player when all else fails
 */
export function getFallbackPlayer(): Player {
  return {
    id: 1,
    name: 'Patrick Mahomes',
    position: 'QB',
    college: 'Texas Tech',
    team: 'Kansas City Chiefs',
    image_url: 'https://static.www.nfl.com/image/private/t_headshot_desktop/league/vs40h82nvqaqvyephwwu'
  };
}

/**
 * Get columns to select from players table based on schema
 * @param supabase - Supabase client
 * @returns Columns to select
 */
async function getPlayerSelectColumns(supabase: SupabaseClient): Promise<string> {
  let columns = 'id, name, position, college, image_url';
  
  // Try to select the team column
  const { error } = await supabase
    .from('players')
    .select('team')
    .limit(1);
  
  if (!error) {
    columns += ', team';
  }
  
  return columns;
}

/**
 * Search for colleges based on a search term
 * @param searchTerm The search term to match against college names
 * @returns Array of matching college names
 */
export async function searchColleges(searchTerm: string): Promise<string[]> {
  try {
    if (searchTerm.length < 2) return [];
    
    const supabase = createSafeClient();
    const { data, error } = await supabase
      .from('colleges')
      .select('name')
      .ilike('name', `${searchTerm}%`)
      .order('name')
      .limit(10);

    if (error) {
      console.error('Error searching colleges:', error);
      return [];
    }

    return data.map(college => college.name);
  } catch (error) {
    console.error('Error in searchColleges:', error);
    return [];
  }
} 