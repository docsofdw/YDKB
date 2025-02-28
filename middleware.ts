import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Create an array of public routes that don't require authentication
const publicPaths = [
  "/",
  "/api/colleges",
  "/login",
  "/signup",
  "/api/webhooks(.*)"
];

// Create a route matcher for public paths
const isPublic = createRouteMatcher(publicPaths);

// Use the clerkMiddleware with proper configuration
export default clerkMiddleware(async (auth, req) => {
  // If the route is public, allow access
  if (isPublic(req)) {
    return NextResponse.next();
  }
  
  // For protected routes, check if user is authenticated
  // Get the auth object and check if user is authenticated
  const authObject = await auth();
  if (!authObject.userId) {
    const signInUrl = new URL('/login', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }
  
  // User is authenticated, allow access to protected routes
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next/static|_next/image|_next/webpack|favicon.ico|.+\\.css|.+\\.js|.+\\.png|.+\\.svg|.+\\.jpg|.+\\.jpeg|.+\\.gif).*)',
    // Match all API routes
    '/api/:path*',
  ],
}; 