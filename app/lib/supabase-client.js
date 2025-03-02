/**
 * Utility functions for Supabase client initialization and error handling
 */
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Cache the client instance to avoid creating multiple instances
let cachedClient = null;

// Cache for table schema information
const schemaCache = {
  players: {
    hasTeamColumn: null,
    hasDifficultyColumn: null,
    lastChecked: null
  }
};

/**
 * Creates a Supabase client with error handling
 * @returns {Object|null} The Supabase client or null if initialization failed
 */
export function createSafeClient() {
  // Return cached client if available
  if (cachedClient) return cachedClient;
  
  try {
    // Create new client
    const supabase = createClientComponentClient();
    
    // Add custom headers to prevent 406 errors
    if (supabase.rest && supabase.rest.headers) {
      supabase.rest.headers['Accept'] = '*/*';
      supabase.rest.headers['Content-Type'] = 'application/json';
    }
    
    // Add custom fetch handler to add headers to all requests
    const originalFetch = supabase.fetch;
    if (originalFetch) {
      supabase.fetch = function(...args) {
        // Add headers to the request
        if (args[1] && typeof args[1] === 'object') {
          args[1].headers = {
            ...args[1].headers,
            'Accept': '*/*',
            'Content-Type': 'application/json'
          };
        }
        return originalFetch.apply(this, args);
      };
    }
    
    // Patch the supabase client to add headers to all requests
    if (supabase.supabaseUrl && typeof supabase.supabaseUrl === 'string') {
      const originalFetch = global.fetch;
      const supabaseUrl = supabase.supabaseUrl;
      
      // Override fetch for Supabase requests only
      global.fetch = function(url, options) {
        if (typeof url === 'string' && url.includes(supabaseUrl)) {
          options = options || {};
          options.headers = {
            ...options.headers,
            'Accept': '*/*',
            'Content-Type': 'application/json'
          };
        }
        return originalFetch(url, options);
      };
    }
    
    // Cache the client for future use
    cachedClient = supabase;
    return supabase;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

/**
 * Check if the players table has a team column
 * @param {Object} supabase - Supabase client
 * @returns {Promise<boolean>} Whether the team column exists
 */
async function checkPlayersTableSchema(supabase) {
  // Return cached result if available and less than 5 minutes old
  const now = Date.now();
  if (schemaCache.players.hasTeamColumn !== null && 
      schemaCache.players.lastChecked && 
      now - schemaCache.players.lastChecked < 5 * 60 * 1000) {
    return schemaCache.players.hasTeamColumn;
  }
  
  try {
    // Try to select the team column
    const { error } = await supabase
      .from('players')
      .select('team')
      .limit(1);
    
    // Update cache
    schemaCache.players.hasTeamColumn = !error;
    schemaCache.players.lastChecked = now;
    
    return !error;
  } catch (e) {
    console.error('Error checking players table schema:', e);
    return false;
  }
}

/**
 * Check if the players table has a difficulty column
 * @param {Object} supabase - Supabase client
 * @returns {Promise<boolean>} Whether the difficulty column exists
 */
async function checkPlayersDifficultyColumn(supabase) {
  // Return cached result if available and less than 5 minutes old
  const now = Date.now();
  if (schemaCache.players.hasDifficultyColumn !== null && 
      schemaCache.players.lastChecked && 
      now - schemaCache.players.lastChecked < 5 * 60 * 1000) {
    return schemaCache.players.hasDifficultyColumn;
  }
  
  try {
    // Try to select the difficulty column
    const { error } = await supabase
      .from('players')
      .select('difficulty')
      .limit(1);
    
    // Update cache
    schemaCache.players.hasDifficultyColumn = !error;
    schemaCache.players.lastChecked = now;
    
    return !error;
  } catch (e) {
    console.error('Error checking players difficulty column:', e);
    return false;
  }
}

/**
 * Get columns to select from players table based on schema
 * @param {Object} supabase - Supabase client
 * @returns {Promise<string>} Columns to select
 */
async function getPlayerSelectColumns(supabase) {
  const hasTeamColumn = await checkPlayersTableSchema(supabase);
  let columns = 'id, name, position, college, image_url';
  if (hasTeamColumn) {
    columns += ', team';
  }
  return columns;
}

/**
 * Safely executes a Supabase query with proper error handling
 * @param {Function} queryFn - Function that executes the Supabase query
 * @param {Object} fallbackData - Optional fallback data to return if query fails
 * @returns {Promise<Object>} Object containing data, error, and success status
 */
export async function safeQuery(queryFn, fallbackData = null) {
  try {
    const supabase = createSafeClient();
    if (!supabase) {
      return {
        data: fallbackData,
        error: new Error('Failed to initialize Supabase client'),
        success: false
      };
    }
    
    // Execute the query with a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 10000);
    });
    
    const queryPromise = queryFn(supabase);
    
    // Race between query and timeout
    const result = await Promise.race([queryPromise, timeoutPromise])
      .catch(error => {
        console.error('Query execution error:', error);
        return { data: fallbackData, error };
      });
    
    return {
      ...result,
      data: result.data || fallbackData,
      success: !result.error
    };
  } catch (error) {
    console.error('Error executing Supabase query:', error);
    return {
      data: fallbackData,
      error,
      success: false
    };
  }
}

/**
 * Checks if the Supabase client is properly initialized
 * @returns {Promise<boolean>} True if Supabase is working properly
 */
export async function checkSupabaseConnection() {
  try {
    const supabase = createSafeClient();
    if (!supabase) return false;
    
    // Try a simple query to verify connection
    const { error } = await supabase.from('colleges').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
}

/**
 * Get a list of colleges with caching
 * @returns {Promise<Array>} Array of colleges or empty array if failed
 */
export async function getColleges() {
  try {
    // Use sessionStorage for caching if available
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const cached = sessionStorage.getItem('colleges');
      if (cached) {
        try {
          const parsedData = JSON.parse(cached);
          if (parsedData && parsedData.length > 0) {
            console.log(`Using ${parsedData.length} cached colleges from sessionStorage`);
            return parsedData;
          }
        } catch (e) {
          console.error('Failed to parse cached colleges:', e);
        }
      }
    }
    
    const supabase = createSafeClient();
    if (!supabase) {
      console.error('Failed to initialize Supabase client for colleges');
      return getFallbackColleges();
    }
    
    // First check if the colleges table exists
    try {
      const { count, error: countError } = await supabase
        .from('colleges')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error checking colleges table:', countError);
        return getFallbackColleges();
      }
      
      if (count === 0) {
        console.warn('colleges table is empty');
        return getFallbackColleges();
      }
    } catch (error) {
      console.error('Unexpected error checking colleges table:', error);
      return getFallbackColleges();
    }
    
    // Get colleges from database
    const { data, error } = await supabase
      .from('colleges')
      .select('id, name')
      .order('name');
    
    if (error) {
      console.error('Error fetching colleges:', error);
      return getFallbackColleges();
    }
    
    if (!data || data.length === 0) {
      console.warn('No colleges found in database');
      return getFallbackColleges();
    }
    
    console.log(`Successfully fetched ${data.length} colleges from database`);
    
    // Cache the result
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.setItem('colleges', JSON.stringify(data));
      } catch (e) {
        console.error('Failed to cache colleges:', e);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error in getColleges:', error);
    return getFallbackColleges();
  }
}

/**
 * Get a fallback list of colleges
 * @returns {Array} Array of college objects
 */
function getFallbackColleges() {
  console.log('Using fallback college list');
  return [
    { id: '1', name: 'Alabama' },
    { id: '2', name: 'Ohio State' },
    { id: '3', name: 'Georgia' },
    { id: '4', name: 'Clemson' },
    { id: '5', name: 'Michigan' },
    { id: '6', name: 'Texas' },
    { id: '7', name: 'Oklahoma' },
    { id: '8', name: 'LSU' },
    { id: '9', name: 'Notre Dame' },
    { id: '10', name: 'Florida' },
    { id: '11', name: 'Texas Tech' },
    { id: '12', name: 'USC' },
    { id: '13', name: 'Oregon' },
    { id: '14', name: 'Penn State' },
    { id: '15', name: 'Miami' }
  ];
}

/**
 * Get a random player for the play page
 * @param {string} difficulty - Optional difficulty level (easy, hard, hof)
 * @returns {Promise<Object>} Player data or null if failed
 */
export async function getRandomPlayer(difficulty = null) {
  try {
    const supabase = createSafeClient();
    if (!supabase) {
      console.error('Failed to initialize Supabase client');
      return getFallbackPlayer();
    }
    
    console.log(`Fetching random player with difficulty: ${difficulty || 'any'}`);
    const result = await getRandomPlayerQuery(supabase, difficulty);
    
    if (!result.data) {
      console.error('No player data returned from getRandomPlayerQuery');
      return getFallbackPlayer();
    }
    
    console.log('Successfully fetched random player:', result.data.name);
    return result.data;
  } catch (error) {
    console.error('Error fetching random player:', error);
    return getFallbackPlayer();
  }
}

/**
 * Get today's challenge player
 * @returns {Promise<Object>} Player data for today's challenge or null if failed
 */
export async function getTodaysChallengePlayer(difficulty = 'easy') {
  try {
    const supabase = createSafeClient();
    if (!supabase) {
      console.error('Failed to initialize Supabase client');
      return getFallbackPlayer();
    }
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    console.log(`Fetching challenge for date: ${today}`);
    
    // First check if the daily_challenges table exists
    try {
      const { count, error: countError } = await supabase
        .from('daily_challenges')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error checking daily_challenges table:', countError);
        // Fall back to random player
        console.log('Falling back to random player due to table error');
        return await getRandomPlayer(difficulty);
      }
      
      if (count === 0) {
        console.warn('daily_challenges table is empty');
        // Fall back to random player
        console.log('Falling back to random player due to empty table');
        return await getRandomPlayer(difficulty);
      }
    } catch (error) {
      console.error('Unexpected error checking daily_challenges table:', error);
      // Fall back to random player
      console.log('Falling back to random player due to unexpected error');
      return await getRandomPlayer(difficulty);
    }
    
    // Try to get the challenge for today's date
    let challenge;
    let challengeError;
    
    try {
      const result = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('challenge_date', today)
        .single();
      
      challenge = result.data;
      challengeError = result.error;
      
      // If we get a 406 error, try a direct fetch as a fallback
      if (challengeError && challengeError.code === '406') {
        console.log('Got 406 error, trying direct fetch fallback');
        
        // Try a direct fetch as a fallback
        const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/daily_challenges?challenge_date=eq.${today}&limit=1`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            challenge = data[0];
            challengeError = null;
            console.log('Successfully fetched challenge using direct fetch');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching challenge:', error);
      challengeError = error;
    }
    
    // If no challenge found for today, try to get the most recent challenge
    if (challengeError || !challenge) {
      console.log(`No challenge found for date ${today}, trying to find most recent challenge`);
      
      try {
        const result = await supabase
          .from('daily_challenges')
          .select('*')
          .order('challenge_date', { ascending: false })
          .limit(1);
        
        const recentChallenges = result.data;
        const recentError = result.error;
        
        if (recentError || !recentChallenges || recentChallenges.length === 0) {
          console.log('No recent challenges found, falling back to random player');
          return await getRandomPlayer(difficulty);
        } else {
          challenge = recentChallenges[0];
          console.log(`Using most recent challenge from date: ${challenge.challenge_date}`);
        }
      } catch (error) {
        console.error('Error fetching recent challenges:', error);
        return await getRandomPlayer(difficulty);
      }
    } else {
      console.log('Found challenge for today:', challenge);
    }
    
    // Determine which player ID to use based on difficulty
    let playerId;
    switch (difficulty) {
      case 'easy':
        playerId = challenge.easy_player_id;
        break;
      case 'hard':
        playerId = challenge.hard_player_id;
        break;
      case 'hof':
        playerId = challenge.hof_player_id;
        break;
      default:
        playerId = challenge.easy_player_id;
    }
    
    console.log(`Using player ID ${playerId} for difficulty ${difficulty}`);
    
    // If the player ID is missing, fall back to a random player
    if (!playerId) {
      console.log(`No player ID found for difficulty ${difficulty}, falling back to random player`);
      return await getRandomPlayer(difficulty);
    }
    
    // Get the appropriate columns to select based on schema
    const selectColumns = await getPlayerSelectColumns(supabase);
    
    // Get the player data
    let player;
    let playerError;
    
    try {
      const result = await supabase
        .from('players')
        .select(selectColumns)
        .eq('id', playerId)
        .single();
      
      player = result.data;
      playerError = result.error;
      
      // If we get a 406 error, try a direct fetch as a fallback
      if (playerError && playerError.code === '406') {
        console.log('Got 406 error for player, trying direct fetch fallback');
        
        // Try a direct fetch as a fallback
        const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/players?id=eq.${playerId}&limit=1`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            player = data[0];
            playerError = null;
            console.log('Successfully fetched player using direct fetch');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching player:', error);
      playerError = error;
    }
    
    if (playerError || !player) {
      console.log(`Player with ID ${playerId} not found, falling back to random player`);
      return await getRandomPlayer(difficulty);
    }
    
    console.log('Successfully found player for today:', player.name);
    return player;
  } catch (error) {
    console.error('Unexpected error in getTodaysChallengePlayer:', error);
    // Fall back to random player in case of any error
    try {
      return await getRandomPlayer(difficulty);
    } catch (fallbackError) {
      console.error('Error in fallback random player:', fallbackError);
      return getFallbackPlayer();
    }
  }
}

/**
 * Returns a fallback player when all else fails
 */
function getFallbackPlayer() {
  return {
    id: '1',
    name: 'Patrick Mahomes',
    position: 'QB',
    college: 'Texas Tech',
    team: 'Kansas City Chiefs',
    image_url: 'https://static.www.nfl.com/image/private/t_headshot_desktop/league/vs40h82nvqaqvyephwwu'
  };
}

/**
 * Helper function to get a random player with a specific difficulty
 * @param {Object} supabase - Supabase client
 * @param {string} difficulty - Difficulty level
 * @returns {Promise<Object>} Query result with player data
 */
async function getRandomPlayerQuery(supabase, difficulty) {
  try {
    // First check if the players table exists and has data
    let count = 0;
    let countError = null;
    
    try {
      const result = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true });
      
      count = result.count || 0;
      countError = result.error;
      
      // If we get a 406 error, try a direct fetch as a fallback
      if (countError && countError.code === '406') {
        console.log('Got 406 error for count, trying direct fetch fallback');
        
        // Try a direct fetch as a fallback
        const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/players?limit=1`;
        const response = await fetch(apiUrl, {
          method: 'HEAD',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Prefer': 'count=exact'
          }
        });
        
        if (response.ok) {
          count = parseInt(response.headers.get('content-range')?.split('/')[1] || '0', 10);
          countError = null;
          console.log('Successfully fetched count using direct fetch:', count);
        }
      }
    } catch (error) {
      console.error('Error checking players table:', error);
      countError = error;
    }
    
    if (countError || count === 0) {
      console.error('Players table is empty or does not exist:', countError);
      // Return a mock player as fallback
      return { 
        data: getFallbackPlayer(),
        error: null 
      };
    }
    
    // Get the appropriate columns to select based on schema
    const selectColumns = await getPlayerSelectColumns(supabase);
    
    // First try with the specified difficulty
    let query = supabase.from('players').select(selectColumns);
    
    // Check if difficulty column exists before applying the filter
    const hasDifficultyColumn = await checkPlayersDifficultyColumn(supabase);
    
    // Apply difficulty filter if it's not 'random' and the difficulty column exists
    if (difficulty && difficulty !== 'random' && hasDifficultyColumn) {
      // Check if the specified difficulty exists in the database
      let difficultyCheck = [];
      let difficultyError = null;
      
      try {
        const result = await supabase
          .from('players')
          .select('id')
          .eq('difficulty', difficulty)
          .limit(1);
        
        difficultyCheck = result.data || [];
        difficultyError = result.error;
      } catch (error) {
        console.error('Error checking difficulty:', error);
        difficultyError = error;
      }
      
      if (!difficultyError && difficultyCheck && difficultyCheck.length > 0) {
        // The specified difficulty exists, apply the filter
        query = query.eq('difficulty', difficulty);
      } else {
        console.warn(`No players found with difficulty: ${difficulty}, using any available difficulty`);
        // Don't apply the filter if no players with that difficulty exist
      }
    } else if (difficulty && difficulty !== 'random' && !hasDifficultyColumn) {
      console.warn('Difficulty column does not exist in players table, ignoring difficulty filter');
    }
    
    // Get players
    let data = [];
    let error = null;
    
    try {
      const result = await query.limit(20);
      data = result.data || [];
      error = result.error;
      
      // If we get a 406 error, try a direct fetch as a fallback
      if (error && error.code === '406') {
        console.log('Got 406 error for players query, trying direct fetch fallback');
        
        // Try a direct fetch as a fallback
        const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/players?limit=20`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          data = await response.json();
          error = null;
          console.log('Successfully fetched players using direct fetch');
        }
      }
    } catch (fetchError) {
      console.error('Error fetching players:', fetchError);
      error = fetchError;
    }
    
    // If no players found with the specified difficulty, try without the difficulty filter
    if ((!data || data.length === 0) && difficulty && difficulty !== 'random' && hasDifficultyColumn) {
      console.warn(`No players found with difficulty: ${difficulty}, trying without difficulty filter`);
      
      // Try again without the difficulty filter
      try {
        const retryQuery = supabase.from('players').select(selectColumns);
        const retryResult = await retryQuery.limit(20);
        
        data = retryResult.data || [];
        error = retryResult.error;
      } catch (retryError) {
        console.error('Error in retry query:', retryError);
        error = retryError;
      }
    }
    
    if (error) {
      console.error('Error fetching players:', error);
      // Return a mock player as fallback
      return { 
        data: getFallbackPlayer(),
        error: null 
      };
    }
    
    if (!data || data.length === 0) {
      console.warn(`No players found in database, using fallback player`);
      // Return a mock player as fallback
      return { 
        data: getFallbackPlayer(),
        error: null 
      };
    }
    
    // Select a random player from the results
    const randomIndex = Math.floor(Math.random() * data.length);
    return {
      data: data[randomIndex],
      error: null
    };
  } catch (error) {
    console.error('Unexpected error in getRandomPlayerQuery:', error);
    // Return a mock player as fallback
    return { 
      data: getFallbackPlayer(),
      error: null 
    };
  }
}

/**
 * Create a challenge for today if one doesn't exist
 * @param {Object} supabase - Supabase client
 * @returns {Promise<Object>} The created challenge or null if failed
 */
async function createChallengeForToday(supabase) {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    console.log(`Creating challenge for date: ${today}`);
    
    // Check if difficulty column exists
    const hasDifficultyColumn = await checkPlayersDifficultyColumn(supabase);
    
    // Get random players for each difficulty level
    let easyPlayerResult, hardPlayerResult, hofPlayerResult;
    
    if (hasDifficultyColumn) {
      // Try to get players with specific difficulty levels
      easyPlayerResult = await getRandomPlayerQuery(supabase, 'easy');
      hardPlayerResult = await getRandomPlayerQuery(supabase, 'hard');
      hofPlayerResult = await getRandomPlayerQuery(supabase, 'hof');
    } else {
      // If no difficulty column or all players have the same difficulty,
      // just get three different random players
      console.log('Getting random players for challenge regardless of difficulty');
      
      // Get the appropriate columns to select based on schema
      const selectColumns = await getPlayerSelectColumns(supabase);
      
      // Get a list of players
      const { data: playersList, error } = await supabase
        .from('players')
        .select(selectColumns)
        .limit(30);
      
      if (error || !playersList || playersList.length === 0) {
        console.error('Error fetching players for challenge:', error);
        return null;
      }
      
      // Shuffle the list to get random players
      const shuffledPlayers = [...playersList].sort(() => Math.random() - 0.5);
      
      // Get three different players if possible
      const player1 = shuffledPlayers[0] || null;
      const player2 = shuffledPlayers.length > 1 ? shuffledPlayers[1] : player1;
      const player3 = shuffledPlayers.length > 2 ? shuffledPlayers[2] : player1;
      
      easyPlayerResult = { data: player1, error: null };
      hardPlayerResult = { data: player2, error: null };
      hofPlayerResult = { data: player3, error: null };
    }
    
    // Create the challenge
    const { data: challenge, error } = await supabase
      .from('daily_challenges')
      .insert({
        challenge_date: today,
        easy_player_id: easyPlayerResult.data.id,
        hard_player_id: hardPlayerResult.data.id,
        hof_player_id: hofPlayerResult.data.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating challenge:', error);
      return null;
    }
    
    console.log('Successfully created challenge for today:', challenge);
    return challenge;
  } catch (error) {
    console.error('Error creating challenge for today:', error);
    return null;
  }
} 