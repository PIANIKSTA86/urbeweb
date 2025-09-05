import express from 'express';
import { prefijos } from './models/prefijos.js';
import { eq } from 'drizzle-orm';
import { db } from './db.js';

const router = express.Router();

// Obtener todos los prefijos
router.get('/prefijos', async (req, res) => {
  try {
  const result = await db.select().from(prefijos);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener prefijos' });
  }
});

// Crear prefijo
router.post('/prefijos', async (req, res) => {
  try {
    const { tipo_transaccion_id, prefijo, numeracion_actual, descripcion } = req.body;
    const [inserted] = await db.insert(prefijos).values({ tipo_transaccion_id, prefijo, numeracion_actual, descripcion });
    res.json(inserted);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear prefijo' });
  }
});

// Actualizar prefijo
router.put('/prefijos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo_transaccion_id, prefijo, numeracion_actual, descripcion } = req.body;
    console.log('PUT /prefijos/:id', { id, tipo_transaccion_id, prefijo, numeracion_actual, descripcion });
    try {
      await db.update(prefijos).set({
        tipo_transaccion_id,
        prefijo,
        numeracion_actual,
        descripcion: descripcion === undefined ? null : descripcion
      }).where(eq(prefijos.id, Number(id)));
      res.json({ success: true });
    } catch (err) {
      console.error('Error al actualizar prefijo:', err);
      res.status(500).json({ error: 'Error al actualizar prefijo', details: err?.message });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar prefijo' });
  }
});

// Eliminar prefijo
router.delete('/prefijos/:id', async (req, res) => {
  try {
    const { id } = req.params;
  await db.delete(prefijos).where(prefijos.id.eq(Number(id)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar prefijo' });
  }
});

export default router;
