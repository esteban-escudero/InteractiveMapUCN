// Debug login process
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function debugLogin() {
    try {
        const email = 'admin@ucn.cl';
        const password = 'admin123';

        console.log('🔍 Debugging login process...\n');
        console.log('1️⃣ Buscando admin por email:', email);

        const result = await pool.query(
            'SELECT id_admin, email, password_hash, nombre, activo FROM administrador WHERE email = $1 AND activo = true',
            [email]
        );

        if (result.rows.length === 0) {
            console.log('❌ Admin no encontrado o inactivo');
            return;
        }

        const admin = result.rows[0];
        console.log('✅ Admin encontrado:');
        console.log('   - ID:', admin.id_admin);
        console.log('   - Nombre:', admin.nombre);
        console.log('   - Email:', admin.email);
        console.log('   - Activo:', admin.activo);
        console.log('   - Hash length:', admin.password_hash.length);

        console.log('\n2️⃣ Verificando contraseña...');
        const isValid = await bcrypt.compare(password, admin.password_hash);
        console.log('   - Resultado:', isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA');

        if (!isValid) {
            console.log('\n⚠️  La contraseña no coincide. Probando con hash directo...');
            // Try to see what the hash looks like
            console.log('   - Hash almacenado:', admin.password_hash.substring(0, 20) + '...');

            // Generate a test hash to compare format
            const testHash = await bcrypt.hash(password, 10);
            console.log('   - Hash de prueba:', testHash.substring(0, 20) + '...');
            return;
        }

        console.log('\n3️⃣ Generando tokens...');
        console.log('   - JWT_SECRET presente:', !!process.env.JWT_SECRET);
        console.log('   - JWT_REFRESH_SECRET presente:', !!process.env.JWT_REFRESH_SECRET);

        if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
            console.log('❌ Faltan variables de entorno JWT');
            return;
        }

        const accessToken = jwt.sign(
            { id: admin.id_admin, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: admin.id_admin, email: admin.email, type: 'refresh' },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        console.log('✅ Tokens generados exitosamente');
        console.log('   - Access token:', accessToken.substring(0, 30) + '...');
        console.log('   - Refresh token:', refreshToken.substring(0, 30) + '...');

        console.log('\n🎉 Login debería funcionar correctamente');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await pool.end();
    }
}

debugLogin();
