'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function DiagnosticPage() {
  const [supabaseStatus, setSupabaseStatus] = useState('checking');
  const [playerData, setPlayerData] = useState(null);
  const [collegeData, setCollegeData] = useState(null);
  const [challengeData, setChallengeData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    checkDatabase();
  }, []);
  
  const checkDatabase = async () => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
      
      // Check Supabase connection
      setSupabaseStatus('connecting');
      
      // 1. Check players table
      const { data: players, error: playersError, count: playerCount } = await supabase
        .from('players')
        .select('*', { count: 'exact' })
        .limit(5);
        
      if (playersError) throw new Error(`Players table error: ${playersError.message}`);
      setPlayerData({ count: playerCount, sample: players });
      
      // 2. Check colleges table
      const { data: colleges, error: collegesError, count: collegeCount } = await supabase
        .from('colleges')
        .select('*', { count: 'exact' })
        .limit(5);
        
      if (collegesError) throw new Error(`Colleges table error: ${collegesError.message}`);
      setCollegeData({ count: collegeCount, sample: colleges });
      
      // 3. Check daily_challenges table
      const { data: challenges, error: challengesError, count: challengeCount } = await supabase
        .from('daily_challenges')
        .select('*')
        .limit(5);
        
      if (challengesError) throw new Error(`Daily challenges table error: ${challengesError.message}`);
      setChallengeData({ count: challengeCount, sample: challenges });
      
      // All checks passed
      setSupabaseStatus('connected');
      
    } catch (err) {
      console.error('Diagnostic error:', err);
      setSupabaseStatus('error');
      setError(err.message);
    }
  };
  
  // Helper to show status with color
  const StatusBadge = ({ status }) => {
    const colors = {
      checking: 'bg-gray-200 text-gray-800',
      connecting: 'bg-blue-200 text-blue-800',
      connected: 'bg-green-200 text-green-800',
      error: 'bg-red-200 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded text-sm ${colors[status]}`}>
        {status}
      </span>
    );
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">YallDontKnowBall - Database Diagnostic</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Supabase Connection</h2>
          <StatusBadge status={supabaseStatus} />
        </div>
        
        <p className="text-sm">
          Environment variables: 
          <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? "text-green-700" : "text-red-700"}>
            {process.env.NEXT_PUBLIC_SUPABASE_URL ? " URL defined" : " URL missing"}
          </span>, 
          <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "text-green-700" : "text-red-700"}>
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? " API key defined" : " API key missing"}
          </span>
        </p>
        
        {error && (
          <div className="mt-2 p-2 bg-red-100 text-red-800 rounded text-sm">
            Error: {error}
          </div>
        )}
      </div>
      
      {/* Player Data */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">Players Table</h2>
        {playerData ? (
          <div>
            <p className="mb-1">Count: {playerData.count} players</p>
            {playerData.sample && playerData.sample.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 border">ID</th>
                      <th className="py-2 px-4 border">Name</th>
                      <th className="py-2 px-4 border">Position</th>
                      <th className="py-2 px-4 border">College</th>
                      <th className="py-2 px-4 border">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerData.sample.map(player => (
                      <tr key={player.id}>
                        <td className="py-2 px-4 border">{player.id}</td>
                        <td className="py-2 px-4 border">{player.name}</td>
                        <td className="py-2 px-4 border">{player.position}</td>
                        <td className="py-2 px-4 border">{player.college}</td>
                        <td className="py-2 px-4 border">{player.difficulty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-yellow-800">No player samples available</p>
            )}
          </div>
        ) : (
          <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
        )}
      </div>
      
      {/* College Data */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">Colleges Table</h2>
        {collegeData ? (
          <div>
            <p className="mb-1">Count: {collegeData.count} colleges</p>
            {collegeData.sample && collegeData.sample.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 border">ID</th>
                      <th className="py-2 px-4 border">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collegeData.sample.map(college => (
                      <tr key={college.id}>
                        <td className="py-2 px-4 border">{college.id}</td>
                        <td className="py-2 px-4 border">{college.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-yellow-800">No college samples available</p>
            )}
          </div>
        ) : (
          <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
        )}
      </div>
      
      {/* Challenge Data */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">Daily Challenges Table</h2>
        {challengeData ? (
          <div>
            <p className="mb-1">Count: {challengeData.sample?.length || 0} challenges</p>
            {challengeData.sample && challengeData.sample.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 border">ID</th>
                      <th className="py-2 px-4 border">Date</th>
                      <th className="py-2 px-4 border">Easy Player ID</th>
                      <th className="py-2 px-4 border">Hard Player ID</th>
                      <th className="py-2 px-4 border">HOF Player ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challengeData.sample.map(challenge => (
                      <tr key={challenge.id}>
                        <td className="py-2 px-4 border">{challenge.id}</td>
                        <td className="py-2 px-4 border">{challenge.challenge_date}</td>
                        <td className="py-2 px-4 border">{challenge.easy_player_id}</td>
                        <td className="py-2 px-4 border">{challenge.hard_player_id}</td>
                        <td className="py-2 px-4 border">{challenge.hof_player_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-yellow-800">No challenge data available</p>
            )}
          </div>
        ) : (
          <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={checkDatabase}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Refresh Checks
        </button>
        
        <a
          href="/"
          className="bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded"
        >
          Back to Game
        </a>
      </div>
    </div>
  );
} 