const pool = require("../config/database");

const checkCienciasBasicas = async () => {
    try {
        console.log("Searching for 'Ciencias Básicas'...");
        const client = await pool.connect();

        const query = `
            SELECT id_edificio, nombre, planos 
            FROM edificio 
            WHERE nombre ILIKE '%Ciencias Básicas%';
        `;

        const res = await client.query(query);

        if (res.rows.length > 0) {
            console.log("Found building(s):");
            res.rows.forEach(b => {
                console.log(`ID: ${b.id_edificio}, Nombre: ${b.nombre}`);
                console.log(`Planos: ${JSON.stringify(b.planos, null, 2)}`);
            });
        } else {
            console.log("❌ 'Ciencias Básicas' not found.");
        }

        client.release();
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
};

checkCienciasBasicas();
