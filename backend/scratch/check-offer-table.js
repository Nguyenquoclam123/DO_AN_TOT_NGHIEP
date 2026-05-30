const { Client } = require('pg');

async function checkTable() {
  const client = new Client({
    connectionString: "postgresql://postgres:123456@localhost:5432/doantotnghiep"
  });

  try {
    await client.connect();
    const res = await client.query("SELECT to_regclass('public.job_offers') as exists;");
    console.log('Table job_offers exists:', res.rows[0].exists);
    
    if (res.rows[0].exists) {
        const columns = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'job_offers';");
        console.log('Columns:', columns.rows);
    }
  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await client.end();
  }
}

checkTable();
