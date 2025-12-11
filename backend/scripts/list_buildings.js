const pool = require("../config/database");

const listBuildings = async () => {
    try {
        const client = await pool.connect();
        const res = await client.query("SELECT id_edificio, nombre FROM edificio ORDER BY id_edificio LIMIT 5");
        console.log("Buildings:", res.rows);
        client.release();
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
};

listBuildings();
