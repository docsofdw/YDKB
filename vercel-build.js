// This script ensures Next.js modules are properly installed
// during Vercel deployment

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 Starting pre-build checks...');

// Make sure we're using the right Node version
console.log(`🔍 Node.js version: ${process.version}`);

// Check if we need to reset npm config
console.log('🔧 Setting npm config to allow scripts...');
execSync('npm config set ignore-scripts false', { stdio: 'inherit' });

// Create a test file that will help us debug this issue
const debugInfo = {
  nodeVersion: process.version,
  cwd: process.cwd(),
  npmConfig: execSync('npm config list').toString(),
  env: process.env.NPM_CONFIG_IGNORE_SCRIPTS,
};

// Write debug info to a file
fs.writeFileSync('./debug-info.json', JSON.stringify(debugInfo, null, 2));

// Path to the module
const argModulePath = './node_modules/next/dist/compiled/arg/index.js';

// Check if Next.js compiled directory exists
try {
  if (!fs.existsSync('./node_modules/next/dist/compiled')) {
    console.log('⚠️ Missing next/dist/compiled directory - reinstalling Next.js...');
    
    // Force reinstall next
    execSync('npm uninstall next && npm install next@14.1.0', { stdio: 'inherit' });
    
    // Check again
    if (!fs.existsSync('./node_modules/next/dist/compiled')) {
      console.error('❌ Failed to install next/dist/compiled directory');
      
      // Try using our fallback
      console.log('⚠️ Attempting to use fallback module creation...');
      require('./next-module-fix');
    }
  }
  
  // Check if arg module exists
  if (!fs.existsSync(argModulePath)) {
    console.log('⚠️ Missing next/dist/compiled/arg/index.js - attempting to fix...');
    
    // Try to copy from node_modules
    if (fs.existsSync('./node_modules/arg')) {
      console.log('📦 Found arg package - trying to use it...');
      
      try {
        // Create the directory structure if needed
        const argDir = path.dirname(argModulePath);
        if (!fs.existsSync(argDir)) {
          fs.mkdirSync(argDir, { recursive: true });
        }
        
        // Create a simple index.js file
        const moduleContent = `module.exports = require('arg');`;
        fs.writeFileSync(argModulePath, moduleContent);
        
        console.log('✅ Created module using installed arg package');
      } catch (e) {
        console.error('❌ Failed to create module:', e);
      }
    }
    
    // If still missing, try reinstalling
    if (!fs.existsSync(argModulePath)) {
      console.log('⚠️ Still missing module - reinstalling Next.js...');
      execSync('npm uninstall next && npm install next@14.1.0', { stdio: 'inherit' });
    }
    
    // Final fallback: Use our manually created version
    if (!fs.existsSync(argModulePath)) {
      console.log('⚠️ Last resort: Creating module manually...');
      require('./next-module-fix');
    }
    
    // Final check
    if (!fs.existsSync(argModulePath)) {
      console.error('❌ All attempts to fix next/dist/compiled/arg/index.js failed');
      process.exit(1);
    }
  }
  
  console.log('✅ next/dist/compiled/arg/index.js exists!');
  console.log('✅ Pre-build checks completed successfully');
} catch (error) {
  console.error('❌ Error during pre-build checks:', error);
  process.exit(1);
} 