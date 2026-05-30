const { Client } = require('pg');

async function checkOrphanJobs() {
  const client = new Client({
    user: 'postgres', host: 'localhost', database: 'doantotnghiep', password: '123456', port: 5432,
  });

  try {
    await client.connect();
    const res = await client.query("SELECT id, title FROM jobs WHERE company_id IS NULL;");
    console.log('Orphan jobs:', res.rows);
  } catch (err) {
    console.error(err.stack);
  } finally {
    await client.end();
  }
}

checkOrphanJobs();
