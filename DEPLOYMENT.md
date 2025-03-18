# Deployment Guide

## Overview
This guide explains how to properly deploy this Next.js application to Vercel, ensuring that all Next.js modules are correctly installed.

## Issue Fixed
We've resolved an issue where the build was failing with:
```
Cannot find module 'next/dist/compiled/arg/index.js'
```

This error occurs when Next.js post-installation scripts don't run correctly.

## Requirements
- Node.js version: 18.19.0 (as specified in .nvmrc)
- NPM with scripts enabled

## Vercel Deployment Checklist

1. **Node.js Version**
   - In the Vercel project settings, under "Build & Development Settings":
   - Set the Node.js Version to 18.x

2. **Environment Variables**
   - Ensure these environment variables are set in Vercel:
   - `NPM_CONFIG_IGNORE_SCRIPTS=false`

3. **Before Deploying**
   - Run the included `vercel-prep.sh` script locally to verify everything works:
   ```bash
   ./vercel-prep.sh
   ```
   - This script cleans the installation, ensures scripts can run, and verifies the critical modules exist

4. **Clear Vercel Cache**
   - If redeploying after errors, toggle "Clear Build Cache" in the Vercel project settings

## Troubleshooting

If deployment issues persist:

1. **Check for Missing Modules**
   - The key module to look for is `next/dist/compiled/arg/index.js`
   - This module is created during Next.js post-installation

2. **Check for Script Blocking**
   - Ensure no configuration is preventing npm scripts from running
   - Look for `ignore-scripts=true` in any .npmrc files

3. **Verify Clean Installation**
   - If problems persist, try a fresh clone and deploy

4. **Force Node Version**
   - Use .nvmrc and vercel.json to enforce the correct Node.js version 