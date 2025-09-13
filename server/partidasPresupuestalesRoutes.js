import express from 'express';
import * as db from './db.js';
const router = express.Router();

// Obtener todas las partidas presupuestales
router.get('/', async (req, res) => {
  try {
    const partidas = await db.partidas_presupuestales.findMany();
    res.json(partidas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener partidas presupuestales' });
  }
});

// Obtener una partida presupuestal por ID
router.get('/:id', async (req, res) => {
  try {
    const partida = await db.partidas_presupuestales.findFirst({
      where: { id: Number(req.params.id) }
    });
    if (!partida) return res.status(404).json({ error: 'No encontrada' });
    res.json(partida);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la partida' });
  }
});

// Crear una nueva partida presupuestal
router.post('/', async (req, res) => {
  try {
    const { nombre, tipo, monto_aprobado, saldo, estado } = req.body;
    const nueva = await db.partidas_presupuestales.create({
      data: { nombre, tipo, monto_aprobado, saldo, estado }
    });
    res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear partida' });
  }
});

// Actualizar una partida presupuestal
router.put('/:id', async (req, res) => {
  try {
    const { nombre, tipo, monto_aprobado, saldo, estado } = req.body;
    const actualizada = await db.partidas_presupuestales.update({
      where: { id: Number(req.params.id) },
      data: { nombre, tipo, monto_aprobado, saldo, estado }
    });
    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar partida' });
  }
});

// Eliminar una partida presupuestal
router.delete('/:id', async (req, res) => {
  try {
    await db.partidas_presupuestales.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar partida' });
  }
});

export default router;
