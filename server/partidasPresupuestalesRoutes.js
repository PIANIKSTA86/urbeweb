import express from 'express';
import { db } from './db.ts';
import { partidasPresupuestales } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Obtener todas las partidas presupuestales
router.get('/', async (_req, res) => {
  try {
    const result = await db.select().from(partidasPresupuestales);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener partidas presupuestales', detalles: err.message });
  }
});

// Obtener una partida presupuestal por ID
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await db.select().from(partidasPresupuestales).where(eq(partidasPresupuestales.id, id));
    if (result.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener partida presupuestal', detalles: err.message });
  }
});

// Crear una partida presupuestal
router.post('/', async (req, res) => {
  try {
    let { nombre, tipo, monto_aprobado, saldo, estado } = req.body;
    if (estado === undefined || estado === null || estado === "") estado = 1;
    if (saldo === undefined || saldo === null || saldo === "") saldo = monto_aprobado || 0;
    const result = await db.insert(partidasPresupuestales).values({ nombre, tipo, monto_aprobado, saldo, estado });
    const insertId = result.insertId || (result[0] && result[0].insertId);
    res.status(201).json({ id: insertId, nombre, tipo, monto_aprobado, saldo, estado });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear partida presupuestal', detalles: err.message });
  }
});

// Actualizar una partida presupuestal
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nombre, tipo, monto_aprobado, saldo, estado } = req.body;
    const result = await db.update(partidasPresupuestales)
      .set({ nombre, tipo, monto_aprobado, saldo, estado })
      .where(eq(partidasPresupuestales.id, id));
    if (result.affectedRows === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ message: 'Partida presupuestal actualizada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar partida presupuestal', detalles: err.message });
  }
});

// Eliminar una partida presupuestal
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await db.delete(partidasPresupuestales).where(eq(partidasPresupuestales.id, id));
    if (result.affectedRows === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ message: 'Partida presupuestal eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar partida presupuestal', detalles: err.message });
  }
});

export default router;
