// Test login endpoint
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

const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);

    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('Response body:', body);
        try {
            const parsed = JSON.parse(body);
            console.log('Parsed:', JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log('Could not parse as JSON');
        }
    });
});

req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
});

req.write(data);
req.end();
