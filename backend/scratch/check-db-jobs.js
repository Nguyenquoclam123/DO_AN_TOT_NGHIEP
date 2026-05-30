const { Client } = require('pg');

async function checkJobs() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'doantotnghiep',
    password: '123456',
    port: 5432,
  });

  try {
    await client.connect();
    
    // Get company ID of the user 'kiai'
    const userRes = await client.query("SELECT email, company_id FROM users WHERE email LIKE '%kiai%';");
    console.log('User info:', userRes.rows);
    
    if (userRes.rows.length > 0) {
      const companyId = userRes.rows[0].company_id;
      
      // Count all jobs for this company
      const jobsCountRes = await client.query("SELECT COUNT(*) FROM jobs WHERE company_id = $1;", [companyId]);
      console.log('Total jobs for company:', jobsCountRes.rows[0].count);
      
      // List all jobs for this company
      const jobsRes = await client.query("SELECT id, title, created_at FROM jobs WHERE company_id = $1 ORDER BY created_at DESC;", [companyId]);
      console.log('Jobs list:', jobsRes.rows);
    } else {
      console.log('User not found');
    }
    
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
  }
}

checkJobs();
