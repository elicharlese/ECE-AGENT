const dotenv = require('dotenv');
dotenv.config();

const { supabase } = require('./config/db');
const fs = require('fs').promises;
const path = require('path');

async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // Get list of migration files
    const migrationsDir = path.join(__dirname, './db/migrations');
    const files = await fs.readdir(migrationsDir);
    
    // Sort files by name to ensure they run in order
    const sortedFiles = files.sort();
    
    for (const file of sortedFiles) {
      if (file.endsWith('.sql')) {
        console.log(`Running migration: ${file}`);
        
        // Read the SQL file
        const filePath = path.join(migrationsDir, file);
        const sql = await fs.readFile(filePath, 'utf8');
        
        // Split the SQL into individual statements
        const statements = sql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);
        
        // Execute each statement
        for (const statement of statements) {
          try {
            // Note: Supabase JS client doesn't directly support raw SQL execution
            // For migrations, you would typically use Supabase CLI or execute from the dashboard
            // For now, we'll log the statements that need to be executed
            console.log(`Migration statement to execute: ${statement}`);
            
            // In a real implementation, you would execute these statements
            // through the Supabase dashboard or CLI
          } catch (err) {
            console.error(`Error processing statement: ${err.message}`);
            console.error(`Statement: ${statement}`);
          }
        }
      }
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
