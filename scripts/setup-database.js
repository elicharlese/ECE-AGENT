#!/usr/bin/env node

/**
 * AGENT Database Setup Script
 * Sets up database schema and runs migrations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, options = {}) {
  try {
    log(`Running: ${command}`, 'cyan');
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    log(`Command failed: ${command}`, 'red');
    throw error;
  }
}

async function setupDatabase() {
  log('🚀 Setting up AGENT database...', 'yellow');

  // Check if Prisma schema exists
  const schemaPath = 'prisma/schema.prisma';
  if (!fs.existsSync(schemaPath)) {
    log('❌ Prisma schema not found. Please create prisma/schema.prisma first.', 'red');
    process.exit(1);
  }

  try {
    // Generate Prisma client
    log('Generating Prisma client...', 'blue');
    runCommand('npx prisma generate');

    // Check database connection
    log('Checking database connection...', 'blue');
    runCommand('npx prisma db push --accept-data-loss');

    // Run migrations if they exist
    const migrationsDir = 'prisma/migrations';
    if (fs.existsSync(migrationsDir)) {
      log('Running database migrations...', 'blue');
      runCommand('npx prisma migrate deploy');
    }

    // Seed database if seed script exists
    const seedPath = 'prisma/seed.js';
    if (fs.existsSync(seedPath)) {
      log('Seeding database...', 'blue');
      runCommand('npx prisma db seed');
    }

    log('✅ Database setup complete!', 'green');

  } catch (error) {
    log('❌ Database setup failed. Please check your DATABASE_URL and try again.', 'red');
    log('Make sure your database is running and accessible.', 'yellow');
    throw error;
  }
}

async function createMigration(name) {
  if (!name) {
    log('❌ Please provide a migration name', 'red');
    log('Usage: node scripts/setup-database.js migrate <name>', 'yellow');
    process.exit(1);
  }

  log(`Creating migration: ${name}`, 'blue');
  runCommand(`npx prisma migrate dev --name ${name}`);
}

async function resetDatabase() {
  log('⚠️  Resetting database (this will delete all data)...', 'yellow');

  // Confirm action
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Are you sure you want to reset the database? (yes/no): ', (answer) => {
    if (answer.toLowerCase() === 'yes') {
      try {
        runCommand('npx prisma migrate reset --force');
        log('✅ Database reset complete!', 'green');
      } catch (error) {
        log('❌ Database reset failed', 'red');
        throw error;
      }
    } else {
      log('Database reset cancelled', 'blue');
    }
    rl.close();
  });
}

async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'setup':
      await setupDatabase();
      break;
    case 'migrate':
      await createMigration(arg);
      break;
    case 'reset':
      await resetDatabase();
      break;
    default:
      log('AGENT Database Management', 'bright');
      log('');
      log('Usage:', 'bright');
      log('  node scripts/setup-database.js setup     - Setup database and run migrations', 'cyan');
      log('  node scripts/setup-database.js migrate <name> - Create new migration', 'cyan');
      log('  node scripts/setup-database.js reset     - Reset database (WARNING: deletes all data)', 'cyan');
      break;
  }
}

if (require.main === module) {
  main().catch(error => {
    log(`Database operation failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { setupDatabase, createMigration, resetDatabase };
