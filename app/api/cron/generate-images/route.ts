import { NextResponse } from 'next/server';
import { imageQueue } from '@/app/lib/imageQueue';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// This endpoint will be called by a scheduled job
export async function POST(request: Request) {
  // Only allow POST with valid cron secret
  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Fetch players for upcoming challenges (7 days in advance)
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + 7); // One week from now
    
    const targetDateStr = targetDate.toISOString().split('T')[0];
    
    // Get scheduled challenges from your database
    const supabase = createClientComponentClient();
    const { data: challenges, error } = await supabase
      .from('daily_challenges')
      .select('player_id, player_name, college, difficulty')
      .eq('challenge_date', targetDateStr)
      .order('difficulty');
      
    if (error) throw error;
    
    if (!challenges || challenges.length === 0) {
      return NextResponse.json({ 
        message: "No challenges found for target date", 
        date: targetDateStr 
      });
    }
    
    // Schedule image generation for each player
    for (const player of challenges) {
      await imageQueue.addToQueue({
        playerId: player.player_id,
        playerName: player.player_name,
        collegeName: player.college,
        difficulty: player.difficulty,
        challengeDate: new Date(targetDateStr)
      });
    }
    
    return NextResponse.json({ 
      message: `Scheduled generation for ${challenges.length} players`,
      date: targetDateStr,
      queueLength: imageQueue.queue.length
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { 
        message: "Error scheduling generation", 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 