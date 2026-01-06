const { Pool } = require("pg");

async function checkLocalAdmin() {
    const pool = new Pool({
        host: 'localhost',
        port: 5433,
        database: 'InteractiveMapDB',
        user: 'postgres',
        password: 'admin'
    });

    try {
        const res = await pool.query("SELECT * FROM administrador;");
        console.log("📊 Usuarios Locales:");
        console.table(res.rows);
    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await pool.end();
    }
}

checkLocalAdmin();
