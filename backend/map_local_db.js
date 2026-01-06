const { Pool } = require("pg");

async function mapLocalDatabases() {
    const rootPool = new Pool({
        host: 'localhost',
        port: 5433,
        user: 'postgres',
        password: 'admin'
    });

    try {
        const dbRes = await rootPool.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
        const databases = dbRes.rows.map(r => r.datname);
        console.log("📂 Bases de datos encontradas:", databases);

        for (const dbName of databases) {
            console.log(`\n🔍 Revisando DB: ${dbName}`);
            const dbPool = new Pool({
                host: 'localhost',
                port: 5433,
                database: dbName,
                user: 'postgres',
                password: 'admin'
            });

            try {
                const tableRes = await dbPool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
                const tables = tableRes.rows.map(r => r.table_name);
                console.log(`   Tablas: ${tables.join(', ')}`);

                if (tables.includes('administrador')) {
                    const adminRes = await dbPool.query("SELECT count(*) FROM administrador;");
                    console.log(`   🚀 ¡TABLA administrador DETECTADA! Registros: ${adminRes.rows[0].count}`);
                    if (parseInt(adminRes.rows[0].count) > 0) {
                        const dataRes = await dbPool.query("SELECT nombre, email FROM administrador;");
                        console.table(dataRes.rows);
                    }
                }
            } catch (e) {
                console.log(`   (No se pudo leer)`);
            } finally {
                await dbPool.end();
            }
        }
    } catch (err) {
        console.error("❌ Error raíz:", err.message);
    } finally {
        await rootPool.end();
    }
}

mapLocalDatabases();
