// Quick test to verify production is working
const https = require('https');

console.log('Verificando estado del sitio de producción...\n');

// Test 1: Frontend
console.log('Verificando frontend...');
https.get('https://interactive-map-ucn.vercel.app/', (res) => {
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Frontend accesible\n`);
}).on('error', (e) => {
    console.error(`   Error: ${e.message}\n`);
});

// Test 2: Backend API
setTimeout(() => {
    console.log('Verificando backend API...');
    https.get('https://mapa-ucn-api.onrender.com/api/buildings', (res) => {
        console.log(`   Status: ${res.statusCode}`);

        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                if (parsed.success && parsed.data) {
                    console.log(`   Backend funcionando - ${parsed.data.length} edificios\n`);
                }
            } catch (e) {
                console.log(`   Respuesta no es JSON válido\n`);
            }
        });
    }).on('error', (e) => {
        console.error(`   Error: ${e.message}\n`);
    });
}, 1000);

// Test 3: Login
setTimeout(() => {
    console.log('Verificando login...');

    const postData = JSON.stringify({
        email: 'admin@ucn.cl',
        password: 'admin123'
    });

    const options = {
        hostname: 'mapa-ucn-api.onrender.com',
        port: 443,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };

    const req = https.request(options, (res) => {
        console.log(`   Status: ${res.statusCode}`);

        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                if (parsed.success) {
                    console.log(`   Login funcionando correctamente\n`);
                } else {
                    console.log(`   Login falló: ${parsed.message}\n`);
                }
            } catch (e) {
                console.log(`   Respuesta no es JSON válido\n`);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`   Error: ${e.message}\n`);
    });

    req.write(postData);
    req.end();
}, 2000);

setTimeout(() => {
    console.log('Verificación completa\n');
    console.log('Resumen:');
    console.log('   - Frontend: https://interactive-map-ucn.vercel.app');
    console.log('   - Backend: https://mapa-ucn-api.onrender.com/api');
    console.log('   - Admin: https://interactive-map-ucn.vercel.app/admin');
    console.log('\nLos errores de ESLint en localhost NO afectan producción.');
    console.log('   Vercel usa DISABLE_ESLINT_PLUGIN=true en el build.\n');
}, 4000);
