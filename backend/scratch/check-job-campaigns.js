const { Client } = require('pg');

async function checkJobCampaigns() {
  const client = new Client({
    user: 'postgres', host: 'localhost', database: 'doantotnghiep', password: '123456', port: 5432,
  });

  try {
    await client.connect();
    const res = await client.query(`
      SELECT j.title, c.name as campaign_name 
      FROM jobs j 
      LEFT JOIN job_campaign_mapping m ON j.id = m.job_id 
      LEFT JOIN campaigns c ON m.campaign_id = c.id 
      WHERE j.company_id = '61e9c0c1-cd63-4617-b55f-e8edac739656';
    `);
    console.log('Jobs and their campaigns:', res.rows);
  } catch (err) {
    console.error(err.stack);
  } finally {
    await client.end();
  }
}

checkJobCampaigns();
