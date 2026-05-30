const { Client } = require('pg');

async function checkAllJobs() {
  const client = new Client({
    user: 'postgres', host: 'localhost', database: 'doantotnghiep', password: '123456', port: 5432,
  });

  try {
    await client.connect();
    const allJobsRes = await client.query("SELECT j.id, j.title, j.company_id, c.name as company_name FROM jobs j LEFT JOIN companies c ON j.company_id = c.id;");
    console.log('Total jobs in database:', allJobsRes.rows.length);
    console.log('All jobs:', allJobsRes.rows);
  } catch (err) {
    console.error(err.stack);
  } finally {
    await client.end();
  }
}

checkAllJobs();
