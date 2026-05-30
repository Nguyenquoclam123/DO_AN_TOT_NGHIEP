const { Client } = require('pg');

async function checkCompanies() {
  const client = new Client({
    user: 'postgres', host: 'localhost', database: 'doantotnghiep', password: '123456', port: 5432,
  });

  try {
    await client.connect();
    const res = await client.query("SELECT id, name FROM companies;");
    console.log('Companies:', res.rows);
    
    const usersRes = await client.query("SELECT id, email, company_id FROM users;");
    console.log('Users:', usersRes.rows);
  } catch (err) {
    console.error(err.stack);
  } finally {
    await client.end();
  }
}

checkCompanies();
