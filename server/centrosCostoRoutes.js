import express from 'express';
import { db } from './db.ts';
import { centrosCosto } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Obtener todos los centros de costo
router.get('/', async (req, res) => {
  try {
    console.log('[centros-costo][GET] ejecutando select * from centros_costo');
    const result = await db.select().from(centrosCosto);
    console.log('[centros-costo][GET] resultado:', result);
    res.json(result);
  } catch (err) {
    console.error('[centros-costo][GET] error:', err);
    res.status(500).json({ error: 'Error al obtener centros de costo', detalles: err.message });
  }
});

// Obtener un centro de costo por ID
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await db.select().from(centrosCosto).where(eq(centrosCosto.id, id));
    if (result.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener centro de costo', detalles: err.message });
  }
});

// Crear un centro de costo
router.post('/', async (req, res) => {
  try {
    console.log('[centros-costo][POST] body:', req.body);
  let { nombre, descripcion, estado } = req.body;
  if (estado === undefined || estado === null || estado === "") estado = 1;
  const result = await db.insert(centrosCosto).values({ nombre, descripcion, estado });
  // Para MySQL, result puede tener insertId
  const insertId = result.insertId || (result[0] && result[0].insertId);
  console.log('[centros-costo][POST] insertId:', insertId);
  res.status(201).json({ id: insertId, nombre, descripcion, estado });
  } catch (err) {
    console.error('[centros-costo][POST] error:', err);
    res.status(500).json({ error: 'Error al crear centro de costo', detalles: err.message });
  }
});

// Actualizar un centro de costo
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nombre, descripcion, estado } = req.body;
    const result = await db.update(centrosCosto)
      .set({ nombre, descripcion, estado })
      .where(eq(centrosCosto.id, id));
    if (result.affectedRows === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ message: 'Centro de costo actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar centro de costo', detalles: err.message });
  }
});

// Eliminar un centro de costo
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await db.delete(centrosCosto).where(eq(centrosCosto.id, id));
    if (result.affectedRows === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ message: 'Centro de costo eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar centro de costo', detalles: err.message });
  }
});

export default router;
