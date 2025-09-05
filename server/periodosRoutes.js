import express from 'express';
import { periodosContables } from './models/periodos.js';
import { db } from './db.js';

const router = express.Router();

// Obtener todos los periodos
router.get('/periodos', async (req, res) => {
  try {
    const result = await db.select().from(periodosContables);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener periodos' });
  }
});

// Crear periodo
router.post('/periodos', async (req, res) => {
  try {
  const { nombre, ano, mes, fecha_inicio, fecha_fin, estado_periodo, usuario_creacion_id } = req.body;
  const [inserted] = await db.insert(periodosContables).values({ nombre, ano, mes, fecha_inicio, fecha_fin, estado_periodo, usuario_creacion_id });
    res.json(inserted);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear periodo' });
  }
});

// Actualizar periodo
router.put('/periodos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, ano, mes, fecha_inicio, fecha_fin, estado_periodo } = req.body;
    await db.update(periodosContables).set({ nombre, ano, mes, fecha_inicio, fecha_fin, estado_periodo }).where(periodosContables.id.eq(Number(id)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar periodo' });
  }
});

// Eliminar periodo
router.delete('/periodos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(periodosContables).where(periodosContables.id.eq(Number(id)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar periodo' });
  }
});

export default router;
