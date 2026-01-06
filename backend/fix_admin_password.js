// Fix admin password in Render database
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function fixAdminPassword() {
    try {
        console.log('🔧 Actualizando contraseña del administrador en Render...\n');

        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('✅ Nuevo hash generado:', hashedPassword);
        console.log('- Longitud:', hashedPassword.length);
        console.log('- Formato válido:', hashedPassword.startsWith('$2b$'));

        // Update password in database
        const result = await pool.query(
            'UPDATE administrador SET password_hash = $1 WHERE email = $2 RETURNING id_admin, nombre, email',
            [hashedPassword, 'admin@ucn.cl']
        );

        if (result.rows.length === 0) {
            console.log('\n❌ No se encontró el administrador');
            return;
        }

        console.log('\n✅ Contraseña actualizada exitosamente:');
        console.log('- ID:', result.rows[0].id_admin);
        console.log('- Nombre:', result.rows[0].nombre);
        console.log('- Email:', result.rows[0].email);

        // Verify the password works
        console.log('\n🔐 Verificando que la contraseña funciona...');
        const admin = await pool.query(
            'SELECT password_hash FROM administrador WHERE email = $1',
            ['admin@ucn.cl']
        );

        const isValid = await bcrypt.compare(password, admin.rows[0].password_hash);
        console.log('- Verificación:', isValid ? '✅ EXITOSA' : '❌ FALLÓ');

        if (isValid) {
            console.log('\n🎉 ¡Listo! Ahora puedes iniciar sesión con:');
            console.log('   Email: admin@ucn.cl');
            console.log('   Password: admin123');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

fixAdminPassword();
