// Fix admin password in Render - with hardcoded URL
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// IMPORTANTE: Esta es la URL correcta de Render
const DATABASE_URL = 'postgresql://map_ucn_db_user:XLKTscDZb5hWlFSX3qh0KIyR6W3ocOTC@dpg-d5ej90be5dus73fmp84g-a.oregon-postgres.render.com/map_ucn_db';

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function fixPassword() {
    try {
        console.log('🔧 Conectando a Render...\n');

        // Test connection
        await pool.query('SELECT NOW()');
        console.log('✅ Conexión exitosa\n');

        // Check current admin
        console.log('📋 Verificando administrador actual...');
        const checkResult = await pool.query(
            'SELECT id_admin, nombre, email, password_hash FROM administrador WHERE email = $1',
            ['admin@ucn.cl']
        );

        if (checkResult.rows.length === 0) {
            console.log('❌ No se encontró el administrador');
            return;
        }

        console.log('✅ Admin encontrado:', checkResult.rows[0].nombre);
        console.log('   Email:', checkResult.rows[0].email);
        console.log('   Hash actual:', checkResult.rows[0].password_hash.substring(0, 30) + '...\n');

        // Generate new hash
        const password = 'admin123';
        console.log('🔐 Generando nuevo hash para password:', password);
        const newHash = await bcrypt.hash(password, 10);
        console.log('✅ Hash generado:', newHash.substring(0, 30) + '...');
        console.log('   Longitud:', newHash.length);
        console.log('   Formato:', newHash.startsWith('$2b$') ? 'bcrypt válido' : 'INVÁLIDO');

        // Verify the hash works before updating
        console.log('\n🧪 Probando hash antes de actualizar...');
        const testVerify = await bcrypt.compare(password, newHash);
        console.log('   Verificación:', testVerify ? '✅ EXITOSA' : '❌ FALLÓ');

        if (!testVerify) {
            console.log('❌ El hash generado no funciona. Abortando.');
            return;
        }

        // Update password
        console.log('\n💾 Actualizando contraseña en base de datos...');
        const updateResult = await pool.query(
            'UPDATE administrador SET password_hash = $1 WHERE email = $2 RETURNING id_admin, nombre, email',
            [newHash, 'admin@ucn.cl']
        );

        console.log('✅ Contraseña actualizada:');
        console.log('   ID:', updateResult.rows[0].id_admin);
        console.log('   Nombre:', updateResult.rows[0].nombre);
        console.log('   Email:', updateResult.rows[0].email);

        // Final verification
        console.log('\n🔍 Verificación final...');
        const finalCheck = await pool.query(
            'SELECT password_hash FROM administrador WHERE email = $1',
            ['admin@ucn.cl']
        );

        const finalVerify = await bcrypt.compare(password, finalCheck.rows[0].password_hash);
        console.log('   Hash almacenado:', finalCheck.rows[0].password_hash.substring(0, 30) + '...');
        console.log('   Verificación:', finalVerify ? '✅ EXITOSA' : '❌ FALLÓ');

        if (finalVerify) {
            console.log('\n🎉 ¡ÉXITO! La contraseña está correctamente configurada.');
            console.log('\nCredenciales de login:');
            console.log('   Email: admin@ucn.cl');
            console.log('   Password: admin123');
        } else {
            console.log('\n❌ ERROR: La verificación final falló');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await pool.end();
    }
}

fixPassword();
