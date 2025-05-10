import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";

export default async function Navbar({ pathname }: { pathname: string }) {
  const user = await currentUser();
  const isSignedIn = !!user;

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-deep-slate border-b border-midnight-navy sticky top-0 z-50 shadow-md">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div className="flex items-center">
              <Link 
                href="/" 
                className="text-turf-green font-montserrat font-extrabold text-2xl"
              >
                YDKB
              </Link>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden sm:flex ml-12 gap-8">
              <Link
                href="/"
                className={`inline-flex items-center px-2 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ${
                  isActive("/") 
                    ? "border-turf-green text-chalk-white" 
                    : "border-transparent text-silver-gray hover:text-chalk-white"
                }`}
              >
                Home
              </Link>
              <Link
                href="/play"
                className={`inline-flex items-center px-2 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ${
                  isActive("/play") 
                    ? "border-turf-green text-chalk-white" 
                    : "border-transparent text-silver-gray hover:text-chalk-white"
                }`}
              >
                Play
              </Link>
              <Link
                href="/leaderboard"
                className={`inline-flex items-center px-2 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ${
                  isActive("/leaderboard") 
                    ? "border-turf-green text-chalk-white" 
                    : "border-transparent text-silver-gray hover:text-chalk-white"
                }`}
              >
                Leaderboard
              </Link>
              {isSignedIn && (
                <>
                  <Link
                    href="/friends"
                    className={`inline-flex items-center px-2 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ${
                      isActive("/friends") 
                        ? "border-turf-green text-chalk-white" 
                        : "border-transparent text-silver-gray hover:text-chalk-white"
                    }`}
                  >
                    Friends
                  </Link>
                  <Link
                    href="/profile"
                    className={`inline-flex items-center px-2 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ${
                      isActive("/profile") 
                        ? "border-turf-green text-chalk-white" 
                        : "border-transparent text-silver-gray hover:text-chalk-white"
                    }`}
                  >
                    Profile
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center">
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-silver-gray">Welcome back</span>
                <a href="/user-profile" className="h-9 w-9 overflow-hidden rounded-full bg-gray-200">
                  {user?.imageUrl && (
                    <img 
                      src={user.imageUrl} 
                      alt="User profile" 
                      className="h-full w-full object-cover"
                    />
                  )}
                </a>
              </div>
            ) : (
              <div className="flex gap-4">
                <Link
                  href="/login"
                  className="text-silver-gray hover:text-chalk-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-turf-green text-deep-slate px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 hover:bg-turf-green/90"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button with CSS :target trick instead of JS */}
          <div className="flex items-center sm:hidden">
            <a 
              href="#mobile-menu" 
              className="inline-flex items-center justify-center p-2 rounded-md text-silver-gray hover:text-chalk-white transition-colors duration-150"
              aria-label="Open menu"
            >
              <svg
                className="h-6 w-6"
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
            </a>
          </div>
        </div>
      </div>

      {/* Mobile menu with :target CSS trick for no-JS support */}
      <div 
        id="mobile-menu" 
        className="hidden sm:hidden target:block"
      >
        <div className="pt-2 pb-3 flex flex-col gap-1 relative">
          <a 
            href="#" 
            className="absolute top-2 right-4 text-silver-gray"
            aria-label="Close menu"
          >
            <svg
              className="h-6 w-6"
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
          </a>
          
          <Link
            href="/"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150 ${
              isActive("/") 
                ? "border-turf-green bg-midnight-navy text-chalk-white" 
                : "border-transparent text-silver-gray hover:bg-midnight-navy/50"
            }`}
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
          >
            Leaderboard
          </Link>
          
          {isSignedIn && (
            <>
              <Link
                href="/friends"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150 ${
                  isActive("/friends") 
                    ? "border-turf-green bg-midnight-navy text-chalk-white" 
                    : "border-transparent text-silver-gray hover:bg-midnight-navy/50"
                }`}
              >
                Friends
              </Link>
              <Link
                href="/profile"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150 ${
                  isActive("/profile") 
                    ? "border-turf-green bg-midnight-navy text-chalk-white" 
                    : "border-transparent text-silver-gray hover:bg-midnight-navy/50"
                }`}
              >
                Profile
              </Link>
            </>
          )}
          
          {!isSignedIn && (
            <>
              <Link
                href="/login"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150 border-transparent text-silver-gray hover:bg-midnight-navy/50`}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150 border-transparent text-silver-gray hover:bg-midnight-navy/50`}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
      
      {/* Add CSS for :target trick */}
      <style jsx>{`
        @media (hover:none) {
          .glass {
            backdrop-filter: none;
          }
        }
      `}</style>
    </nav>
  );
} 