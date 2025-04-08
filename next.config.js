/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
    images: {
      domains: ['api.placeholder.com', 'example.com'],
      // Disable image optimization to avoid deployment issues
      unoptimized: true,
    },
    // Ensure proper handling of static files
    poweredByHeader: false,
    reactStrictMode: true,
    swcMinify: true,
    // Disable ESLint and TypeScript checking during build
    eslint: {
      ignoreDuringBuilds: true
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    // Enable output file tracing for improved serverless function performance on Vercel
    experimental: {
      esmExternals: 'loose'
    },
    // Simplify webpack config to avoid conflicts
    webpack: (config) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname)
      };
      return config;
    },
    // Avoid trailing slash redirect issues
    trailingSlash: false,
    // Set a reasonable timeout for static page generation
    staticPageGenerationTimeout: 180,
}
  
module.exports = nextConfig