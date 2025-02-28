export async function getPlayerImage(playerName: string): Promise<string | null> {
  try {
    // Fallback images for common players (to avoid API calls)
    const fallbackImages: Record<string, string> = {
      'Randall Cunningham': 'https://www.thesportsdb.com/images/media/player/thumb/7i1hqx1520188106.jpg',
      'Tom Brady': 'https://www.thesportsdb.com/images/media/player/thumb/ot0n9t1582135052.jpg',
      'Patrick Mahomes': 'https://www.thesportsdb.com/images/media/player/thumb/9rik8v1579611775.jpg',
      'Jerry Rice': 'https://www.thesportsdb.com/images/media/player/thumb/6vz9oy1520188106.jpg',
      'Peyton Manning': 'https://www.thesportsdb.com/images/media/player/thumb/ynv1uf1520188106.jpg'
    };
    
    // Check if we have a fallback image for this player
    if (fallbackImages[playerName]) {
      return fallbackImages[playerName];
    }
    
    // Using TheSportsDB (free tier)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(playerName)}`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Handle rate limits
        if (response.status === 429) {
          console.warn('Rate limit exceeded for TheSportsDB API');
          return null;
        }
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if player was found and has an image
      if (data.player && data.player.length > 0) {
        // Find the NFL player (there might be players with the same name in different sports)
        const nflPlayer = data.player.find((p: any) => 
          p.strSport === "American Football" || p.strTeam?.includes("NFL")
        );
        
        if (nflPlayer && nflPlayer.strThumb) {
          return nflPlayer.strThumb;
        } else if (data.player[0].strThumb) {
          // Fallback to first player if no explicit NFL player found
          return data.player[0].strThumb;
        }
      }
    } catch (fetchError: unknown) {
      if (fetchError && typeof fetchError === 'object' && 'name' in fetchError && fetchError.name === 'AbortError') {
        console.warn('Fetch request timed out for player image');
      } else {
        console.error('Error in fetch request:', fetchError);
      }
      // Continue to fallback
    }
    
    // Fallback to a generic player silhouette
    return 'https://www.thesportsdb.com/images/media/player/thumb/placeholder.png';
  } catch (error) {
    console.error('Error in getPlayerImage:', error);
    return null;
  }
} 