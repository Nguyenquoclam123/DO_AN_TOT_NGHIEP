const { Client } = require('pg');

async function checkCampaignName() {
  const client = new Client({
    user: 'postgres', host: 'localhost', database: 'doantotnghiep', password: '123456', port: 5432,
  });

  try {
    await client.connect();
    const res = await client.query("SELECT id, name FROM campaigns WHERE name = 'Đợt C';");
    console.log('Campaign info:', res.rows);
  } catch (err) {
    console.error(err.stack);
  } finally {
    await client.end();
  }
}

checkCampaignName();
