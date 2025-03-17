import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request) {
  try {
    console.log('Running daily challenge refresh cron job');
    
    // Get the API key from environment variables
    const apiKey = process.env.DAILY_CHALLENGE_API_KEY;
    
    if (!apiKey) {
      console.error('DAILY_CHALLENGE_API_KEY not set in environment variables');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }
    
    // Call the refresh endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/daily-challenge/refresh?key=${apiKey}`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error refreshing daily challenge:', errorData);
      return NextResponse.json(
        { error: 'Failed to refresh daily challenge', details: errorData },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('Daily challenge refresh successful:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Daily challenge refresh cron job completed successfully',
      result: data
    });
    
  } catch (error) {
    console.error('Cron job error:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred during cron job execution' },
      { status: 500 }
    );
  }
} 