'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { format, addDays } from 'date-fns';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  
  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
  
  useEffect(() => {
    fetchChallenges();
  }, []);
  
  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('daily_challenges')
        .select(`
          *,
          easy_player:players!daily_challenges_easy_player_id_fkey(id, name, college, position, difficulty),
          hard_player:players!daily_challenges_hard_player_id_fkey(id, name, college, position, difficulty),
          hof_player:players!daily_challenges_hof_player_id_fkey(id, name, college, position, difficulty)
        `)
        .order('challenge_date', { ascending: false })
        .limit(10);
        
      if (error) throw new Error(error.message);
      
      setChallenges(data || []);
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const createChallenge = async () => {
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      
      const response = await fetch(`/api/create-challenge?date=${selectedDate}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || data.message || 'Failed to create challenge');
      }
      
      setMessage(`Challenge created successfully for ${selectedDate}`);
      fetchChallenges(); // Refresh the list
    } catch (err) {
      console.error('Error creating challenge:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteChallenge = async (id) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;
    
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      
      const { error } = await supabase
        .from('daily_challenges')
        .delete()
        .eq('id', id);
        
      if (error) throw new Error(error.message);
      
      setMessage('Challenge deleted successfully');
      fetchChallenges(); // Refresh the list
    } catch (err) {
      console.error('Error deleting challenge:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const createNextWeek = async () => {
    if (!confirm('Create challenges for the next 7 days?')) return;
    
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      
      let successCount = 0;
      let errorCount = 0;
      
      // Create challenges for the next 7 days
      for (let i = 1; i <= 7; i++) {
        const date = format(addDays(new Date(), i), 'yyyy-MM-dd');
        const response = await fetch(`/api/create-challenge?date=${date}`);
        const data = await response.json();
        
        if (data.success) {
          successCount++;
        } else if (data.message && data.message.includes('already exists')) {
          // Skip if already exists
          successCount++;
        } else {
          errorCount++;
          console.error(`Error creating challenge for ${date}:`, data.error || data.message);
        }
      }
      
      setMessage(`Created/verified ${successCount} challenges. Errors: ${errorCount}`);
      fetchChallenges(); // Refresh the list
    } catch (err) {
      console.error('Error creating challenges:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">YallDontKnowBall - Admin</h1>
      
      {/* Create Challenge Form */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-bold mb-4">Create Daily Challenge</h2>
        
        <div className="flex gap-4 mb-4">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={createChallenge}
              disabled={loading}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Challenge'}
            </button>
          </div>
        </div>
        
        <button
          onClick={createNextWeek}
          disabled={loading}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Create Next 7 Days
        </button>
      </div>
      
      {/* Messages */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {/* Challenges List */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Recent Challenges</h2>
        
        {loading && <p className="text-gray-500">Loading challenges...</p>}
        
        {!loading && challenges.length === 0 && (
          <p className="text-gray-500">No challenges found</p>
        )}
        
        {challenges.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border">Date</th>
                  <th className="py-2 px-4 border">Easy Player</th>
                  <th className="py-2 px-4 border">Hard Player</th>
                  <th className="py-2 px-4 border">HOF Player</th>
                  <th className="py-2 px-4 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {challenges.map(challenge => (
                  <tr key={challenge.id}>
                    <td className="py-2 px-4 border">{challenge.challenge_date}</td>
                    <td className="py-2 px-4 border">
                      {challenge.easy_player?.name} ({challenge.easy_player?.college})
                    </td>
                    <td className="py-2 px-4 border">
                      {challenge.hard_player?.name} ({challenge.hard_player?.college})
                    </td>
                    <td className="py-2 px-4 border">
                      {challenge.hof_player?.name} ({challenge.hof_player?.college})
                    </td>
                    <td className="py-2 px-4 border">
                      <button
                        onClick={() => deleteChallenge(challenge.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <div className="mt-6">
        <a
          href="/"
          className="text-blue-500 hover:text-blue-700"
        >
          Back to Game
        </a>
        {' | '}
        <a
          href="/diagnostic"
          className="text-blue-500 hover:text-blue-700"
        >
          Diagnostic Page
        </a>
      </div>
    </div>
  );
} 