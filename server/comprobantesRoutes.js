import express from 'express';
import { tiposComprobantes } from './models/comprobantes.js';
import { db } from './db.js';

const router = express.Router();

// Obtener todos los tipos de comprobantes
router.get('/comprobantes', async (req, res) => {
  try {
    const result = await db.select().from(tiposComprobantes);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tipos de comprobantes' });
  }
});

// Crear tipo de comprobante
router.post('/comprobantes', async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const [inserted] = await db.insert(tiposComprobantes).values({ nombre, descripcion });
    res.json(inserted);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear tipo de comprobante' });
  }
});

// Actualizar tipo de comprobante
router.put('/comprobantes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    await db.update(tiposComprobantes).set({ nombre, descripcion }).where(tiposComprobantes.id.eq(Number(id)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar tipo de comprobante' });
  }
});

// Eliminar tipo de comprobante
router.delete('/comprobantes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(tiposComprobantes).where(tiposComprobantes.id.eq(Number(id)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar tipo de comprobante' });
  }
});

export default router;
