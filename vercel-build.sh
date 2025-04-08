#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

# Setup environment for production build
echo "Setting up environment for Next.js production build..."
export NODE_OPTIONS="--max_old_space_size=4096"

# Clean up old build files
echo "Cleaning previous build artifacts..."
rm -rf .next

# Build the project
echo "Building Next.js application..."
npm run build

echo "Build completed successfully." 