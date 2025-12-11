const pool = require("../config/database");

const addPlanosColumn = async () => {
    try {
        console.log("Adding 'planos' column to 'edificio' table...");
        const client = await pool.connect();

        // Check if column exists
        const checkQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='edificio' AND column_name='planos';
        `;
        const checkResult = await client.query(checkQuery);

        if (checkResult.rows.length === 0) {
            // Add column if it doesn't exist
            const alterQuery = `ALTER TABLE edificio ADD COLUMN planos JSONB DEFAULT '[]'::jsonb;`;
            await client.query(alterQuery);
            console.log("✅ Column 'planos' added successfully.");
        } else {
            console.log("ℹ️ Column 'planos' already exists.");
        }

        client.release();
    } catch (err) {
        console.error("❌ Error adding column:", err);
    } finally {
        await pool.end();
    }
};

addPlanosColumn();
