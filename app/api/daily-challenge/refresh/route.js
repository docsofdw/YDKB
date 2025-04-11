export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create a Supabase client with proper headers
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    global: {
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
      },
    },
  }
);

/**
 * Get a random player with a specific difficulty, excluding certain player IDs
 * @param difficulty - Difficulty level
 * @param excludeIds - Array of player IDs to exclude
 * @returns Player data
 */
async function getRandomPlayerExcluding(difficulty, excludeIds = []) {
  try {
    // Build query
    let query = supabase.from('players').select('id, name, position, college, team');
    
    // Add difficulty filter if specified
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    
    // Exclude specific player IDs if provided
    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }
    
    // Get random order
    query = query.order('id', { ascending: false });
    
    // Get random player
    const { data, error } = await query.limit(1).single();
    
    if (error || !data) {
      // If no player found with exclusions, try without exclusions
      const { data: fallbackData } = await supabase
        .from('players')
        .select('id, name, position, college, team')
        .eq('difficulty', difficulty)
        .limit(1)
        .single();
      
      return fallbackData;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting random player:', error);
    return null;
  }
}

/**
 * Create a challenge for today
 * @returns The created challenge or null if failed
 */
async function createChallengeForToday() {
  try {
    console.log('Creating new challenge for today');
    const today = new Date().toISOString().split('T')[0];
    
    // Get recent player IDs to avoid repeating recent challenges
    const { data: recentChallenges } = await supabase
      .from('daily_challenges')
      .select('easy_player_id, hard_player_id, hof_player_id')
      .order('challenge_date', { ascending: false })
      .limit(7);
    
    const recentPlayerIds = new Set();
    if (recentChallenges) {
      recentChallenges.forEach(challenge => {
        recentPlayerIds.add(challenge.easy_player_id);
        recentPlayerIds.add(challenge.hard_player_id);
        recentPlayerIds.add(challenge.hof_player_id);
      });
    }
    
    // Get three random players that haven't been used recently
    const easyPlayer = await getRandomPlayerExcluding('easy', Array.from(recentPlayerIds));
    const hardPlayer = await getRandomPlayerExcluding('hard', Array.from(recentPlayerIds));
    const hofPlayer = await getRandomPlayerExcluding('hof', Array.from(recentPlayerIds));
    
    if (!easyPlayer || !hardPlayer || !hofPlayer) {
      throw new Error('Failed to get random players');
    }
    
    console.log('Selected players for challenge:', {
      easy: easyPlayer.name,
      hard: hardPlayer.name,
      hof: hofPlayer.name
    });
    
    // Check if a challenge already exists for today
    const { data: existingChallenge } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('challenge_date', today)
      .maybeSingle();
    
    if (existingChallenge) {
      console.log('Challenge already exists for today, updating it');
      
      // Update the existing challenge
      const { data: updatedChallenge, error: updateError } = await supabase
        .from('daily_challenges')
        .update({
          easy_player_id: easyPlayer.id,
          hard_player_id: hardPlayer.id,
          hof_player_id: hofPlayer.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingChallenge.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating challenge:', updateError);
        return null;
      }
      
      console.log('Successfully updated challenge:', updatedChallenge);
      return updatedChallenge;
    } else {
      // Create a new challenge
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
    }
  } catch (error) {
    console.error('Error in createChallengeForToday:', error);
    return null;
  }
}

export async function GET(request) {
  try {
    // Set CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    };
    
    // Handle OPTIONS request for CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }
    
    // Check for Authorization header from Vercel Cron Job
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers }
      );
    }
    
    // Create or update today's challenge
    const challenge = await createChallengeForToday();
    
    if (!challenge) {
      return NextResponse.json(
        { error: 'Failed to create or update challenge' },
        { status: 500, headers }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Daily challenge refreshed successfully',
        date: challenge.challenge_date
      }, 
      { headers }
    );
    
  } catch (error) {
    console.error('API error:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 