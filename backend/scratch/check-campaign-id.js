const { Client } = require('pg');

async function checkCampaign() {
  const client = new Client({
    user: 'postgres', host: 'localhost', database: 'doantotnghiep', password: '123456', port: 5432,
  });

  try {
    await client.connect();
    const res = await client.query("SELECT id, name, company_id FROM campaigns WHERE id = 'e2b3fefa-10c6-4f6b-ba4e-9c5bc770d5f5';");
    console.log('Campaign info:', res.rows);
    
    const usersRes = await client.query("SELECT email, company_id FROM users WHERE email = 'kiai@gmail.com';");
    console.log('User info:', usersRes.rows);
  } catch (err) {
    console.error(err.stack);
  } finally {
    await client.end();
  }
}

checkCampaign();
