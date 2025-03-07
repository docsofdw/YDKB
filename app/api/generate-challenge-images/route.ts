import { NextResponse } from 'next/server';
import { generatePlayerImage, getGenerationResult } from "@/app/lib/imageGeneration";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  console.log("Generate challenge images endpoint hit");
  
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
    console.log("Getting today's and tomorrow's challenges");
    // Get today's and tomorrow's challenges
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    console.log("Looking for challenges on dates:", { today: todayStr, tomorrow: tomorrowStr });

    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('*')
      .in('date', [todayStr, tomorrowStr])
      .order('date', { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    console.log("Found challenges:", challenges);

    if (!challenges || challenges.length === 0) {
      console.log("No challenges found for today or tomorrow");
      return NextResponse.json(
        { message: "No challenges found for today or tomorrow" },
        { status: 404 }
      );
    }

    const results = [];

    // Generate images for each challenge
    for (const challenge of challenges) {
      console.log(`Generating image for challenge: ${challenge.player_name} (${challenge.college_name})`);
      
      const prediction = await generatePlayerImage(
        challenge.player_name,
        challenge.college_name
      );
      
      console.log("Generation started:", prediction);
      
      // Wait for result
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

      if (result.status === "succeeded" && result.output) {
        console.log(`Updating challenge ${challenge.id} with image URL:`, result.output[0]);
        // Update the challenge with the generated image URL
        const { error: updateError } = await supabase
          .from('challenges')
          .update({ image_url: result.output[0] })
          .eq('id', challenge.id);

        if (updateError) {
          console.error(`Error updating challenge ${challenge.id}:`, updateError);
        }
      }

      results.push({
        challenge_id: challenge.id,
        date: challenge.date,
        player_name: challenge.player_name,
        college_name: challenge.college_name,
        prediction,
        result,
        imageUrl: result.status === "succeeded" && result.output ? result.output[0] : null
      });
    }
    
    return NextResponse.json({ 
      message: "Images generated successfully",
      results
    });
  } catch (error) {
    console.error("Error generating challenge images:", error);
    return NextResponse.json(
      { 
        message: "Error generating challenge images", 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 