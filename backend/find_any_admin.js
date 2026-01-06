const { Pool } = require("pg");

async function findAdminRecord() {
    const dbPool = new Pool({
        host: 'localhost',
        port: 5433,
        database: 'InteractiveMapDB',
        user: 'postgres',
        password: 'admin'
    });

    try {
        const tableRes = await dbPool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
        const tables = tableRes.rows.map(r => r.table_name);

        for (const table of tables) {
            try {
                const columnRes = await dbPool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND (column_name LIKE '%email%' OR column_name LIKE '%pass%');`);
                if (columnRes.rows.length > 0) {
                    const dataRes = await dbPool.query(`SELECT * FROM ${table} LIMIT 5;`);
                    if (dataRes.rows.length > 0) {
                        console.log(`\n💎 Registro encontrado en tabla [${table}]:`);
                        console.log(JSON.stringify(dataRes.rows, null, 2));
                    }
                }
            } catch (e) { }
        }
    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await dbPool.end();
    }
}

findAdminRecord();
