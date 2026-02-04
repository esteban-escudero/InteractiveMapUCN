// Check password hash in Render database
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkPasswordHash() {
    try {
        console.log('Verificando hash de contraseña en Render...\n');

        const result = await pool.query(
            'SELECT id_admin, nombre, email, password_hash FROM administrador WHERE email = $1',
            ['admin@ucn.cl']
        );

        if (result.rows.length === 0) {
            console.log('No se encontró el administrador');
            return;
        }

        const admin = result.rows[0];
        console.log('Administrador encontrado:');
        console.log('- ID:', admin.id_admin);
        console.log('- Nombre:', admin.nombre);
        console.log('- Email:', admin.email);
        console.log('- Password Hash:', admin.password_hash);
        console.log('- Hash Length:', admin.password_hash.length);
        console.log('- Starts with $2b$:', admin.password_hash.startsWith('$2b$'));

        // Test password verification
        const bcrypt = require('bcryptjs');
        const testPassword = 'admin123';

        console.log('\n Probando verificación de contraseña...');
        const isValid = await bcrypt.compare(testPassword, admin.password_hash);
        console.log('- Contraseña "admin123" es válida:', isValid);

        if (!isValid) {
            console.log('\n La contraseña no coincide. Generando nuevo hash...');
            const newHash = await bcrypt.hash(testPassword, 10);
            console.log('- Nuevo hash:', newHash);
            console.log('\n Para actualizar, ejecuta:');
            console.log(`UPDATE administrador SET password_hash = '${newHash}' WHERE email = 'admin@ucn.cl';`);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkPasswordHash();
