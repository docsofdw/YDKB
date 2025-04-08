#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

# Setup environment for production build
echo "Setting up environment for Next.js production build..."
export NODE_OPTIONS="--max_old_space_size=4096"

# Clean up old build files
echo "Cleaning previous build artifacts..."
rm -rf .next

# Install dependencies with legacy peer deps
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Explicitly ensure TypeScript is installed
echo "Ensuring TypeScript is installed..."
npm install --save-dev typescript@5.3.3 @types/react@18.2.45 @types/react-dom@18.2.18 @types/node@20.10.5

# Build the project
echo "Building Next.js application..."
npm run build

echo "Build completed successfully." 