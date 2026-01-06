const { Pool } = require("pg");
const remoteUrl = "postgresql://map_ucn_db_user:XLKTscDZb5hWlFSX3qh0KIyR6W3ocOTC@dpg-d5ej90be5dus73fmp84g-a.oregon-postgres.render.com/map_ucn_db";

async function checkAdmin() {
    const pool = new Pool({
        connectionString: remoteUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log("✅ Conexión establecida.");

        const res = await client.query("SELECT id_admin, nombre, email, password_hash FROM administrador;");
        console.log(`📊 Usuarios encontrados: ${res.rows.length}`);
        res.rows.forEach(user => {
            console.log(`- ID: ${user.id_admin}, Nombre: ${user.nombre}, Email: ${user.email}, Pass (hash): ${user.password_hash}`);
        });

        client.release();
    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await pool.end();
    }
}

checkAdmin();
