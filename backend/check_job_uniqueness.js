const { Client } = require('pg');

async function checkJobs() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'doantotnghiep',
        password: '123456',
        port: 5432,
    });

    try {
        await client.connect();
        console.log('--- CHECKING JOB RECORDS ---');
        const res = await client.query(`
            SELECT 
                j.id as job_id, 
                j.title, 
                c.name as campaign_name,
                (SELECT count(*) FROM applications a WHERE a."job_id" = j.id) as app_count
            FROM jobs j
            LEFT JOIN job_campaign_mapping jcm ON j.id = jcm."job_id"
            LEFT JOIN campaigns c ON jcm."campaign_id" = c.id
            ORDER BY c.name;
        `);
        
        console.table(res.rows);
        
        const uniqueIds = new Set(res.rows.map(r => r.job_id));
        console.log(`Total rows: ${res.rows.length}`);
        console.log(`Unique Job IDs: ${uniqueIds.size}`);
        
        if (uniqueIds.size < res.rows.length) {
            console.log('\n⚠️ WARNING: You have shared Job IDs across multiple campaigns!');
        } else {
            console.log('\n✅ SUCCESS: All jobs have unique IDs.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkJobs();
