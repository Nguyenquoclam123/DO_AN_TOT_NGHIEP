const { Client } = require('pg');

async function fixSharedJobs() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'doantotnghiep',
        password: '123456',
        port: 5432,
    });

    try {
        await client.connect();
        console.log('--- STARTING RETROACTIVE CLONING (FIXED COLUMNS) ---');

        // 1. Find jobs that are linked to more than 1 campaign
        const res = await client.query(`
            SELECT job_id, COUNT(campaign_id) as campaign_count
            FROM job_campaign_mapping
            GROUP BY job_id
            HAVING COUNT(campaign_id) > 1;
        `);

        console.log(`Found ${res.rows.length} shared job records to fix.`);

        for (const row of res.rows) {
            const sharedJobId = row.job_id;
            
            // Get all campaigns for this shared job
            const campaignsRes = await client.query(`
                SELECT campaign_id FROM job_campaign_mapping WHERE job_id = $1
            `, [sharedJobId]);

            const campaigns = campaignsRes.rows;
            // Keep the first campaign linked to the original job, clone for the rest
            const campaignsToCloneFor = campaigns.slice(1);

            console.log(`Job ${sharedJobId} is shared by ${campaigns.length} campaigns. Cloning for ${campaignsToCloneFor.length} campaigns...`);

            for (const camp of campaignsToCloneFor) {
                const campaignId = camp.campaign_id;

                // 2. Clone the job record
                const insertJobRes = await client.query(`
                    INSERT INTO jobs (
                        title, description, responsibilities, benefits, company_id, category_id, 
                        min_salary, max_salary, work_location, type, position_id, level_id, 
                        quantity, min_experience, experience_note, min_education, certificates, status,
                        created_at, updated_at
                    )
                    SELECT 
                        title, description, responsibilities, benefits, company_id, category_id, 
                        min_salary, max_salary, work_location, type, position_id, level_id, 
                        quantity, min_experience, experience_note, min_education, certificates, 'ACTIVE',
                        now(), now()
                    FROM jobs WHERE id = $1
                    RETURNING id;
                `, [sharedJobId]);

                const newJobId = insertJobRes.rows[0].id;

                // 3. Update the mapping to point to the new job
                await client.query(`
                    UPDATE job_campaign_mapping 
                    SET job_id = $1 
                    WHERE job_id = $2 AND campaign_id = $3
                `, [newJobId, sharedJobId, campaignId]);

                // 4. Clone Skills
                await client.query(`
                    INSERT INTO job_skills (skill_name, is_required, job_id, created_at, updated_at)
                    SELECT skill_name, is_required, $1, now(), now()
                    FROM job_skills WHERE job_id = $2
                `, [newJobId, sharedJobId]);

                // 5. Clone Requirements (Using correct columns)
                await client.query(`
                    INSERT INTO job_requirements (required_position, min_years, industry_context, job_id, created_at, updated_at)
                    SELECT required_position, min_years, industry_context, $1, now(), now()
                    FROM job_requirements WHERE job_id = $2
                `, [newJobId, sharedJobId]);

                console.log(`  - Cloned into new Job ID: ${newJobId} for Campaign: ${campaignId}`);
            }
        }

        console.log('\n✅ DONE: All shared jobs have been isolated into unique records.');

    } catch (err) {
        console.error('Error during fix:', err);
    } finally {
        await client.end();
    }
}

fixSharedJobs();
