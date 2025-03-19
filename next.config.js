/** @type {import('next').NextConfig} */
const path = require('path');

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
    // Disable TypeScript checking during build (we'll rely on pre-commit hooks locally)
    typescript: {
      ignoreBuildErrors: true,
    },
    // Enable output file tracing for improved serverless function performance on Vercel
    experimental: {
      outputFileTracingRoot: process.cwd(),
    },
    webpack: (config) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname),
      };
      return config;
    },
  }
  
  module.exports = nextConfig