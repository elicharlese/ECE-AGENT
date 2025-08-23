const { createClient } = require('@supabase/supabase-js');

// Prefer server-side keys but allow NEXT_PUBLIC fallbacks for local dev
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[config/db] Missing Supabase credentials. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC fallbacks).');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Attempt a lightweight query; if the table doesn't exist, this will error
    const { error } = await supabase
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      console.error('[config/db] Test connection error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[config/db] Unexpected connection error:', err);
    return false;
  }
}

module.exports = {
  supabase,
  testConnection,
};
