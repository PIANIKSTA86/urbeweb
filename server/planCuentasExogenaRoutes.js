import express from 'express';
import * as db from './db.js';
const router = express.Router();

// Obtener todas las asociaciones cuenta-exógena
router.get('/', async (req, res) => {
  try {
    const asociaciones = await db.plan_cuentas_exogena.findMany();
    res.json(asociaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener asociaciones' });
  }
});

// Obtener una asociación por ID
router.get('/:id', async (req, res) => {
  try {
    const asociacion = await db.plan_cuentas_exogena.findFirst({
      where: { id: Number(req.params.id) }
    });
    if (!asociacion) return res.status(404).json({ error: 'No encontrada' });
    res.json(asociacion);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la asociación' });
  }
});

// Crear una nueva asociación cuenta-exógena
router.post('/', async (req, res) => {
  try {
    const { cuenta_id, exogena_id, formato, observaciones } = req.body;
    const nueva = await db.plan_cuentas_exogena.create({
      data: { cuenta_id, exogena_id, formato, observaciones }
    });
    res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear asociación' });
  }
});

// Actualizar una asociación cuenta-exógena
router.put('/:id', async (req, res) => {
  try {
    const { cuenta_id, exogena_id, formato, observaciones } = req.body;
    const actualizada = await db.plan_cuentas_exogena.update({
      where: { id: Number(req.params.id) },
      data: { cuenta_id, exogena_id, formato, observaciones }
    });
    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar asociación' });
  }
});

// Eliminar una asociación cuenta-exógena
router.delete('/:id', async (req, res) => {
  try {
    await db.plan_cuentas_exogena.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar asociación' });
  }
});

export default router;
