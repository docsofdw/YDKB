'use client';

import { useState } from 'react';
import PlayerImage from '../components/PlayerImage';

export default function PlayerImageDemo() {
  const [playerName, setPlayerName] = useState('');
  const [searchedPlayers, setSearchedPlayers] = useState<string[]>([]);
  
  // Example players to showcase
  const examplePlayers = [
    'Tom Brady',
    'Patrick Mahomes',
    'Jerry Rice',
    'Peyton Manning',
    'Randall Cunningham',
    'Joe Montana',
    'Walter Payton',
    'Lawrence Taylor',
    'Barry Sanders',
    'John Elway'
  ];

  const handleSearch = () => {
    if (playerName && !searchedPlayers.includes(playerName)) {
      setSearchedPlayers([playerName, ...searchedPlayers]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Player Image Component Demo</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Search for a Player</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter player name"
            className="px-4 py-2 border rounded-md flex-grow"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </div>
      
      {searchedPlayers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Searched Players</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {searchedPlayers.map((name) => (
              <div key={name} className="flex flex-col items-center">
                <PlayerImage playerName={name} size={80} />
                <span className="mt-2 text-center">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Example Players</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {examplePlayers.map((name) => (
            <div key={name} className="flex flex-col items-center">
              <PlayerImage playerName={name} size={80} />
              <span className="mt-2 text-center">{name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Different Sizes</h2>
        <div className="flex flex-wrap gap-6 items-end">
          <div className="flex flex-col items-center">
            <PlayerImage playerName="Tom Brady" size={32} />
            <span className="mt-2 text-xs">32px</span>
          </div>
          <div className="flex flex-col items-center">
            <PlayerImage playerName="Tom Brady" size={48} />
            <span className="mt-2 text-xs">48px</span>
          </div>
          <div className="flex flex-col items-center">
            <PlayerImage playerName="Tom Brady" size={64} />
            <span className="mt-2 text-xs">64px</span>
          </div>
          <div className="flex flex-col items-center">
            <PlayerImage playerName="Tom Brady" size={96} />
            <span className="mt-2 text-xs">96px</span>
          </div>
          <div className="flex flex-col items-center">
            <PlayerImage playerName="Tom Brady" size={128} />
            <span className="mt-2 text-xs">128px</span>
          </div>
        </div>
      </div>
    </div>
  );
} 