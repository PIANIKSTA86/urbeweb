// Modelo para la tabla de terceros usando Drizzle ORM
// Esquema y funciones CRUD

import { db } from '../db.js';
import { terceros } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

// Obtener todos los terceros
async function getTerceros() {
  return await db.select().from(terceros);
}

// Crear un nuevo tercero
async function createTercero(data) {
  await db.insert(terceros).values(data);
  // Buscar el tercero recién creado por número de identificación
  const [nuevoTercero] = await db.select().from(terceros).where(eq(terceros.numeroIdentificacion, data.numeroIdentificacion));
  return nuevoTercero;
}

// Actualizar tercero
async function updateTercero(id, data) {
  await db.update(terceros).set(data).where(eq(terceros.id, id));
  const [actualizado] = await db.select().from(terceros).where(eq(terceros.id, id));
  return actualizado;
}

// Eliminar tercero
async function deleteTercero(id) {
  return await db.delete(terceros).where(eq(terceros.id, id));
}

export { getTerceros, createTercero, updateTercero, deleteTercero };