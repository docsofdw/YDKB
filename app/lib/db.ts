import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

/**
 * Store a player image URL in the database
 */
export async function storePlayerImage(
  playerId: string,
  imageUrl: string,
  difficulty: string,
  challengeDate: Date = new Date()
): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('player_images')
      .upsert({
        player_id: playerId,
        image_url: imageUrl,
        difficulty: difficulty,
        challenge_date: challengeDate.toISOString().split('T')[0]
      }, {
        onConflict: 'player_id, challenge_date',
        returning: true
      });
      
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Database error storing image:", error);
    throw error;
  }
}

/**
 * Retrieve a player image from the database
 */
export async function getPlayerImage(
  playerId: string,
  challengeDate: Date = new Date()
): Promise<string | null> {
  try {
    const dateStr = challengeDate.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('player_images')
      .select('image_url')
      .eq('player_id', playerId)
      .eq('challenge_date', dateStr)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return data?.image_url || null;
  } catch (error) {
    console.error("Database error retrieving image:", error);
    throw error;
  }
} 