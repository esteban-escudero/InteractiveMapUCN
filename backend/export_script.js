const pool = require("./config/database");
const fs = require('fs');

async function exportData() {
    let sql = "-- Exportación manual\nSET client_encoding = 'UTF8';\n\n";

    async function safeQuery(q) {
        try {
            return await pool.query(q);
        } catch (e) {
            console.error(`Error en query [${q}]:`, e.message);
            return { rows: [] };
        }
    }

    try {
        console.log("Exportando edificios...");
        const edif = await safeQuery("SELECT id_edificio, nombre, descripcion, tipo, estado, planos, ST_AsText(ubicacion) as wkt FROM edificio");
        for (const r of edif.rows) {
            sql += `INSERT INTO edificio (id_edificio, nombre, descripcion, tipo, estado, planos, ubicacion) VALUES (${r.id_edificio}, '${r.nombre.replace(/'/g, "''")}', '${(r.descripcion || '').replace(/'/g, "''")}', '${r.tipo}', '${r.estado}', '${JSON.stringify(r.planos)}'::jsonb, ST_GeomFromText('${r.wkt}', 4326)) ON CONFLICT (id_edificio) DO NOTHING;\n`;
        }

        console.log("Exportando salas...");
        const salas = await safeQuery("SELECT id_sala, id_edificio, nombre_sala, piso, tipo_sala, accesible_silla_ruedas, ST_AsText(ubicacion) as wkt FROM sala");
        for (const r of salas.rows) {
            sql += `INSERT INTO sala (id_sala, id_edificio, nombre_sala, piso, tipo_sala, accesible_silla_ruedas, ubicacion) VALUES (${r.id_sala}, ${r.id_edificio}, '${r.nombre_sala.replace(/'/g, "''")}', ${r.piso}, '${r.tipo_sala}', ${r.accesible_silla_ruedas}, ST_GeomFromText('${r.wkt}', 4326)) ON CONFLICT (id_sala) DO NOTHING;\n`;
        }

        console.log("Exportando planos...");
        const planos = await safeQuery("SELECT * FROM plano");
        for (const r of planos.rows) {
            sql += `INSERT INTO plano (id_plano, id_edificio, piso, imagen_plano, formato_imagen, tamaño_bytes, fecha_actualizacion) VALUES (${r.id_plano}, ${r.id_edificio}, ${r.piso}, '${r.imagen_plano}', '${r.formato_imagen}', ${r.tamaño_bytes}, '${r.fecha_actualizacion.toISOString()}') ON CONFLICT (id_plano) DO NOTHING;\n`;
        }

        console.log("Exportando rutas...");
        const rutas = await safeQuery("SELECT id_ruta, nombre_ruta, tipo_ruta, distancia_metros, tiempo_estimado_minutos, activa, ST_AsText(geometria_ruta) as wkt FROM ruta");
        for (const r of rutas.rows) {
            sql += `INSERT INTO ruta (id_ruta, nombre_ruta, tipo_ruta, distancia_metros, tiempo_estimado_minutos, activa, geometria_ruta) VALUES (${r.id_ruta}, '${r.nombre_ruta.replace(/'/g, "''")}', '${r.tipo_ruta}', ${r.distancia_metros}, ${r.tiempo_estimado_minutos}, ${r.activa}, ST_GeomFromText('${r.wkt}', 4326)) ON CONFLICT (id_ruta) DO NOTHING;\n`;
        }

        console.log("Exportando usuarios...");
        const users = await safeQuery("SELECT * FROM administrador");
        for (const r of users.rows) {
            sql += `INSERT INTO administrador (id_administrador, nombre_usuario, correo, contraseña, rol) VALUES (${r.id_administrador}, '${r.nombre_usuario}', '${r.correo}', '${r.contraseña}', '${r.rol}') ON CONFLICT (id_administrador) DO NOTHING;\n`;
        }

        fs.writeFileSync('migration_data.sql', sql);
        console.log("Archivo 'migration_data.sql' generado exitosamente.");
    } catch (err) {
        console.error("Error crítico:", err);
    } finally {
        await pool.end();
    }
}

exportData();
