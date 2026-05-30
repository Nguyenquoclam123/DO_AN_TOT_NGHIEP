
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
    const users = await ds.query('SELECT count(*) FROM users');
    const positions = await ds.query('SELECT count(*) FROM positions');
    const sets = await ds.query('SELECT count(*) FROM question_sets');
    
    console.log('--- DB CHECK ---');
    console.log('Users:', users[0].count);
    console.log('Positions:', positions[0].count);
    console.log('Sets:', sets[0].count);
    
    await ds.destroy();
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

check();
