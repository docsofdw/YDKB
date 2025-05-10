import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import QuizSelectionPage from '@/app/components/server/QuizSelectionPage';
import SignInRequired from '@/app/components/server/SignInRequired';

export default async function QuizPage() {
  const { userId } = await auth();
  
  return (
    <div className="min-h-screen">
      {!userId ? (
        <SignInRequired 
          title="Sign In Required"
          message="Please sign in to browse quizzes."
          signInUrl="/login"
        />
      ) : (
        <Suspense fallback={<LoadingScreen />}>
          <QuizSelectionPage />
        </Suspense>
      )}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
    </div>
  );
} 