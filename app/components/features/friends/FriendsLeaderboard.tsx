'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { getFriendsLeaderboard } from '../../../lib/user-actions';

type LeaderboardEntry = {
  gameId: string;
  userId: string;
  email: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  difficulty: string;
  gameDate: string;
  isCurrentUser: boolean;
};

type TimeframeOption = 'daily' | 'weekly' | 'monthly' | 'all-time';

export default function FriendsLeaderboard() {
  const { isSignedIn } = useUser();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<TimeframeOption>('all-time');

  useEffect(() => {
    if (isSignedIn) {
      loadLeaderboard();
    }
  }, [isSignedIn, timeframe]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getFriendsLeaderboard(timeframe);
      
      if (result.success) {
        setLeaderboard(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeframe = (tf: TimeframeOption): string => {
    switch (tf) {
      case 'daily':
        return 'Today';
      case 'weekly':
        return 'This Week';
      case 'monthly':
        return 'This Month';
      case 'all-time':
        return 'All Time';
      default:
        return 'All Time';
    }
  };

  if (!isSignedIn) {
    return (
      <div className="p-4 text-center">
        <p>Please sign in to view the friends leaderboard.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Friends Leaderboard</h2>
        
        <div className="inline-flex rounded-md shadow-sm" role="group">
          {(['daily', 'weekly', 'monthly', 'all-time'] as TimeframeOption[]).map((tf, index) => (
            <button
              key={tf}
              type="button"
              className={`px-3 py-1.5 text-xs font-medium ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } ${
                index === 0 
                  ? 'rounded-l-lg' 
                  : index === 3 
                    ? 'rounded-r-lg' 
                    : ''
              }`}
              onClick={() => setTimeframe(tf)}
            >
              {formatTimeframe(tf)}
            </button>
          ))}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {leaderboard.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No data available for this timeframe.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correct
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboard.map((entry, index) => (
                <tr 
                  key={entry.gameId}
                  className={entry.isCurrentUser ? 'bg-blue-50' : ''}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.email} {entry.isCurrentUser && '(You)'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.correctAnswers}/{entry.totalQuestions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {entry.difficulty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(entry.gameDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 