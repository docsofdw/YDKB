/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
    images: {
      domains: ['api.placeholder.com', 'example.com', 'ymgyzyfglszhxiukife.supabase.co'],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'ymgyzyfglszhxiukife.supabase.co',
          pathname: '/storage/v1/object/public/**',
        },
      ],
      formats: ['image/avif', 'image/webp']
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
    // Module imports optimization
    modularizeImports: {
      'lucide-react': {
        transform: 'lucide-react/dist/esm/icons/{{member}}'
      },
      'date-fns': {
        transform: 'date-fns/{{member}}'
      }
    },
    // Avoid trailing slash redirect issues
    trailingSlash: false,
    // Set a reasonable timeout for static page generation
    staticPageGenerationTimeout: 180,
}
  
module.exports = nextConfig