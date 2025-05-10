'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getPlayerImageUrl, supabaseImageLoader } from '@/app/lib/supabase-client';

interface PlayerImageProps {
  playerId?: string | number;
  playerName?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  size?: 'large' | 'medium' | 'small' | number;
}

const PlayerImage = React.memo(function PlayerImage({
  playerId,
  playerName,
  alt,
  className = "",
  priority = false,
  onLoad,
  size = 'medium'
}: PlayerImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  
  // Determine the alt text
  const imageAlt = alt || (playerName ? `Image of ${playerName}` : "Player image");
  
  // Get the image URL
  const imageUrl = playerId 
    ? getPlayerImageUrl(playerId)
    : `/images/players/${playerName?.toLowerCase().replace(/\s+/g, '-')}.jpg`;
  
  // Fallback to a placeholder if needed
  const fallbackUrl = '/images/player-placeholder.png';
  
  // Determine sizes based on the size prop
  let width = 192;
  let height = 192;
  let sizeClass = '';
  let sizesAttr = '';
  
  if (typeof size === 'number') {
    // Handle numeric sizes
    width = size;
    height = size;
    sizeClass = `w-[${size}px] h-[${size}px]`;
    sizesAttr = `(max-width:600px) ${Math.min(size, 100)}vw, ${size}px`;
  } else {
    // Handle string sizes
    switch (size) {
      case 'large':
        width = 240;
        height = 240;
        sizeClass = 'w-[240px] h-[240px]';
        sizesAttr = '(max-width:600px) 80vw, 240px';
        break;
      case 'small':
        width = 96;
        height = 96;
        sizeClass = 'w-[96px] h-[96px]';
        sizesAttr = '(max-width:600px) 40vw, 96px';
        break;
      case 'medium':
      default:
        width = 192;
        height = 192;
        sizeClass = 'w-[192px] h-[192px]';
        sizesAttr = '(max-width:600px) 60vw, 192px';
        break;
    }
  }
  
  return (
    <div 
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {!imgError ? (
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          priority={priority}
          sizes={sizesAttr}
          loader={playerId ? supabaseImageLoader : undefined}
          unoptimized={!playerId}
          className={`
            object-cover transition-opacity duration-300
            ${isLoading ? 'opacity-0' : 'opacity-100'}
          `}
          onLoad={() => {
            setIsLoading(false);
            if (onLoad) onLoad();
          }}
          onError={() => {
            console.log("Image error, falling back to standard img tag");
            setImgError(true);
          }}
        />
      ) : (
        // Fallback to regular img tag if Next/Image fails
        <img
          src={imageUrl}
          alt={imageAlt}
          className="object-cover w-full h-full"
          onError={(e) => {
            // Use placeholder if the direct image also fails
            e.currentTarget.src = fallbackUrl;
          }}
          onLoad={() => {
            setIsLoading(false);
            if (onLoad) onLoad();
          }}
        />
      )}
    </div>
  );
});

export default PlayerImage; 