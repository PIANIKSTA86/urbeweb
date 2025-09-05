import express from 'express';
import { tiposTransaccion } from './models/tiposTransaccion.js';
import { db } from './db.js';

const router = express.Router();

// Obtener todos los tipos de transacción
router.get('/tipos-transaccion', async (req, res) => {
  try {
    const result = await db.select().from(tiposTransaccion);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tipos de transacción' });
  }
});

// Crear tipo de transacción
router.post('/tipos-transaccion', async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const [inserted] = await db.insert(tiposTransaccion).values({ nombre, descripcion });
    res.json(inserted);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear tipo de transacción' });
  }
});

// Actualizar tipo de transacción
router.put('/tipos-transaccion/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    await db.update(tiposTransaccion).set({ nombre, descripcion }).where(tiposTransaccion.id.eq(Number(id)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar tipo de transacción' });
  }
});

// Eliminar tipo de transacción
router.delete('/tipos-transaccion/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(tiposTransaccion).where(tiposTransaccion.id.eq(Number(id)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar tipo de transacción' });
  }
});

export default router;
