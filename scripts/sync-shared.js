/**
 * Smart Sync Script for @flower/shared
 * 
 * This script copies packages/shared to apps/admin/src/shared
 * Maintains packages/shared as the single source of truth
 * Run automatically before build and dev
 */

const fs = require('fs');
const path = require('path');

// Paths
const SOURCE_DIR = path.resolve(__dirname, '../../../packages/shared/src');
const TARGET_DIR = path.resolve(__dirname, '../src/shared');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function copyRecursive(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      // Skip backup files
      if (entry.name.endsWith('.backup') || 
          entry.name.endsWith('_old.ts') || 
          entry.name.endsWith('.old.ts')) {
        continue;
      }

      fs.copyFileSync(srcPath, destPath);
      log(`  ✓ ${entry.name}`, 'green');
    }
  }
}

function cleanTargetDir() {
  if (fs.existsSync(TARGET_DIR)) {
    fs.rmSync(TARGET_DIR, { recursive: true, force: true });
    log('🗑️  Cleaned old shared directory', 'yellow');
  }
}

function main() {
  log('\n🔄 Starting Smart Sync...', 'blue');
  log(`📁 Source: ${SOURCE_DIR}`, 'blue');
  log(`📁 Target: ${TARGET_DIR}`, 'blue');

  // Check if source exists
  if (!fs.existsSync(SOURCE_DIR)) {
    log('\n❌ Error: packages/shared/src not found!', 'red');
    log('Make sure you are in the monorepo root.', 'red');
    process.exit(1);
  }

  try {
    // Clean and copy
    cleanTargetDir();
    log('\n📦 Copying files...', 'blue');
    copyRecursive(SOURCE_DIR, TARGET_DIR);

    // Success
    log('\n✅ Smart Sync completed successfully!', 'green');
    log(`📊 Admin now has an independent copy of shared code`, 'green');
    log(`💡 packages/shared remains the single source of truth\n`, 'yellow');
  } catch (error) {
    log('\n❌ Sync failed:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

main();
