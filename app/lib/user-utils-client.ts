// Client-side utilities for user operations
// This file is safe to import in client components

import { useUser } from '@clerk/nextjs';

/**
 * Hook to get the current user's information
 * Safe to use in client components
 */
export function useCurrentUser() {
  const { user, isSignedIn, isLoaded } = useUser();
  
  return {
    user,
    isSignedIn,
    isLoaded,
    userId: user?.id || null,
  };
}

// Add any other client-safe utilities here 