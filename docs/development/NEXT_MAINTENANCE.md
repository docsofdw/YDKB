# Next.js Maintenance Guide

This document provides guidelines for maintaining Next.js in this project to prevent installation and build issues.

## Common Issues & Solutions

### Missing or Corrupted Next.js Files

Next.js relies on its internal file structure being intact. If you encounter errors about missing modules like:
- `Cannot find module '../lib/commands'`
- Missing files in `next/dist/compiled/*`

Follow these steps:

1. **Perform a clean reinstall**:
   ```bash
   npm run clean
   ```

   This command:
   - Removes the `.next` build folder
   - Removes `node_modules`
   - Removes `package-lock.json`
   - Reinstalls all dependencies with proper script execution

2. **Never manually modify Next.js internal files**:
   - Do not edit anything in `node_modules/next/`
   - Do not create custom scripts that patch Next.js files

3. **Ensure npm scripts are enabled**:
   - Next.js needs to run its postinstall scripts
   - Ensure `.npmrc` has `ignore-scripts=false`
   - Avoid using the `--ignore-scripts` flag

### Deployment Issues

For Vercel deployments:

1. **Use the standard build script**:
   ```json
   "scripts": {
     "build": "next build",
     "vercel-build": "npm run build"
   }
   ```

2. **Ensure Node.js version compatibility**:
   - Use a Node.js version compatible with the project (see `engines` field in package.json)
   - Vercel should automatically use the correct version

## Preventive Measures

1. **Keep .npmrc clean**:
   ```
   ignore-scripts=false
   ```

2. **Always run with proper script execution**:
   ```bash
   npm install --no-ignore-scripts
   ```

3. **Avoid custom build scripts** that modify Next.js internals:
   - Remove any scripts that patch `node_modules/next/`
   - Let Next.js manage its own modules

4. **Regular maintenance**:
   - Run `npm run clean` occasionally to refresh Next.js installation
   - Update Next.js only with proper testing

## Emergency Recovery

If all else fails:

1. Delete the entire project locally
2. Clone fresh from the repository
3. Run `npm install --no-ignore-scripts`
4. Test build with `npm run build` 