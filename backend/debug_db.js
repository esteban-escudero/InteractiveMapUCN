const { Pool } = require("pg");

const remoteUrl = "postgresql://map_ucn_db_user:XLKTscDZb5hWlFSX3qh0KIyR6W3ocOTC@dpg-d5ej90be5dus73fmp84g-a.oregon-postgres.render.com/map_ucn_db";

async function check() {
    const pool = new Pool({
        connectionString: remoteUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log("Conectado.");

        const extensions = await client.query("SELECT extname FROM pg_extension");
        console.log("Extensiones:", extensions.rows.map(r => r.extname));

        const tables = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
        console.log("Tablas en public:", tables.rows.map(r => r.tablename));

        client.release();
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await pool.end();
    }
}

check();
