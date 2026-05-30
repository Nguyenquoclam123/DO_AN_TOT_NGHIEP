const { Client } = require('pg');

async function checkJobsSchema() {
  const client = new Client({
    user: 'postgres', host: 'localhost', database: 'doantotnghiep', password: '123456', port: 5432,
  });

  try {
    await client.connect();
    const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'jobs';");
    console.log('Jobs columns:', res.rows);
  } catch (err) {
    console.error(err.stack);
  } finally {
    await client.end();
  }
}

checkJobsSchema();
