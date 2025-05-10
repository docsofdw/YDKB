import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that can be accessed while signed out
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/signup(.*)',
  '/api/colleges(.*)',
  '/api/webhooks(.*)',
  '/api/test-generation(.*)',
  '/favicon.ico',
  '/images/(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Only protect routes that aren't public
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  // Skip Next.js internals and all static files
  matcher: [
    '/((?!_next/image|_next/static|.png|.jpg|.svg|.ico).*)',
    '/',
  ],
}; 