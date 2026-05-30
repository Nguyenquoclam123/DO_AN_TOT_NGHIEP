const { Client } = require('pg');
const client = new Client({
    connectionString: 'postgresql://postgres:123456@localhost:5432/doantotnghiep'
});

async function check() {
    await client.connect();
    const res = await client.query('SELECT id, score, "aiReport" FROM applications');
    res.rows.forEach(r => {
        console.log(`ID: ${r.id}, Score: ${r.score}, HasReport: ${!!r.aiReport}`);
    });
    await client.end();
}
check();
