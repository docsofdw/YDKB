export async function getPlayerImage(playerName: string): Promise<string | null> {
  try {
    // Use our new API endpoint to get player image
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(
        `/api/player/${encodeURIComponent(playerName)}`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Return the image URL if available
      if (data && data.image_url) {
        return data.image_url;
      }
      
      // If no image URL but we have player data, return null to trigger fallback
      return null;
    } catch (fetchError: unknown) {
      if (fetchError && typeof fetchError === 'object' && 'name' in fetchError && fetchError.name === 'AbortError') {
        console.warn('Fetch request timed out for player image');
      } else {
        console.error('Error in fetch request:', fetchError);
      }
      // Continue to fallback
      return null;
    }
  } catch (error) {
    console.error('Error in getPlayerImage:', error);
    return null;
  }
}

/**
 * Generate initials from a player name
 * This is used as a fallback when no image is available
 */
export function getPlayerInitials(playerName: string): string {
  if (!playerName) return '?';
  
  return playerName
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
} 