// Supabase client configuration
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_KEY must be set in environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test database connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('id')
      .limit(1);
    
    if (error && error.code !== '42P01') { // 42P01 means table doesn't exist, which is okay
      console.error('Supabase connection error:', error.message);
      return false;
    }
    
    console.log('Supabase database connected successfully');
    return true;
  } catch (err) {
    console.error('Supabase connection failed:', err.message);
    return false;
  }
};

module.exports = {
  supabase,
  testConnection
};
