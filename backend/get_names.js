const { Pool } = require("pg");

const remoteUrl = "postgresql://map_ucn_db_user:XLKTscDZb5hWlFSX3qh0KIyR6W3ocOTC@dpg-d5ej90be5dus73fmp84g-a.oregon-postgres.render.com/map_ucn_db";

async function getData() {
    const pool = new Pool({
        connectionString: remoteUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        console.log("--- EDIFICIOS ---");
        const edificiosRes = await client.query("SELECT nombre FROM edificio ORDER BY nombre");
        edificiosRes.rows.forEach(r => console.log(r.nombre));

        console.log("\n--- SALAS ---");
        const salasRes = await client.query("SELECT nombre_sala FROM sala ORDER BY nombre_sala");
        salasRes.rows.forEach(r => console.log(r.nombre_sala));

        client.release();
    } catch (err) {
        console.error("Error retrieving data:", err.message);
    } finally {
        await pool.end();
    }
}

getData();
