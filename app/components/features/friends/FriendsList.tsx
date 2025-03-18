'use client';

import { useState, useEffect } from 'react';
import { getFriends, getPendingFriendRequests, respondToFriendRequest } from '../../../lib/user-actions';
import { useUser } from '@clerk/nextjs';

type Friend = {
  relationshipId: string;
  userId: string;
  clerkId: string;
  email: string;
  since: string;
};

type FriendRequest = {
  requestId: string;
  userId: string;
  clerkId: string;
  email: string;
  requestedAt: string;
};

export default function FriendsList() {
  const { isSignedIn } = useUser();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      loadFriendsData();
    }
  }, [isSignedIn]);

  const loadFriendsData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load friends
      const friendsResult = await getFriends();
      if (friendsResult.success) {
        setFriends(friendsResult.data);
      } else {
        setError(friendsResult.message);
      }
      
      // Load pending requests
      const requestsResult = await getPendingFriendRequests();
      if (requestsResult.success) {
        setPendingRequests(requestsResult.data);
      } else {
        setError(requestsResult.message);
      }
    } catch (err) {
      setError('Failed to load friends data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const result = await respondToFriendRequest(requestId, true);
      if (result.success) {
        setSuccessMessage('Friend request accepted!');
        // Refresh the data
        loadFriendsData();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to accept friend request');
      console.error(err);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const result = await respondToFriendRequest(requestId, false);
      if (result.success) {
        setSuccessMessage('Friend request rejected');
        // Refresh the data
        loadFriendsData();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to reject friend request');
      console.error(err);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="p-4 text-center">
        <p>Please sign in to view your friends list.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p>Loading friends data...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
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
      
      {/* Pending Friend Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {pendingRequests.map((request) => (
                <li key={request.requestId} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{request.email}</p>
                    <p className="text-sm text-gray-500">
                      Requested {new Date(request.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcceptRequest(request.requestId)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.requestId)}
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Friends List Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Your Friends</h2>
        {friends.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">You don't have any friends yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {friends.map((friend) => (
                <li key={friend.relationshipId} className="p-4">
                  <p className="font-medium">{friend.email}</p>
                  <p className="text-sm text-gray-500">
                    Friends since {new Date(friend.since).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 