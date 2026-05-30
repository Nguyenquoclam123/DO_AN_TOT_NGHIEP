const { Client } = require('pg');
const client = new Client({
    connectionString: 'postgresql://postgres:123456@localhost:5432/doantotnghiep'
});

async function fixData() {
    await client.connect();
    try {
        // 1. Create company Kiai
        const compRes = await client.query("INSERT INTO companies (id, name, description) VALUES (gen_random_uuid(), 'Kiai Company', 'Specialized in AI') RETURNING id");
        const kiaiCompId = compRes.rows[0].id;
        console.log('Created Kiai Company with ID:', kiaiCompId);

        // 2. Link user kiai to it
        await client.query("UPDATE users SET company_id = $1 WHERE email = 'kiai@gmail.com'", [kiaiCompId]);
        console.log('Linked kiai@gmail.com to Kiai Company');
    } catch (e) {
        console.error('Error fixing data:', e);
    } finally {
        await client.end();
    }
}

fixData();
