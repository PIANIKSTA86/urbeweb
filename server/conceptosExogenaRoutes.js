import express from 'express';
import * as db from './db.js';
const router = express.Router();

// Obtener todos los conceptos exógena
router.get('/', async (req, res) => {
  try {
    const conceptos = await db.conceptos_exogena.findMany();
    res.json(conceptos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener conceptos exógena' });
  }
});

// Obtener un concepto exógena por ID
router.get('/:id', async (req, res) => {
  try {
    const concepto = await db.conceptos_exogena.findFirst({
      where: { id: Number(req.params.id) }
    });
    if (!concepto) return res.status(404).json({ error: 'No encontrado' });
    res.json(concepto);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el concepto' });
  }
});

// Crear un nuevo concepto exógena
router.post('/', async (req, res) => {
  try {
    const { codigo, descripcion, formato, tipo, estado } = req.body;
    const nuevo = await db.conceptos_exogena.create({
      data: { codigo, descripcion, formato, tipo, estado }
    });
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear concepto' });
  }
});

// Actualizar un concepto exógena
router.put('/:id', async (req, res) => {
  try {
    const { codigo, descripcion, formato, tipo, estado } = req.body;
    const actualizado = await db.conceptos_exogena.update({
      where: { id: Number(req.params.id) },
      data: { codigo, descripcion, formato, tipo, estado }
    });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar concepto' });
  }
});

// Eliminar un concepto exógena
router.delete('/:id', async (req, res) => {
  try {
    await db.conceptos_exogena.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar concepto' });
  }
});

export default router;
