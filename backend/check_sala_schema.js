const { Pool } = require("pg");

const remoteUrl = "postgresql://map_ucn_db_user:XLKTscDZb5hWlFSX3qh0KIyR6W3ocOTC@dpg-d5ej90be5dus73fmp84g-a.oregon-postgres.render.com/map_ucn_db";

async function checkSchema() {
    const pool = new Pool({
        connectionString: remoteUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        console.log("--- SCHEMA SALA ---");
        const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sala'");
        res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        client.release();
    } catch (err) {
        console.error("Error checking schema:", err.message);
    } finally {
        await pool.end();
    }
}

checkSchema();
