#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

# Setup environment for production build
echo "Setting up environment for Next.js production build..."
export NODE_OPTIONS="--max_old_space_size=4096"

# Explicitly ensure TypeScript is installed first
echo "Ensuring TypeScript is installed..."
npm install --save-dev typescript@5.3.3 @types/react@18.3.20 @types/react-dom@18.2.18 @types/node@20.17.30

# Clean up old build files
echo "Cleaning previous build artifacts..."
rm -rf .next

# Install all dependencies with legacy peer deps
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build the project
echo "Building Next.js application..."
npm run build

echo "Build completed successfully." 