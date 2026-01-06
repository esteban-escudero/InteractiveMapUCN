const { Pool } = require("pg");
require("dotenv").config();

console.log("Configurando conexión PostgreSQL:");
console.log("Host:", process.env.DB_HOST);
console.log("Puerto:", process.env.DB_PORT);
console.log("Base de datos:", process.env.DB_NAME);
console.log("Usuario:", process.env.DB_USER);

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5433,
  database: process.env.DB_NAME || "InteractiveMapDB",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "admin",
};

// Si hay DATABASE_URL (caso Render/Supabase), usamos SSL
if (process.env.DATABASE_URL) {
  dbConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = new Pool(dbConfig);

pool.on("connect", () => {
  console.log("Conectado a PostgreSQL en puerto", process.env.DB_PORT || 5433);
});

pool.on("error", (err) => {
  console.error("Error de conexión a PostgreSQL:", err);
});

module.exports = pool;
