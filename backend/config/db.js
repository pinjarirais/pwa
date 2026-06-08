const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const connectDB = async () => {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) throw error;
    console.log('Supabase PostgreSQL connected successfully');
  } catch (error) {
    console.error(`Supabase connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { supabase, connectDB };
