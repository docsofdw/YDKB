/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['api.placeholder.com', 'example.com'],
      // Add Vercel image optimization
      unoptimized: process.env.NODE_ENV === 'development',
    },
    // Ensure proper handling of static files
    poweredByHeader: false,
    reactStrictMode: true,
    swcMinify: true,
    // Enable output file tracing for improved serverless function performance on Vercel
    experimental: {
      outputFileTracingRoot: process.cwd(),
    },
  }
  
  module.exports = nextConfig