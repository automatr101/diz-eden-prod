import { createClient } from '@supabase/supabase-js';const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function check() {
  const { data, error } = await supabase.from('bookings').select('id').limit(1);
  if (error) {
    console.error("Error:", error.message, error.code);
    process.exit(1);
  } else {
    console.log("Success! Table exists. Data:", data);
  }
}

check();
