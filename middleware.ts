import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Create an array of public routes that don't require authentication
const publicPaths = [
  "/",
  "/api/colleges",
  "/login(.*)",
  "/signup(.*)",
  "/api/webhooks(.*)",
  "/api/test-generation(.*)",
  "/api/generate-image(.*)",
  "/api/check-generation(.*)",
  "/test-generation(.*)",
  "/api/admin/generate-challenge-images(.*)",
  "/api/admin/generate-future-images(.*)"
];

// Create a route matcher for public paths
const isPublic = createRouteMatcher(publicPaths);

// Use the clerkMiddleware with proper configuration
export default clerkMiddleware(async (auth, req) => {
  // Correctly call auth() and await the result to get the session details
  const { userId } = await auth();
  
  // Skip static asset requests entirely
  const url = new URL(req.url);
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js")
  ) {
    return NextResponse.next();
  }
  
  // If the route is public, allow access
  if (isPublic(req)) {
    return NextResponse.next();
  }
  
  // For protected routes, check if user is authenticated
  if (!userId) {
    // Redirect unauthenticated users to the login page
    const signInUrl = new URL('/login', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }
  
  // User is authenticated, allow access to protected routes
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except for static files, _next internal files, and specific API endpoints
    "/((?!_next/static|_next/image|favicon.ico|images|public).*)",
    "/api/:path*"
  ],
}; 