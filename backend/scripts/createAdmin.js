// backend/scripts/createAdmin.js

const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5433,
  database: process.env.DB_NAME || "InteractiveMapDB",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "admin",
});

async function createAdmin() {
  try {
    // Datos del admin
    const email = "admin@ucn.cl";
    const password = "Admin123!";
    const nombre = "Administrador";

    console.log("Creando admin de prueba...");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("");

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar en BD
    const query = `
      INSERT INTO administrador (email, password_hash, nombre, activo, fecha_creacion)
      VALUES ($1, $2, $3, true, NOW())
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = $2, nombre = $3
      RETURNING id_admin, email, nombre, activo, fecha_creacion
    `;

    const result = await pool.query(query, [email, hashedPassword, nombre]);
    const admin = result.rows[0];

    console.log("Admin creado exitosamente:");
    console.log("ID:", admin.id_admin);
    console.log("Email:", admin.email);
    console.log("Nombre:", admin.nombre);
    console.log("Activo:", admin.activo);
    console.log("Fecha:", admin.fecha_creacion);
    console.log("");
    console.log("Credenciales:");
    console.log("Email:", email);
    console.log("Password:", password);
  } catch (error) {
    console.error("Error al crear admin:", error);
  } finally {
    await pool.end();
  }
}

createAdmin();
