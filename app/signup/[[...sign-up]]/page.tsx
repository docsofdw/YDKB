import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Sign Up for YDK Ball</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create an account to start playing and track your progress
          </p>
        </div>
        <SignUp />
      </div>
    </div>
  );
} 