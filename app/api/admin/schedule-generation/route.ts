import { NextResponse } from 'next/server';
import { imageQueue } from '@/app/lib/imageQueue';

// Basic auth middleware for admin endpoints
function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  // Compare with your admin API key
  const token = authHeader.split(' ')[1];
  return token === process.env.ADMIN_API_KEY;
}

export async function POST(request: Request) {
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { players } = await request.json();
    
    if (!Array.isArray(players) || players.length === 0) {
      return NextResponse.json(
        { message: "Missing or invalid players array" },
        { status: 400 }
      );
    }
    
    // Add each player to the generation queue
    for (const player of players) {
      await imageQueue.addToQueue({
        playerId: player.id,
        playerName: player.name,
        collegeName: player.college,
        difficulty: player.difficulty,
        challengeDate: player.date ? new Date(player.date) : new Date()
      });
    }
    
    return NextResponse.json({ 
      message: `Scheduled generation for ${players.length} players`,
      queueLength: imageQueue.queue.length
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { 
        message: "Error scheduling generation", 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 