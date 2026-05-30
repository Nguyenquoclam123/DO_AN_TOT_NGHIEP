const { Client } = require('pg');
const client = new Client({
    connectionString: 'postgresql://postgres:123456@localhost:5432/doantotnghiep'
});

async function fix() {
    await client.connect();
    await client.query("UPDATE settings SET value = 'gemini-flash-latest' WHERE key = 'ai_model'");
    console.log('Updated ai_model to gemini-flash-latest in DB');
    await client.end();
}
fix();
