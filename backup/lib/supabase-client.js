/**
 * Utility functions for Supabase client initialization and error handling
 */
import { createBrowserClient } from '@supabase/ssr';

// Cache the client instance to avoid creating multiple instances
let cachedClient = null;

/**
 * Creates a Supabase client with error handling
 * @returns {Object|null} The Supabase client or null if initialization failed
 */
export function createSafeClient() {
  // Return cached client if available
  if (cachedClient) return cachedClient;
  
  try {
    // Create new client
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Cache the client for future use
    cachedClient = supabase;
    return supabase;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
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
  // Use sessionStorage for caching if available
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const cached = sessionStorage.getItem('colleges');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Failed to parse cached colleges:', e);
      }
    }
  }
  
  const { data, success } = await safeQuery(
    supabase => supabase.from('colleges').select('id, name').order('name'),
    []
  );
  
  // Cache the result if successful
  if (success && data && data.length > 0 && typeof window !== 'undefined' && window.sessionStorage) {
    try {
      sessionStorage.setItem('colleges', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to cache colleges:', e);
    }
  }
  
  return data || [];
} 