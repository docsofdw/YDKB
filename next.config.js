/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['api.placeholder.com', 'example.com'],
    },
    // Add output configuration to ensure proper static file generation
    output: 'standalone',
    // Ensure proper handling of static files
    poweredByHeader: false,
    reactStrictMode: true,
    swcMinify: true,
  }
  
  module.exports = nextConfig