'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getPlayerImageUrl, supabaseImageLoader } from '@/app/lib/supabase-client';

export default function ImageTestPage() {
  const [error1, setError1] = useState(false);
  const [error2, setError2] = useState(false);
  const [error3, setError3] = useState(false);
  
  // Test with player ID 1
  const playerId = 1;
  const imageUrl = getPlayerImageUrl(playerId);
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Image Loading Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Next Image with domains config</h2>
        <div className="relative w-[192px] h-[192px] overflow-hidden rounded-lg bg-gray-100">
          {!error1 ? (
            <Image
              src={imageUrl}
              alt="Player image test 1"
              fill
              className="object-cover"
              onError={() => {
                console.error("Method 1 failed");
                setError1(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-600">
              Error loading
            </div>
          )}
        </div>
        <div className="mt-2 text-sm break-all">{imageUrl}</div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Next Image with custom loader</h2>
        <div className="relative w-[192px] h-[192px] overflow-hidden rounded-lg bg-gray-100">
          {!error2 ? (
            <Image
              src={String(playerId)}
              alt="Player image test 2"
              width={192}
              height={192}
              loader={supabaseImageLoader}
              className="object-cover"
              onError={() => {
                console.error("Method 2 failed");
                setError2(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-600">
              Error loading
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Regular img tag</h2>
        <div className="relative w-[192px] h-[192px] overflow-hidden rounded-lg bg-gray-100">
          {!error3 ? (
            <img
              src={imageUrl}
              alt="Player image test 3"
              className="object-cover w-full h-full"
              onError={() => {
                console.error("Method 3 failed");
                setError3(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-600">
              Error loading
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 