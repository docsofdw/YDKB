import { NextResponse } from 'next/server';
import { getGenerationResult } from '@/app/lib/imageGeneration';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: "Missing prediction ID" },
        { status: 400 }
      );
    }
    
    const result = await getGenerationResult(id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { 
        message: "Error checking generation status", 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 