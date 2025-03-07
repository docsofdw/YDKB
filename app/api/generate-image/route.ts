import { NextResponse } from 'next/server';
import { generatePlayerImage } from '@/app/lib/imageGeneration';

export async function POST(request: Request) {
  try {
    const { playerName, collegeName, difficulty = 'easy' } = await request.json();
    
    if (!playerName || !collegeName) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }
    
    const prediction = await generatePlayerImage(playerName, collegeName, difficulty);
    
    return NextResponse.json({ 
      id: prediction.id,
      status: prediction.status
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { 
        message: "Error generating image", 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 