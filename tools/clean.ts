#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const rootDir = path.resolve(__dirname, '..');

async function clean() {
  console.log('🧹 Starting cleanup process...');
  
  // Directories to remove
  const dirsToRemove = [
    '.next',
    'node_modules',
    '.turbo'
  ];
  
  // Files to remove
  const filesToRemove = [
    'package-lock.json',
    '.eslintcache',
    'tsconfig.tsbuildinfo'
  ];
  
  // Remove directories
  for (const dir of dirsToRemove) {
    const dirPath = path.join(rootDir, dir);
    if (fs.existsSync(dirPath)) {
      console.log(`Removing directory: ${dir}`);
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  }
  
  // Remove files
  for (const file of filesToRemove) {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`Removing file: ${file}`);
      fs.unlinkSync(filePath);
    }
  }
  
  // Clear Next.js cache
  console.log('Cleaning Next.js cache...');
  try {
    await execAsync('npm exec next telemetry disable');
    console.log('✅ Next.js telemetry disabled');
  } catch (error) {
    console.error('Failed to disable Next.js telemetry:', error);
  }
  
  console.log('🔄 Reinstalling dependencies...');
  try {
    await execAsync('npm install', { cwd: rootDir });
    console.log('✅ Dependencies reinstalled');
  } catch (error) {
    console.error('Failed to reinstall dependencies:', error);
  }
  
  console.log('✨ Cleanup complete!');
}

// Execute the clean function
clean().catch(error => {
  console.error('Cleanup failed:', error);
  process.exit(1);
}); 