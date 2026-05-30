const { Client } = require('pg');

async function checkApplications() {
  const client = new Client({
    user: 'postgres', host: 'localhost', database: 'doantotnghiep', password: '123456', port: 5432,
  });

  try {
    await client.connect();
    const res = await client.query("SELECT a.id, u.email, j.title FROM applications a JOIN users u ON a.candidate_id = u.id JOIN jobs j ON a.job_id = j.id;");
    console.log('All applications:', res.rows);
  } catch (err) {
    console.error(err.stack);
  } finally {
    await client.end();
  }
}

checkApplications();
