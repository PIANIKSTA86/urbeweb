// Cargar variables de entorno desde .env
import dotenv from 'dotenv';
dotenv.config();

// Configuración para MySQL y Drizzle ORM
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL debe estar configurada. ¿Olvidaste crear la base de datos?",
  );
}

const pool = mysql.createPool({ uri: process.env.DATABASE_URL });
export const db = drizzle(pool);