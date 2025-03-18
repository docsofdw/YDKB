// This script manually creates the missing arg module
// Use this as a last resort if other methods fail

const fs = require('fs');
const path = require('path');

console.log('🔧 Creating Next.js arg module manually...');

// Define the path to the module
const argDir = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'compiled', 'arg');
const argIndexPath = path.join(argDir, 'index.js');
const argPackagePath = path.join(argDir, 'package.json');

// Create the content for the module
const argIndexContent = `
// This is a minimal implementation of the arg module used by Next.js
// Created as a fallback for build environments where post-install scripts fail

function arg(opts, { argv = process.argv.slice(2), permissive = false, stopAtPositional = false } = {}) {
  if (!opts) {
    return { _: argv.slice(0) };
  }

  const result = { _: [] };
  const aliases = {};
  const handlers = {};

  for (const key of Object.keys(opts)) {
    if (key === '--') {
      continue;
    }

    const opt = opts[key];
    
    if (typeof opt === 'string') {
      aliases[opt] = key;
      continue;
    }
    
    handlers[key] = (value) => {
      if (opt === Boolean) {
        return true;
      }
      if (typeof opt === 'function') {
        return opt(value);
      }
      return value;
    };
  }

  for (let i = 0, len = argv.length; i < len; i++) {
    const arg = argv[i];

    if (arg === '--') {
      result._ = result._.concat(argv.slice(i + 1));
      break;
    }

    if (arg.length > 1 && arg[0] === '-') {
      const isLong = arg[1] === '-';
      const name = isLong ? arg.substring(2) : arg.substring(1);

      let value = true;
      if (isLong && name.includes('=')) {
        const parts = name.split('=');
        value = parts.slice(1).join('=');
      }

      const key = isLong ? name : aliases[name];
      
      if (key && handlers[key]) {
        result[key] = handlers[key](value);
      } else if (!permissive) {
        throw new Error(\`Unknown or unexpected option: \${isLong ? '--' : '-'}\${name}\`);
      }
    } else {
      result._.push(arg);
      if (stopAtPositional) {
        result._ = result._.concat(argv.slice(i + 1));
        break;
      }
    }
  }

  return result;
}

module.exports = arg;
`;

const argPackageContent = `{
  "name": "arg",
  "version": "5.0.2"
}`;

// Ensure the directory exists
try {
  if (!fs.existsSync(argDir)) {
    fs.mkdirSync(argDir, { recursive: true });
    console.log(`✅ Created directory: ${argDir}`);
  }

  // Write the files
  fs.writeFileSync(argIndexPath, argIndexContent);
  console.log(`✅ Created file: ${argIndexPath}`);

  fs.writeFileSync(argPackagePath, argPackageContent);
  console.log(`✅ Created file: ${argPackagePath}`);

  console.log('🎉 Successfully created Next.js arg module');
} catch (error) {
  console.error('❌ Error creating Next.js arg module:', error);
  process.exit(1);
} 