#!/bin/bash

# Script to prepare for Vercel deployment

echo "Preparing for Vercel deployment..."

# Record current Node version
echo "Current Node.js version:"
node -v

# Check if .nvmrc exists and use it
if [ -f .nvmrc ]; then
  echo "Found .nvmrc file. Using specified Node.js version..."
  NODE_VERSION=$(cat .nvmrc)
  echo "Required Node.js version: $NODE_VERSION"
else
  echo "No .nvmrc found. Using default version."
fi

# Clean up files
echo "Cleaning up old installations..."
rm -rf node_modules package-lock.json .next

# Ensure scripts are allowed to run
echo "Ensuring scripts are enabled..."
npm config set ignore-scripts false

# Install dependencies
echo "Installing dependencies..."
npm install
# Explicitly install dependencies that were causing problems
npm install autoprefixer postcss tailwindcss date-fns typescript@5.7.3 --no-save

# Create jsconfig.json for path resolution (fallback for tsconfig)
echo "Creating jsconfig.json for path resolution..."
cat > jsconfig.json << EOL
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
EOL

# Verify the arg module exists
echo "Verifying Next.js compiled modules..."
if [ -f node_modules/next/dist/compiled/arg/index.js ]; then
  echo "✅ next/dist/compiled/arg/index.js found - this is good!"
else
  echo "❌ next/dist/compiled/arg/index.js is missing. Installation issue persists."
  exit 1
fi

echo "✅ Project is ready for deployment to Vercel!"
echo "Remember to set Node.js version to 18.x in your Vercel project settings." 