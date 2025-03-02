import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';

/**
 * Create a Supabase client with proper headers to prevent 406 errors
 * @returns Supabase client
 */
function createClient() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ 
    cookies: () => cookieStore,
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
 * Get the Supabase user ID from a Clerk user ID
 * @returns The Supabase user ID or null if not found
 */
export async function getSupabaseUserId() {
  try {
    // Get the Clerk user ID
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return null;
    }
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Query the users table to get the Supabase user ID
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single();
      
    if (error || !data) {
      console.error('Error fetching Supabase user ID:', error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error('Error in getSupabaseUserId:', error);
    return null;
  }
}

/**
 * Save user game history to Supabase
 * @param gameData Game data to save
 * @returns The game ID or null if failed
 */
export async function saveUserGameHistory(gameData: {
  score: number;
  correct_answers: number;
  total_questions: number;
  time_taken: number;
  difficulty: string;
}) {
  try {
    const userId = await getSupabaseUserId();
    
    if (!userId) {
      return null;
    }
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Insert game history
    const { data, error } = await supabase
      .from('user_game_history')
      .insert([{
        user_id: userId,
        ...gameData
      }])
      .select();
      
    if (error || !data) {
      console.error('Error saving game history:', error);
      return null;
    }
    
    // Update user stats
    await updateUserStats(userId, gameData);
    
    return data[0].id;
  } catch (error) {
    console.error('Error in saveUserGameHistory:', error);
    return null;
  }
}

/**
 * Save user question history to Supabase
 * @param gameId Game ID
 * @param questionData Question data to save
 * @returns Success status
 */
export async function saveUserQuestionHistory(
  gameId: string,
  questionData: {
    player_id: number;
    answered_correctly: boolean;
    time_taken: number;
  }[]
) {
  try {
    const userId = await getSupabaseUserId();
    
    if (!userId || !gameId) {
      return false;
    }
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Prepare data for insertion
    const questionsToInsert = questionData.map(question => ({
      user_id: userId,
      game_id: gameId,
      ...question
    }));
    
    // Insert question history
    const { error } = await supabase
      .from('user_question_history')
      .insert(questionsToInsert);
      
    if (error) {
      console.error('Error saving question history:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveUserQuestionHistory:', error);
    return false;
  }
}

/**
 * Update user stats in Supabase
 * @param userId Supabase user ID
 * @param gameData Game data
 */
async function updateUserStats(
  userId: string,
  gameData: {
    score: number;
    correct_answers: number;
    total_questions: number;
  }
) {
  try {
    // Initialize Supabase client
    const supabase = createClient();
    
    // Get current user stats
    const { data: currentStats, error: fetchError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching user stats:', fetchError);
      return;
    }
    
    // Calculate new stats
    const totalGames = (currentStats?.total_games || 0) + 1;
    const totalCorrectAnswers = (currentStats?.total_correct_answers || 0) + gameData.correct_answers;
    const totalQuestionsAttempted = (currentStats?.total_questions_attempted || 0) + gameData.total_questions;
    const winRate = totalQuestionsAttempted > 0 
      ? (totalCorrectAnswers / totalQuestionsAttempted) * 100 
      : 0;
    
    // Calculate streak
    let currentStreak = currentStats?.current_streak || 0;
    let bestStreak = currentStats?.best_streak || 0;
    
    // Consider a win if the user got more than 70% correct
    const isWin = (gameData.correct_answers / gameData.total_questions) >= 0.7;
    
    if (isWin) {
      currentStreak += 1;
    } else {
      currentStreak = 0;
    }
    
    // Update best streak if needed
    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }
    
    // Update user stats
    const { error: updateError } = await supabase
      .from('user_stats')
      .update({
        total_games: totalGames,
        total_correct_answers: totalCorrectAnswers,
        total_questions_attempted: totalQuestionsAttempted,
        win_rate: winRate,
        current_streak: currentStreak,
        best_streak: bestStreak,
        last_played_at: new Date().toISOString()
      })
      .eq('user_id', userId);
      
    if (updateError) {
      console.error('Error updating user stats:', updateError);
    }
  } catch (error) {
    console.error('Error in updateUserStats:', error);
  }
}

/**
 * Get user stats from Supabase
 * @returns User stats or null if not found
 */
export async function getUserStats() {
  try {
    const userId = await getSupabaseUserId();
    
    if (!userId) {
      return null;
    }
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Get user stats
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserStats:', error);
    return null;
  }
}

/**
 * Get user game history from Supabase
 * @param limit Number of games to return
 * @returns Game history or null if not found
 */
export async function getUserGameHistory(limit = 10) {
  try {
    const userId = await getSupabaseUserId();
    
    if (!userId) {
      return null;
    }
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Get game history
    const { data, error } = await supabase
      .from('user_game_history')
      .select('*')
      .eq('user_id', userId)
      .order('game_date', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching game history:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserGameHistory:', error);
    return null;
  }
} 