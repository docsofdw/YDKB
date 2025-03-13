'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PlayerImageProps {
  playerName: string;
  size?: number;
  className?: string;
}

interface PlayerData {
  player_name: string;
  image_url: string | null;
  image_type: 'url' | 'initials';
  initials: string | null;
}

/**
 * PlayerImage component that displays a player's image or initials as fallback
 */
export default function PlayerImage({ playerName, size = 64, className = '' }: PlayerImageProps) {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate random background color based on player name
  const getBackgroundColor = (name: string) => {
    // Simple hash function to generate a consistent color for the same name
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // Generate HSL color with high saturation and medium lightness for good contrast
    const h = Math.abs(hash % 360);
    return `hsl(${h}, 65%, 55%)`;
  };

  useEffect(() => {
    if (!playerName) {
      setLoading(false);
      return;
    }

    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/player/${encodeURIComponent(playerName)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch player data: ${response.status}`);
        }
        
        const data = await response.json();
        setPlayerData(data);
      } catch (err) {
        console.error('Error fetching player data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Create fallback data with initials
        const initials = playerName
          .split(' ')
          .map(part => part.charAt(0))
          .join('')
          .toUpperCase();
          
        setPlayerData({
          player_name: playerName,
          image_url: null,
          image_type: 'initials',
          initials: initials
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerName]);

  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="animate-pulse bg-gray-300 rounded-full" style={{ width: size * 0.8, height: size * 0.8 }}></div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-gray-500 font-bold" style={{ fontSize: size * 0.4 }}>?</span>
      </div>
    );
  }

  // If we have an image URL, display it
  if (playerData.image_url) {
    return (
      <div 
        className={`relative overflow-hidden rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={playerData.image_url}
          alt={playerData.player_name}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => {
            // If image fails to load, switch to initials
            setPlayerData({
              ...playerData,
              image_url: null,
              image_type: 'initials',
              initials: playerData.player_name
                .split(' ')
                .map(part => part.charAt(0))
                .join('')
                .toUpperCase()
            });
          }}
        />
      </div>
    );
  }

  // Fallback to initials
  const initials = playerData.initials || playerData.player_name.charAt(0).toUpperCase();
  const bgColor = getBackgroundColor(playerData.player_name);

  return (
    <div 
      className={`flex items-center justify-center rounded-full ${className}`}
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: bgColor,
        color: 'white',
        fontSize: size * 0.4,
        fontWeight: 'bold'
      }}
    >
      {initials}
    </div>
  );
} 