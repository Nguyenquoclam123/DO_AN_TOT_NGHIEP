const { Client } = require('pg');

async function addColumns() {
  const client = new Client({
    user: 'postgres', host: 'localhost', database: 'doantotnghiep', password: '123456', port: 5432,
  });

  try {
    await client.connect();
    
    // Add status column
    await client.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'ACTIVE';");
    console.log('Added status column');
    
    // Add expired_at column
    await client.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS expired_at TIMESTAMP;");
    console.log('Added expired_at column');
    
  } catch (err) {
    console.error(err.stack);
  } finally {
    await client.end();
  }
}

addColumns();
