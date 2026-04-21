const https = require('https');

const SUPABASE_URL = 'https://onewyserwllwyrhvpkjw.supabase.co';
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

async function runSql(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });
    const url = new URL(`${SUPABASE_URL}/rest/v1/`);
    
    const options = {
      hostname: 'onewyserwllwyrhvpkjw.supabase.co',
      path: '/rest/v1/rpc',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    };
    resolve('using fetch approach instead');
  });
}

// Use direct table DELETE via REST
async function clearTestData() {
  const headers = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  // Delete ALL blocked_dates
  const r1 = await fetch(`${SUPABASE_URL}/rest/v1/blocked_dates?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: 'DELETE',
    headers
  });
  console.log('blocked_dates cleared:', r1.status, await r1.text());

  // Delete ALL bookings
  const r2 = await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: 'DELETE',
    headers
  });
  console.log('bookings cleared:', r2.status, await r2.text());
}

clearTestData().catch(console.error);
