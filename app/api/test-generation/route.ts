import { NextResponse } from 'next/server';
import { generatePlayerImage, getGenerationResult } from "@/app/lib/imageGeneration";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  // Check for a secret token in the query parameters
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  
  // Only allow access with the correct token
  if (token !== process.env.ADMIN_API_KEY) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Start a test generation
    const prediction = await generatePlayerImage(
      "Test Player", 
      "Test University",
      "easy"
    );
    
    // Wait for result (in production, don't wait in the API call)
    let result;
    let attempts = 0;
    do {
      await new Promise(resolve => setTimeout(resolve, 2000));
      result = await getGenerationResult(prediction.id);
      attempts++;
      if (attempts > 15) break; // Max 30 seconds
    } while (result.status !== "succeeded" && result.status !== "failed");
    
    return NextResponse.json({ 
      prediction, 
      result,
      imageUrl: result.status === "succeeded" && result.output ? result.output[0] : null
    });
  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json(
      { 
        message: "Error testing generation", 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 