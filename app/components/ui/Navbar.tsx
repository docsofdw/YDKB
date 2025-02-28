"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-deep-slate border-b border-midnight-navy sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex items-center">
              <Link href="/" className="text-turf-green font-montserrat font-extrabold text-xl">
                YDKB
              </Link>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden sm:flex ml-8 gap-6">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ${
                  isActive("/") 
                    ? "border-turf-green text-chalk-white" 
                    : "border-transparent text-silver-gray hover:text-chalk-white"
                }`}
              >
                Home
              </Link>
              <Link
                href="/play"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ${
                  isActive("/play") 
                    ? "border-turf-green text-chalk-white" 
                    : "border-transparent text-silver-gray hover:text-chalk-white"
                }`}
              >
                Play
              </Link>
              <Link
                href="/leaderboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ${
                  isActive("/leaderboard") 
                    ? "border-turf-green text-chalk-white" 
                    : "border-transparent text-silver-gray hover:text-chalk-white"
                }`}
              >
                Leaderboard
              </Link>
              <SignedIn>
                <Link
                  href="/profile"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ${
                    isActive("/profile") 
                      ? "border-turf-green text-chalk-white" 
                      : "border-transparent text-silver-gray hover:text-chalk-white"
                  }`}
                >
                  Profile
                </Link>
              </SignedIn>
            </div>
          </div>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center ml-6">
            <SignedIn>
              <div className="flex items-center gap-4">
                <span className="text-sm text-silver-gray">Welcome back</span>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8"
                    }
                  }}
                />
              </div>
            </SignedIn>
            <SignedOut>
              <div className="flex gap-3">
                <Link
                  href="/login"
                  className="text-silver-gray hover:text-chalk-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-turf-green text-deep-slate px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 hover:bg-turf-green/90"
                >
                  Sign Up
                </Link>
              </div>
            </SignedOut>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-silver-gray hover:text-chalk-white transition-colors duration-150"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 flex flex-col gap-1">
          <Link
            href="/"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150 ${
              isActive("/") 
                ? "border-turf-green bg-midnight-navy text-chalk-white" 
                : "border-transparent text-silver-gray hover:bg-midnight-navy/50"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/play"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150 ${
              isActive("/play") 
                ? "border-turf-green bg-midnight-navy text-chalk-white" 
                : "border-transparent text-silver-gray hover:bg-midnight-navy/50"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Play
          </Link>
          <Link
            href="/leaderboard"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150 ${
              isActive("/leaderboard") 
                ? "border-turf-green bg-midnight-navy text-chalk-white" 
                : "border-transparent text-silver-gray hover:bg-midnight-navy/50"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Leaderboard
          </Link>
          <SignedIn>
            <Link
              href="/profile"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150 ${
                isActive("/profile") 
                  ? "border-turf-green bg-midnight-navy text-chalk-white" 
                  : "border-transparent text-silver-gray hover:bg-midnight-navy/50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </Link>
          </SignedIn>
          <SignedOut>
            <div className="mt-4 flex flex-col gap-2 px-4">
              <Link
                href="/login"
                className="w-full text-center text-silver-gray border border-silver-gray/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 hover:text-chalk-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="w-full text-center bg-turf-green text-deep-slate px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 hover:bg-turf-green/90"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
} 