/**
 * DEPRECATED: This file contains server-side code that should not be used in client components.
 * 
 * For server-side operations, use user-actions.ts instead.
 * For client-side operations, use user-utils-client.ts instead.
 * For Supabase client operations, use supabase-client.ts instead.
 */

// This file is kept for backward compatibility but should not be used in new code.
// It will be removed in a future update.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';

/**
 * Create a Supabase client with proper headers to prevent 406 errors
 * @returns Supabase client
 */
function createClient() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
      global: {
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
        },
      },
    }
  );
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

/**
 * Send a friend request to another user
 * @param friendId The ID of the user to send a friend request to
 * @returns Object with success status and message
 */
export async function sendFriendRequest(friendId: string) {
  try {
    const userId = await getSupabaseUserId();
    
    if (!userId) {
      return { success: false, message: 'User not authenticated' };
    }
    
    if (userId === friendId) {
      return { success: false, message: 'Cannot send friend request to yourself' };
    }
    
    const supabase = createClient();
    
    // Check if a relationship already exists
    const { data: existingRelationship, error: checkError } = await supabase
      .from('friend_relationships')
      .select('*')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .or(`user_id.eq.${friendId},friend_id.eq.${friendId}`)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is expected
      console.error('Error checking existing relationship:', checkError);
      return { success: false, message: 'Error checking existing relationship' };
    }
    
    if (existingRelationship) {
      return { 
        success: false, 
        message: `A relationship already exists with status: ${existingRelationship.status}` 
      };
    }
    
    // Create the friend request
    const { error } = await supabase
      .from('friend_relationships')
      .insert({
        user_id: userId,
        friend_id: friendId,
        status: 'pending'
      });
      
    if (error) {
      console.error('Error sending friend request:', error);
      return { success: false, message: 'Error sending friend request' };
    }
    
    return { success: true, message: 'Friend request sent successfully' };
  } catch (error) {
    console.error('Error in sendFriendRequest:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}

/**
 * Respond to a friend request
 * @param requestId The ID of the friend request
 * @param accept Whether to accept or reject the request
 * @returns Object with success status and message
 */
export async function respondToFriendRequest(requestId: string, accept: boolean) {
  try {
    const userId = await getSupabaseUserId();
    
    if (!userId) {
      return { success: false, message: 'User not authenticated' };
    }
    
    const supabase = createClient();
    
    // Get the friend request
    const { data: friendRequest, error: getError } = await supabase
      .from('friend_relationships')
      .select('*')
      .eq('id', requestId)
      .eq('friend_id', userId) // Ensure the request is directed to the current user
      .eq('status', 'pending')
      .single();
      
    if (getError || !friendRequest) {
      console.error('Error getting friend request:', getError);
      return { success: false, message: 'Friend request not found' };
    }
    
    // Update the request status
    const newStatus = accept ? 'accepted' : 'rejected';
    const { error: updateError } = await supabase
      .from('friend_relationships')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', requestId);
      
    if (updateError) {
      console.error('Error updating friend request:', updateError);
      return { success: false, message: 'Error updating friend request' };
    }
    
    return { 
      success: true, 
      message: accept ? 'Friend request accepted' : 'Friend request rejected' 
    };
  } catch (error) {
    console.error('Error in respondToFriendRequest:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}

/**
 * Get a list of the user's friends
 * @returns Array of friends with their basic info
 */
export async function getFriends() {
  try {
    const userId = await getSupabaseUserId();
    
    if (!userId) {
      return { success: false, data: [], message: 'User not authenticated' };
    }
    
    const supabase = createClient();
    
    // Get friends where the user is the requester
    const { data: sentRequests, error: sentError } = await supabase
      .from('friend_relationships')
      .select(`
        id,
        status,
        created_at,
        updated_at,
        friend:friend_id (
          id,
          clerk_id,
          email
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted');
      
    if (sentError) {
      console.error('Error getting sent friend requests:', sentError);
      return { success: false, data: [], message: 'Error getting friends' };
    }
    
    // Get friends where the user is the recipient
    const { data: receivedRequests, error: receivedError } = await supabase
      .from('friend_relationships')
      .select(`
        id,
        status,
        created_at,
        updated_at,
        friend:user_id (
          id,
          clerk_id,
          email
        )
      `)
      .eq('friend_id', userId)
      .eq('status', 'accepted');
      
    if (receivedError) {
      console.error('Error getting received friend requests:', receivedError);
      return { success: false, data: [], message: 'Error getting friends' };
    }
    
    // Combine and format the results
    const sentFriends = sentRequests.map(req => ({
      relationshipId: req.id,
      userId: req.friend.id,
      clerkId: req.friend.clerk_id,
      email: req.friend.email,
      since: req.created_at
    }));
    
    const receivedFriends = receivedRequests.map(req => ({
      relationshipId: req.id,
      userId: req.friend.id,
      clerkId: req.friend.clerk_id,
      email: req.friend.email,
      since: req.created_at
    }));
    
    const allFriends = [...sentFriends, ...receivedFriends];
    
    return { success: true, data: allFriends, message: 'Friends retrieved successfully' };
  } catch (error) {
    console.error('Error in getFriends:', error);
    return { success: false, data: [], message: 'An unexpected error occurred' };
  }
}

/**
 * Get pending friend requests for the current user
 * @returns Array of pending friend requests
 */
export async function getPendingFriendRequests() {
  try {
    const userId = await getSupabaseUserId();
    
    if (!userId) {
      return { success: false, data: [], message: 'User not authenticated' };
    }
    
    const supabase = createClient();
    
    // Get pending requests where the user is the recipient
    const { data: pendingRequests, error } = await supabase
      .from('friend_relationships')
      .select(`
        id,
        created_at,
        requester:user_id (
          id,
          clerk_id,
          email
        )
      `)
      .eq('friend_id', userId)
      .eq('status', 'pending');
      
    if (error) {
      console.error('Error getting pending friend requests:', error);
      return { success: false, data: [], message: 'Error getting pending requests' };
    }
    
    // Format the results
    const formattedRequests = pendingRequests.map(req => ({
      requestId: req.id,
      userId: req.requester.id,
      clerkId: req.requester.clerk_id,
      email: req.requester.email,
      requestedAt: req.created_at
    }));
    
    return { 
      success: true, 
      data: formattedRequests, 
      message: 'Pending requests retrieved successfully' 
    };
  } catch (error) {
    console.error('Error in getPendingFriendRequests:', error);
    return { success: false, data: [], message: 'An unexpected error occurred' };
  }
}

/**
 * Get the friends leaderboard
 * @param timeframe 'daily', 'weekly', 'monthly', or 'all-time'
 * @param limit Number of results to return
 * @returns Array of friends with their scores
 */
export async function getFriendsLeaderboard(timeframe = 'all-time', limit = 10) {
  try {
    const userId = await getSupabaseUserId();
    
    if (!userId) {
      return { success: false, data: [], message: 'User not authenticated' };
    }
    
    const supabase = createClient();
    
    // Get the user's friends
    const friendsResult = await getFriends();
    
    if (!friendsResult.success || friendsResult.data.length === 0) {
      return { 
        success: true, 
        data: [], 
        message: 'No friends found or error retrieving friends' 
      };
    }
    
    const friendIds = friendsResult.data.map(friend => friend.userId);
    // Add the current user to include them in the leaderboard
    friendIds.push(userId);
    
    let query = supabase
      .from('user_game_history')
      .select(`
        id,
        score,
        correct_answers,
        total_questions,
        difficulty,
        game_date,
        user:user_id (
          id,
          clerk_id,
          email
        )
      `)
      .in('user_id', friendIds)
      .order('score', { ascending: false })
      .limit(limit);
    
    // Apply timeframe filter
    const now = new Date();
    if (timeframe === 'daily') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      query = query.gte('game_date', today);
    } else if (timeframe === 'weekly') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      query = query.gte('game_date', weekAgo.toISOString());
    } else if (timeframe === 'monthly') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      query = query.gte('game_date', monthAgo.toISOString());
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error getting friends leaderboard:', error);
      return { success: false, data: [], message: 'Error getting leaderboard' };
    }
    
    // Format the results
    const leaderboard = data.map(entry => ({
      gameId: entry.id,
      userId: entry.user.id,
      email: entry.user.email,
      score: entry.score,
      correctAnswers: entry.correct_answers,
      totalQuestions: entry.total_questions,
      difficulty: entry.difficulty,
      gameDate: entry.game_date,
      isCurrentUser: entry.user.id === userId
    }));
    
    return { 
      success: true, 
      data: leaderboard, 
      message: 'Leaderboard retrieved successfully' 
    };
  } catch (error) {
    console.error('Error in getFriendsLeaderboard:', error);
    return { success: false, data: [], message: 'An unexpected error occurred' };
  }
}

// Re-export functions from user-actions.ts for backward compatibility
export { 
  getSupabaseUserId,
  getFriends,
  getPendingFriendRequests,
  sendFriendRequest,
  respondToFriendRequest,
  getFriendsLeaderboard
} from './user-actions'; 