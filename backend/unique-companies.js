const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: 'backend/.env' });

async function uniqueCompanies() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    console.log('Connected to DB');

    // 1. Get all employers
    const userRes = await client.query("SELECT id, email, \"firstName\", \"lastName\" FROM users WHERE role = 'EMPLOYER'");
    const employers = userRes.rows;
    console.log(`Found ${employers.length} employers.`);

    for (const user of employers) {
      console.log(`Processing user: ${user.email}`);

      // 2. Create a unique company for this user
      const companyName = `${user.firstName || 'Employer'}'s ${user.lastName || 'Corp'}`;
      const companyId = require('crypto').randomUUID();

      await client.query(
        "INSERT INTO companies (id, name, description, user_id, status, is_verified) VALUES ($1, $2, $3, $4, $5, $6)",
        [companyId, companyName, `Exclusive recruitment space for ${user.email}`, user.id, 'ACTIVE', true]
      );

      // 3. Link user to this company
      await client.query(
        "UPDATE users SET company_id = $1 WHERE id = $2",
        [companyId, user.id]
      );

      console.log(`  -> Created and linked company: ${companyName} (${companyId})`);
    }

    console.log('All employers now have unique companies.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

uniqueCompanies();
