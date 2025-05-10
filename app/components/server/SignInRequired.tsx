'use client';

import { Button } from "@/app/components/ui/button";
import Link from "next/link";

interface SignInRequiredProps {
  title?: string;
  message?: string;
  signInUrl?: string;
}

export default function SignInRequired({
  title = "Sign In Required",
  message = "Please sign in to continue.",
  signInUrl = "/login"
}: SignInRequiredProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="mb-6">{message}</p>
        <Link href={signInUrl}>
          <Button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
} 