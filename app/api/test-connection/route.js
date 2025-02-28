import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create a Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    // Test connection to Supabase
    const startTime = Date.now();
    
    // Check if we can connect to Supabase
    const { data: connectionTest, error: connectionError } = await supabase.from('_test_connection').select('*').limit(1).catch(err => {
      return { data: null, error: err };
    });
    
    // Check if colleges table exists
    const { data: colleges, error: collegesError } = await supabase.from('colleges').select('id').limit(1).catch(err => {
      return { data: null, error: err };
    });
    
    // Check if players table exists
    const { data: players, error: playersError } = await supabase.from('players').select('id').limit(1).catch(err => {
      return { data: null, error: err };
    });
    
    // Check if daily_challenges table exists
    const { data: challenges, error: challengesError } = await supabase.from('daily_challenges').select('id').limit(1).catch(err => {
      return { data: null, error: err };
    });
    
    const responseTime = Date.now() - startTime;
    
    // Build response
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      response_time_ms: responseTime,
      connection: {
        success: !connectionError,
        error: connectionError ? connectionError.message : null
      },
      tables: {
        colleges: {
          exists: !collegesError,
          count: colleges ? colleges.length : 0,
          error: collegesError ? collegesError.message : null
        },
        players: {
          exists: !playersError,
          count: players ? players.length : 0,
          error: playersError ? playersError.message : null
        },
        daily_challenges: {
          exists: !challengesError,
          count: challenges ? challenges.length : 0,
          error: challengesError ? challengesError.message : null
        }
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        error: error.message || 'An error occurred',
        timestamp: new Date().toISOString(),
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL
      },
      { status: 500 }
    );
  }
} 