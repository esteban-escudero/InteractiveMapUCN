const pool = require("../config/database");

const addSamplePlanos = async () => {
    try {
        console.log("Adding sample planos to building ID 1...");
        const client = await pool.connect();

        const samplePlanos = [
            {
                piso: "Piso 1",
                url: "http://localhost:3001/uploads/buildings/Ciencias_B_sicas_Piso_1_1765411712040.jpg"
            },
            {
                piso: "Piso -1",
                url: "http://localhost:3001/uploads/buildings/Ciencias_B_sicas_Piso_-1_1765411712297.jpg"
            }
        ];

        const query = `
            UPDATE edificio 
            SET planos = $1 
            WHERE id_edificio = 2 
            RETURNING nombre, planos;
        `;

        const res = await client.query(query, [JSON.stringify(samplePlanos)]);

        if (res.rows.length > 0) {
            console.log(`✅ Updated building: ${res.rows[0].nombre}`);
            console.log("Planos:", JSON.stringify(res.rows[0].planos, null, 2));
        } else {
            console.log("❌ Building ID 1 not found.");
        }

        client.release();
    } catch (err) {
        console.error("❌ Error updating planos:", err);
    } finally {
        await pool.end();
    }
};

addSamplePlanos();
