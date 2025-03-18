'use client';

import { useState } from 'react';
import { sendFriendRequest } from '../../../lib/user-actions';
import { createSafeClient } from '../../../lib/supabase-client';

export default function AddFriend() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const supabase = createSafeClient();
      
      // Search for users by email
      const { data, error: searchError } = await supabase
        .from('users')
        .select('id, email')
        .ilike('email', `%${email}%`)
        .limit(5);
        
      if (searchError) {
        throw searchError;
      }
      
      setSearchResults(data || []);
      
      if (data?.length === 0) {
        setError('No users found with that email');
      }
    } catch (err) {
      console.error('Error searching for users:', err);
      setError('Failed to search for users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const result = await sendFriendRequest(userId);
      
      if (result.success) {
        setSuccessMessage(result.message);
        setSearchResults([]);
        setEmail('');
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
      setError('Failed to send friend request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Add a Friend</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{successMessage}</p>
        </div>
      )}
      
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex items-center">
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Search by email"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {searchResults.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {searchResults.map((user) => (
              <li key={user.id} className="p-4 flex items-center justify-between">
                <p className="font-medium">{user.email}</p>
                <button
                  onClick={() => handleSendRequest(user.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                  disabled={isLoading}
                >
                  Add Friend
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 