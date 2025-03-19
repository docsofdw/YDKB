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

# Check for required environment variables
echo "Checking for required environment variables..."
REQUIRED_VARS=(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  "CLERK_SECRET_KEY"
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
)

MISSING_VARS=0
for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR}" ]; then
    echo "❌ Missing required environment variable: $VAR"
    MISSING_VARS=$((MISSING_VARS+1))
  else
    echo "✅ Found environment variable: $VAR"
  fi
done

if [ $MISSING_VARS -gt 0 ]; then
  echo "⚠️ Warning: $MISSING_VARS required environment variables are missing."
  echo "The deployment may fail if these are not set in the Vercel project settings."
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

# Explicitly install TypeScript
echo "Installing TypeScript..."
npm install --save-dev typescript@5.7.3

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

# Verify TypeScript is installed
echo "Verifying TypeScript installation..."
if [ -f node_modules/typescript/bin/tsc ]; then
  echo "✅ TypeScript is properly installed"
else
  echo "❌ TypeScript installation failed. Installing again with --no-save..."
  npm install --no-save typescript@5.7.3
fi

echo "✅ Project is ready for deployment to Vercel!"
echo "Remember to set Node.js version to 18.x in your Vercel project settings." 