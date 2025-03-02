'use server';

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
 * Get user friends list
 */
export async function getFriends() {
  try {
    const userId = await getSupabaseUserId();
    
    if (!userId) {
      return { success: false, message: 'User not authenticated', data: [] };
    }
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Get friends (accepted relationships)
    const { data, error } = await supabase
      .from('user_relationships')
      .select(`
        id,
        created_at,
        users!user_relationships_friend_id_fkey (
          id,
          clerk_id,
          email
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted');
      
    if (error) {
      console.error('Error fetching friends:', error);
      return { success: false, message: 'Failed to fetch friends', data: [] };
    }
    
    // Format the data
    const formattedData = data.map(item => ({
      relationshipId: item.id,
      userId: item.users.id,
      clerkId: item.users.clerk_id,
      email: item.users.email,
      since: item.created_at
    }));
    
    return { success: true, message: 'Friends fetched successfully', data: formattedData };
  } catch (error) {
    console.error('Error in getFriends:', error);
    return { success: false, message: 'An error occurred', data: [] };
  }
}

/**
 * Get pending friend requests
 */
export async function getPendingFriendRequests() {
  try {
    const userId = await getSupabaseUserId();
    
    if (!userId) {
      return { success: false, message: 'User not authenticated', data: [] };
    }
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Get pending friend requests
    const { data, error } = await supabase
      .from('user_relationships')
      .select(`
        id,
        created_at,
        users!user_relationships_user_id_fkey (
          id,
          clerk_id,
          email
        )
      `)
      .eq('friend_id', userId)
      .eq('status', 'pending');
      
    if (error) {
      console.error('Error fetching friend requests:', error);
      return { success: false, message: 'Failed to fetch friend requests', data: [] };
    }
    
    // Format the data
    const formattedData = data.map(item => ({
      requestId: item.id,
      userId: item.users.id,
      clerkId: item.users.clerk_id,
      email: item.users.email,
      requestedAt: item.created_at
    }));
    
    return { success: true, message: 'Friend requests fetched successfully', data: formattedData };
  } catch (error) {
    console.error('Error in getPendingFriendRequests:', error);
    return { success: false, message: 'An error occurred', data: [] };
  }
}

/**
 * Send a friend request to another user
 */
export async function sendFriendRequest(friendId: string) {
  try {
    const userId = await getSupabaseUserId();
    
    if (!userId) {
      return { success: false, message: 'User not authenticated' };
    }
    
    if (userId === friendId) {
      return { success: false, message: 'You cannot add yourself as a friend' };
    }
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Check if a relationship already exists
    const { data: existingRelationship, error: checkError } = await supabase
      .from('user_relationships')
      .select('id, status')
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing relationship:', checkError);
      return { success: false, message: 'Failed to check existing relationship' };
    }
    
    // If relationship exists, return appropriate message
    if (existingRelationship) {
      if (existingRelationship.status === 'accepted') {
        return { success: false, message: 'You are already friends with this user' };
      } else if (existingRelationship.status === 'pending') {
        return { success: false, message: 'A friend request is already pending' };
      }
    }
    
    // Create new friend request
    const { error: insertError } = await supabase
      .from('user_relationships')
      .insert({
        user_id: userId,
        friend_id: friendId,
        status: 'pending'
      });
      
    if (insertError) {
      console.error('Error sending friend request:', insertError);
      return { success: false, message: 'Failed to send friend request' };
    }
    
    return { success: true, message: 'Friend request sent successfully' };
  } catch (error) {
    console.error('Error in sendFriendRequest:', error);
    return { success: false, message: 'An error occurred' };
  }
}

/**
 * Respond to a friend request (accept or reject)
 */
export async function respondToFriendRequest(requestId: string, accept: boolean) {
  try {
    const userId = await getSupabaseUserId();
    
    if (!userId) {
      return { success: false, message: 'User not authenticated' };
    }
    
    // Initialize Supabase client
    const supabase = createClient();
    
    if (accept) {
      // Accept the friend request
      const { error: updateError } = await supabase
        .from('user_relationships')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .eq('friend_id', userId);
        
      if (updateError) {
        console.error('Error accepting friend request:', updateError);
        return { success: false, message: 'Failed to accept friend request' };
      }
      
      return { success: true, message: 'Friend request accepted' };
    } else {
      // Reject the friend request
      const { error: deleteError } = await supabase
        .from('user_relationships')
        .delete()
        .eq('id', requestId)
        .eq('friend_id', userId);
        
      if (deleteError) {
        console.error('Error rejecting friend request:', deleteError);
        return { success: false, message: 'Failed to reject friend request' };
      }
      
      return { success: true, message: 'Friend request rejected' };
    }
  } catch (error) {
    console.error('Error in respondToFriendRequest:', error);
    return { success: false, message: 'An error occurred' };
  }
}

/**
 * Get friends leaderboard
 */
export async function getFriendsLeaderboard(timeframe = 'all-time', limit = 10) {
  try {
    const userId = await getSupabaseUserId();
    
    if (!userId) {
      return { success: false, message: 'User not authenticated', data: [] };
    }
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Build the query based on timeframe
    let query = supabase
      .from('user_game_history')
      .select(`
        id,
        user_id,
        score,
        correct_answers,
        total_questions,
        difficulty,
        created_at,
        users (
          email
        )
      `)
      .or(`user_id.eq.${userId},user_id.in.(
        select friend_id from user_relationships 
        where user_id = ${userId} and status = 'accepted'
        union
        select user_id from user_relationships 
        where friend_id = ${userId} and status = 'accepted'
      )`)
      .order('score', { ascending: false });
      
    // Add timeframe filter if needed
    if (timeframe !== 'all-time') {
      const now = new Date();
      let startDate;
      
      if (timeframe === 'daily') {
        startDate = new Date(now.setHours(0, 0, 0, 0));
      } else if (timeframe === 'weekly') {
        const day = now.getDay();
        startDate = new Date(now.setDate(now.getDate() - day));
        startDate.setHours(0, 0, 0, 0);
      } else if (timeframe === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
    }
    
    // Execute the query with limit
    const { data, error } = await query.limit(limit);
      
    if (error) {
      console.error('Error fetching leaderboard:', error);
      return { success: false, message: 'Failed to fetch leaderboard', data: [] };
    }
    
    // Format the data
    const formattedData = data.map(item => ({
      gameId: item.id,
      userId: item.user_id,
      email: item.users.email,
      score: item.score,
      correctAnswers: item.correct_answers,
      totalQuestions: item.total_questions,
      difficulty: item.difficulty,
      gameDate: item.created_at,
      isCurrentUser: item.user_id === userId
    }));
    
    return { success: true, message: 'Leaderboard fetched successfully', data: formattedData };
  } catch (error) {
    console.error('Error in getFriendsLeaderboard:', error);
    return { success: false, message: 'An error occurred', data: [] };
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
 * @returns Game history or empty array if not found
 */
export async function getUserGameHistory(limit = 10) {
  try {
    const userId = await getSupabaseUserId();
    
    if (!userId) {
      return [];
    }
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Get game history
    const { data, error } = await supabase
      .from('user_game_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching game history:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserGameHistory:', error);
    return [];
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
      return { success: false, message: 'User not authenticated' };
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
      return { success: false, message: 'Failed to save game history' };
    }
    
    // Update user stats
    await updateUserStats(userId, gameData);
    
    return { success: true, message: 'Game history saved successfully', gameId: data[0].id };
  } catch (error) {
    console.error('Error in saveUserGameHistory:', error);
    return { success: false, message: 'An error occurred' };
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
      return { success: false, message: 'User not authenticated or invalid game ID' };
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
      return { success: false, message: 'Failed to save question history' };
    }
    
    return { success: true, message: 'Question history saved successfully' };
  } catch (error) {
    console.error('Error in saveUserQuestionHistory:', error);
    return { success: false, message: 'An error occurred' };
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
      
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
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
    
    const statsData = {
      user_id: userId,
      total_games: totalGames,
      total_correct_answers: totalCorrectAnswers,
      total_questions_attempted: totalQuestionsAttempted,
      win_rate: winRate,
      current_streak: currentStreak,
      best_streak: bestStreak,
      last_played_at: new Date().toISOString()
    };
    
    if (!currentStats) {
      // Insert new stats record if it doesn't exist
      const { error: insertError } = await supabase
        .from('user_stats')
        .insert([statsData]);
        
      if (insertError) {
        console.error('Error inserting user stats:', insertError);
      }
    } else {
      // Update existing stats
      const { error: updateError } = await supabase
        .from('user_stats')
        .update(statsData)
        .eq('user_id', userId);
        
      if (updateError) {
        console.error('Error updating user stats:', updateError);
      }
    }
  } catch (error) {
    console.error('Error in updateUserStats:', error);
  }
} 