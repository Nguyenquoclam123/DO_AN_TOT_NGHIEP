const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: 'backend/.env' });

async function fixUser() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    console.log('Connected to DB');

    // Find a company
    const compRes = await client.query('SELECT id, name FROM companies LIMIT 1');
    if (compRes.rows.length === 0) {
      console.log('No company found. Creating one...');
      const newComp = await client.query("INSERT INTO companies (id, name, description) VALUES (gen_random_uuid(), 'Test Company', 'Description') RETURNING id");
      compRes.rows.push(newComp.rows[0]);
    }
    const companyId = compRes.rows[0].id;
    console.log('Using Company ID:', companyId);

    // Update user Alex
    const res = await client.query("UPDATE users SET company_id = $1 WHERE role = 'EMPLOYER' AND (\"firstName\" = 'Alex' OR email LIKE 'alex%') RETURNING id, email", [companyId]);
    if (res.rows.length > 0) {
      console.log('Updated user:', res.rows[0].email);
    } else {
      console.log('User Alex not found. Updating ALL employers just in case for testing.');
      await client.query("UPDATE users SET company_id = $1 WHERE role = 'EMPLOYER'", [companyId]);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fixUser();
