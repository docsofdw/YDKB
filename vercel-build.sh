#!/bin/bash

# Setup environment for production build
echo "Setting up environment for Next.js production build..."
export NODE_OPTIONS="--max_old_space_size=4096"

# Clean up old build files
echo "Cleaning previous build artifacts..."
rm -rf .next node_modules

# Install dependencies with legacy peer deps
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build the project
echo "Building Next.js application..."
npm run build

echo "Build completed successfully." 