const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/buildings',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const buildings = JSON.parse(data);
            const ciencias = buildings.find(b => b.nombre.includes("Ciencias Básicas"));
            if (ciencias) {
                console.log("Building found:", ciencias.nombre);
                console.log("Planos:", JSON.stringify(ciencias.planos, null, 2));
            } else {
                console.log("Building not found");
            }
        } catch (e) {
            console.error("Error parsing JSON:", e);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message} `);
});

req.end();
