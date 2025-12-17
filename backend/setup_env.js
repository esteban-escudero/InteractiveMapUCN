const fs = require('fs');
const content = `# Servidor
PORT=3001
NODE_ENV=development

# Base de Datos
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=admin
DB_NAME=InteractiveMapDB

# JWT
JWT_SECRET=tu_clave_secreta_aqui
JWT_REFRESH_SECRET=tu_clave_secreta_refresh_aqui
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
`;

try {
    fs.writeFileSync('backend/.env', content);
    console.log('Successfully wrote backend/.env');
} catch (error) {
    console.error('Error writing .env:', error);
}
