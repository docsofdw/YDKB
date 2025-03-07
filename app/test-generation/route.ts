import { NextResponse } from 'next/server';
import { generatePlayerImage, getGenerationResult } from "@/app/lib/imageGeneration";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  console.log("Test generation endpoint hit");
  
  // Check for a secret token in the query parameters
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  
  console.log("Received token:", token);
  console.log("Expected token:", process.env.ADMIN_API_KEY);
  
  // Only allow access with the correct token
  if (token !== process.env.ADMIN_API_KEY) {
    console.log("Unauthorized access attempt");
    return NextResponse.json(
      { message: "Unauthorized", receivedToken: token },
      { status: 401 }
    );
  }

  try {
    console.log("Starting test generation");
    // Start a test generation
    const prediction = await generatePlayerImage(
      "Test Player", 
      "Test University"
    );
    
    console.log("Generation started:", prediction);
    
    // Wait for result (in production, don't wait in the API call)
    let result;
    let attempts = 0;
    do {
      await new Promise(resolve => setTimeout(resolve, 2000));
      result = await getGenerationResult(prediction.id);
      attempts++;
      console.log(`Attempt ${attempts}: Status = ${result.status}`);
      if (attempts > 15) break; // Max 30 seconds
    } while (result.status !== "succeeded" && result.status !== "failed");
    
    console.log("Final result:", result);
    
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
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 