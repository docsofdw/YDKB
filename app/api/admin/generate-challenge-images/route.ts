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

    // Test Supabase connection
    const { data: testData, error: testError } = await supabase
      .from('daily_challenges')
      .select('count')
      .limit(1);

    if (testError) {
      console.error("Supabase connection test failed:", testError);
      throw new Error(`Supabase connection error: ${testError.message}`);
    }

    console.log("Supabase connection test successful");

    const { data: challenges, error } = await supabase
      .from('daily_challenges')
      .select('id, challenge_date, easy_player_id, hard_player_id')
      .in('challenge_date', [todayStr, tomorrowStr])
      .order('challenge_date', { ascending: true });

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
      // Get the player information from the players table using the player IDs
      const { data: easyPlayer, error: easyPlayerError } = await supabase
        .from('players')
        .select('name, college')
        .eq('id', challenge.easy_player_id)
        .single();

      if (easyPlayerError) {
        console.error("Error fetching easy player:", easyPlayerError);
        continue;
      }

      console.log(`Generating image for easy player: ${easyPlayer.name} (${easyPlayer.college})`);
      
      const prediction = await generatePlayerImage(
        easyPlayer.name,
        easyPlayer.college,
        'easy'
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
        // Create a new entry in the player_images table
        const { error: insertError } = await supabase
          .from('player_images')
          .insert({
            player_id: challenge.easy_player_id,
            image_url: result.output[0],
            difficulty: 'easy',
            challenge_date: challenge.challenge_date
          });

        if (insertError) {
          console.error(`Error inserting image for player ${challenge.easy_player_id}:`, insertError);
        }
      }

      // Do the same for hard player
      const { data: hardPlayer, error: hardPlayerError } = await supabase
        .from('players')
        .select('name, college')
        .eq('id', challenge.hard_player_id)
        .single();

      if (hardPlayerError) {
        console.error("Error fetching hard player:", hardPlayerError);
        continue;
      }

      console.log(`Generating image for hard player: ${hardPlayer.name} (${hardPlayer.college})`);
      
      const hardPrediction = await generatePlayerImage(
        hardPlayer.name,
        hardPlayer.college,
        'hard'
      );
      
      console.log("Generation started:", hardPrediction);
      
      // Wait for result
      let hardResult;
      attempts = 0;
      do {
        await new Promise(resolve => setTimeout(resolve, 2000));
        hardResult = await getGenerationResult(hardPrediction.id);
        attempts++;
        console.log(`Attempt ${attempts}: Status = ${hardResult.status}`);
        if (attempts > 15) break; // Max 30 seconds
      } while (hardResult.status !== "succeeded" && hardResult.status !== "failed");

      console.log("Final result:", hardResult);

      if (hardResult.status === "succeeded" && hardResult.output) {
        // Create a new entry in the player_images table
        const { error: insertError } = await supabase
          .from('player_images')
          .insert({
            player_id: challenge.hard_player_id,
            image_url: hardResult.output[0],
            difficulty: 'hard',
            challenge_date: challenge.challenge_date
          });

        if (insertError) {
          console.error(`Error inserting image for player ${challenge.hard_player_id}:`, insertError);
        }
      }

      results.push({
        challenge_id: challenge.id,
        challenge_date: challenge.challenge_date,
        easy_player: {
          id: challenge.easy_player_id,
          name: easyPlayer.name,
          college: easyPlayer.college,
          prediction,
          result,
          imageUrl: result.status === "succeeded" && result.output ? result.output[0] : null
        },
        hard_player: {
          id: challenge.hard_player_id,
          name: hardPlayer.name,
          college: hardPlayer.college,
          prediction: hardPrediction,
          result: hardResult,
          imageUrl: hardResult.status === "succeeded" && hardResult.output ? hardResult.output[0] : null
        }
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