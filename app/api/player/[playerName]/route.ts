import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Generate initials from a player name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

/**
 * GET handler for /api/player/[playerName]
 * Fetches player data from TheSportsDB and stores it in Supabase
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { playerName: string } }
) {
  try {
    const { playerName } = params;
    const apiKey = process.env.THESPORTSDB_API_KEY || '3'; // Fallback to '3' if not set

    // Check if player already exists in our database
    const { data: existingPlayer, error: fetchError } = await supabase
      .from('players')
      .select('*')
      .eq('player_name', playerName)
      .single();

    // If player exists and has image data, return it
    if (existingPlayer && !fetchError && existingPlayer.image_url) {
      return NextResponse.json(existingPlayer);
    }

    // Fetch data from TheSportsDB
    const url = `https://www.thesportsdb.com/api/v1/json/${apiKey}/searchplayers.php?p=${encodeURIComponent(playerName)}`;
    
    const response = await fetch(url, { next: { revalidate: 86400 } }); // Cache for 24 hours
    
    if (!response.ok) {
      throw new Error(`TheSportsDB API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    const players = data.player || [];
    
    // Find the NFL player if possible
    const nflPlayer = players.find((p: any) => 
      p.strSport === "American Football" || 
      (p.strTeam && p.strTeam.includes("NFL"))
    ) || players[0];
    
    if (!nflPlayer) {
      // If no player found, create a record with initials as placeholder
      const initials = getInitials(playerName);
      
      try {
        // Try with all fields first
        const { data: newPlayer, error: insertError } = await supabase
          .from('players')
          .upsert({
            player_name: playerName,
            image_url: null,
            last_updated: new Date().toISOString()
          }, { onConflict: 'player_name' })
          .select()
          .single();
        
        if (!insertError) {
          return NextResponse.json({
            ...newPlayer,
            initials: initials,
            image_type: 'initials'
          });
        }
      } catch (err) {
        console.warn('Error with full upsert, trying minimal fields:', err);
      }
      
      // Fallback to minimal fields if the first attempt fails
      const { data: minimalPlayer, error: minimalError } = await supabase
        .from('players')
        .upsert({
          player_name: playerName,
          image_url: null
        }, { onConflict: 'player_name' })
        .select()
        .single();
      
      if (minimalError) {
        throw new Error(`Error inserting player with minimal fields: ${minimalError.message}`);
      }
      
      return NextResponse.json({
        ...minimalPlayer,
        initials: initials,
        image_type: 'initials'
      });
    }
    
    // Extract relevant data
    const { strPlayer, strThumb, strCutout } = nflPlayer;
    const imageUrl = strThumb || strCutout || null;
    const initials = imageUrl ? null : getInitials(strPlayer || playerName);
    
    try {
      // Try with all fields first
      const { data: upsertedPlayer, error: upsertError } = await supabase
        .from('players')
        .upsert({
          player_name: strPlayer || playerName,
          image_url: imageUrl,
          last_updated: new Date().toISOString()
        }, { onConflict: 'player_name' })
        .select()
        .single();
      
      if (!upsertError) {
        return NextResponse.json({
          ...upsertedPlayer,
          initials: initials,
          image_type: imageUrl ? 'url' : 'initials'
        });
      }
    } catch (err) {
      console.warn('Error with full upsert, trying minimal fields:', err);
    }
    
    // Fallback to minimal fields if the first attempt fails
    const { data: minimalPlayer, error: minimalError } = await supabase
      .from('players')
      .upsert({
        player_name: strPlayer || playerName,
        image_url: imageUrl
      }, { onConflict: 'player_name' })
      .select()
      .single();
    
    if (minimalError) {
      throw new Error(`Error upserting player with minimal fields: ${minimalError.message}`);
    }
    
    return NextResponse.json({
      ...minimalPlayer,
      initials: initials,
      image_type: imageUrl ? 'url' : 'initials'
    });
  } catch (error) {
    console.error('Error in player API route:', error);
    
    // Return a fallback response with initials
    const initials = getInitials(params.playerName);
    return NextResponse.json({
      player_name: params.playerName,
      image_url: null,
      image_type: 'initials',
      initials: initials
    });
  }
} 