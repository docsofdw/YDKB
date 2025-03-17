'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function TestPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [players, setPlayers] = useState([]);
  const [dbTest, setDbTest] = useState({ status: 'pending', message: 'Testing database connection...' });
  
  useEffect(() => {
    testDatabaseConnection();
  }, []);
  
  const testDatabaseConnection = async () => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
      
      // Test 1: Simple query to get player count
      setDbTest({ status: 'running', message: 'Testing players table query...' });
      
      const { data, error, count } = await supabase
        .from('players')
        .select('*', { count: 'exact' })
        .limit(10);
      
      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }
      
      // Success!
      setPlayers(data || []);
      setDbTest({ 
        status: 'success', 
        message: `Successfully connected to database. Found ${count} players.` 
      });
      
    } catch (err) {
      console.error('Database test failed:', err);
      setError(err.message);
      setDbTest({ 
        status: 'error', 
        message: `Connection failed: ${err.message}` 
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      
      {/* Connection status */}
      <div className={`p-4 mb-6 rounded-md ${
        dbTest.status === 'success' ? 'bg-green-100 text-green-800' :
        dbTest.status === 'error' ? 'bg-red-100 text-red-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        <h2 className="font-bold">{dbTest.status.toUpperCase()}</h2>
        <p>{dbTest.message}</p>
      </div>
      
      {/* Display error details if any */}
      {error && (
        <div className="p-4 mb-6 bg-red-100 text-red-800 rounded-md">
          <h2 className="font-bold">Error Details:</h2>
          <pre className="whitespace-pre-wrap mt-2 text-sm">{error}</pre>
        </div>
      )}
      
      {/* Sample player data */}
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Sample Players Data</h2>
        
        {loading ? (
          <p>Loading player data...</p>
        ) : players.length === 0 ? (
          <p>No players found in database.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Position</th>
                  <th className="p-2 border">College</th>
                  <th className="p-2 border">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => (
                  <tr key={player.id}>
                    <td className="p-2 border">{player.id}</td>
                    <td className="p-2 border">{player.name}</td>
                    <td className="p-2 border">{player.position}</td>
                    <td className="p-2 border">{player.college}</td>
                    <td className="p-2 border">{player.difficulty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Environment details (for debugging) */}
      <div className="mt-8 p-4 bg-gray-100 rounded-md">
        <h2 className="text-lg font-bold mb-2">Environment Details</h2>
        <p>NEXT_PUBLIC_SUPABASE_URL defined: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Yes' : 'No'}</p>
        <p>NEXT_PUBLIC_SUPABASE_ANON_KEY defined: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
} 