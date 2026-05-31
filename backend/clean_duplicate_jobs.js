const { Client } = require('pg');

async function cleanDuplicateJobs() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'doantotnghiep',
        password: '123456',
        port: 5432,
    });

    try {
        await client.connect();
        console.log('--- STARTING DATABASE CLEANUP FOR DUPLICATE JOBS ---');

        // Fetch all jobs along with campaign count and application count
        const jobsRes = await client.query(`
            SELECT 
                j.id, 
                j.title, 
                j.company_id, 
                j.description,
                (SELECT COUNT(*) FROM job_campaign_mapping jcm WHERE jcm.job_id = j.id) as campaign_count,
                (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as app_count
            FROM jobs j
        `);

        const jobs = jobsRes.rows;
        console.log(`Found ${jobs.length} total job records in the database.`);

        let deletedCount = 0;

        for (const job of jobs) {
            // Check if this job has no campaign and no applications
            if (parseInt(job.campaign_count) === 0 && parseInt(job.app_count) === 0) {
                // Look for a duplicate job that is linked to a campaign
                const duplicate = jobs.find(other => 
                    other.id !== job.id &&
                    other.title === job.title &&
                    other.company_id === job.company_id &&
                    other.description === job.description &&
                    parseInt(other.campaign_count) > 0
                );

                if (duplicate) {
                    console.log(`Found duplicate standalone job to delete:`);
                    console.log(`  - Standalone ID: ${job.id}`);
                    console.log(`  - Campaign Job ID (Keeping): ${duplicate.id}`);
                    console.log(`  - Title: ${job.title}`);

                    // Safely delete standalone job references from other tables first
                    await client.query('DELETE FROM job_skills WHERE job_id = $1', [job.id]);
                    await client.query('DELETE FROM job_requirements WHERE job_id = $1', [job.id]);
                    await client.query('DELETE FROM job_question_sets WHERE job_id = $1', [job.id]);
                    await client.query('DELETE FROM job_campaign_mapping WHERE job_id = $1', [job.id]);
                    
                    // Finally delete the job itself
                    await client.query('DELETE FROM jobs WHERE id = $1', [job.id]);

                    console.log(`Successfully deleted duplicate job ${job.id}.\n`);
                    deletedCount++;
                }
            }
        }

        console.log(`--- CLEANUP COMPLETED: Deleted ${deletedCount} duplicate job(s) ---`);

    } catch (err) {
        console.error('Error during cleanup:', err);
    } finally {
        await client.end();
    }
}

cleanDuplicateJobs();
