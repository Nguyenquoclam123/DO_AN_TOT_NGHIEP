
const { DataSource } = require('typeorm');

const ds = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '123456',
  database: 'doantotnghiep',
  entities: [],
});

async function check() {
  try {
    await ds.initialize();
    const settings = await ds.query('SELECT * FROM settings WHERE "key" LIKE \'%ai_%\'');
    
    console.log('--- AI SETTINGS ---');
    console.table(settings);
    
    await ds.destroy();
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

check();
