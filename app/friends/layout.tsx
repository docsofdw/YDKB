import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Friends | You Don\'t Know Ball',
  description: 'Connect with friends and see how you stack up on the leaderboard.',
};

export default function FriendsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="friends-layout container mx-auto px-4 py-8">
      {children}
    </div>
  );
} 