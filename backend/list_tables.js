const { Client } = require('pg');

async function listTables() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'doantotnghiep',
        password: '123456',
        port: 5432,
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

listTables();
