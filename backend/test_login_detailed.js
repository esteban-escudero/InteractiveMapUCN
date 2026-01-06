// Test login with detailed error logging
const https = require('https');

const data = JSON.stringify({
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
        'Content-Length': data.length
    }
};

console.log('🔍 Testing login endpoint...\n');
console.log('URL:', `https://${options.hostname}${options.path}`);
console.log('Payload:', data);
console.log('\n---\n');

const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
    console.log(`Headers:`, JSON.stringify(res.headers, null, 2));
    console.log('\n---\n');

    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('Response body:', body);
        console.log('\n---\n');

        try {
            const parsed = JSON.parse(body);
            console.log('Parsed response:');
            console.log(JSON.stringify(parsed, null, 2));

            if (res.statusCode === 500) {
                console.log('\n❌ ERROR 500 - Internal Server Error');
                console.log('Possible causes:');
                console.log('1. Missing JWT_SECRET or JWT_REFRESH_SECRET in Render');
                console.log('2. Database connection issue');
                console.log('3. Error in password verification');
                console.log('4. Missing bcryptjs dependency');
            } else if (res.statusCode === 401) {
                console.log('\n❌ ERROR 401 - Unauthorized');
                console.log('Password verification failed');
            } else if (res.statusCode === 200) {
                console.log('\n✅ LOGIN SUCCESSFUL!');
            }
        } catch (e) {
            console.log('Could not parse as JSON');
            console.log('Raw response:', body);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Request Error: ${e.message}`);
});

req.write(data);
req.end();
