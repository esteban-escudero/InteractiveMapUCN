const { Pool } = require("pg");
const fs = require('fs');

const remoteUrl = "postgresql://map_ucn_db_user:XLKTscDZb5hWlFSX3qh0KIyR6W3ocOTC@dpg-d5ej90be5dus73fmp84g-a.oregon-postgres.render.com/map_ucn_db";
const schemaFile = "schema_only.sql";
const dataFile = "migration_data.sql";

async function migrate() {
    console.log("Iniciando migración de Emergencia...");
    const pool = new Pool({
        connectionString: remoteUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log("Conexión establecida.");

        // 1. Asegurar Extensiones y Schema
        console.log("Configurando base de datos...");
        await client.query("CREATE EXTENSION IF NOT EXISTS postgis;");
        await client.query("SET search_path TO public;");

        let schemaSql = fs.readFileSync(schemaFile, 'utf8');
        schemaSql = schemaSql.replace(/^\\.*$/gm, '');

        try {
            await client.query(schemaSql);
            console.log("Estructura base creada.");
        } catch (e) {
            // Ignorar errores si ya existe
        }

        // 2. Insertar Datos con path Correcto
        console.log("Insertando datos en la nube...");
        await client.query("SET search_path TO public;"); // Vital para que encuentre las tablas

        const dataSql = fs.readFileSync(dataFile, 'utf8');
        const dataCommands = dataSql
            .split(';\n')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

        console.log(`Enviando ${dataCommands.length} paquetes de datos...`);

        for (let i = 0; i < dataCommands.length; i++) {
            try {
                let cmd = dataCommands[i];
                if (!cmd.endsWith(';')) cmd += ';';
                await client.query(cmd);
                if ((i + 1) % 50 === 0 || i === dataCommands.length - 1) {
                    process.stdout.write(`\rProgreso: ${i + 1}/${dataCommands.length}`);
                }
            } catch (e) {
                if (!e.message.includes("already exists")) {
                    console.error(`\nError en registro ${i + 1}:`, e.message);
                }
            }
        }

        client.release();
        console.log("\n\n¡SINCRONIZACIÓN COMPLETADA!");
        console.log("Todos tus edificios y rutas ya están en Render.");
        console.log("URL: https://interactive-map-ucn-ctyx.vercel.app");
    } catch (err) {
        console.error("Error crítico:", err.message);
    } finally {
        await pool.end();
    }
}

migrate();
