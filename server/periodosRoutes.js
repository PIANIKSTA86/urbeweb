import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { periodosContables, movimientosContables, facturas } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';
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
    const { nombre, ano, mes, fecha_inicio, fecha_cierre, estado } = req.body;
    const id = uuidv4();
    const [inserted] = await db.insert(periodosContables).values({
      id,
      nombre,
      ano,
      mes,
      fechaInicio: fecha_inicio,
      fechaCierre: fecha_cierre,
      estado,
      fechaCreacion: new Date()
    });
    res.json(inserted);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear periodo', detalles: err.message || err.toString() });
  }
});

// Actualizar periodo
router.put('/periodos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let estado_periodo = req.body.estado_periodo || req.body.estado;
    if (!estado_periodo) {
      return res.status(400).json({ error: 'Falta el campo estado_periodo o estado en el body.' });
    }
    if (!['abierto', 'cerrado', 'bloqueado'].includes(estado_periodo)) {
      return res.status(400).json({ error: 'Valor de estado_periodo inválido.' });
    }
    // Lógica equivalente a la sentencia SQL proporcionada
    const periodo = await db.select().from(periodosContables).where(eq(periodosContables.id, id));
    if (!periodo || periodo.length === 0) {
      return res.status(404).json({ error: 'Periodo no encontrado.' });
    }
    let updateData = {
      estado_periodo,
      updated_at: new Date()
    };
    if (estado_periodo === 'cerrado') {
      updateData.fecha_cierre = new Date();
    } else {
      // Si no se cierra, se mantiene la fecha_cierre actual
      updateData.fecha_cierre = periodo[0].fecha_cierre;
    }
    await db.update(periodosContables).set(updateData).where(eq(periodosContables.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar periodo', detalles: err.message || err.toString() });
  }
});

// Eliminar periodo
router.delete('/periodos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Verificar movimientos asociados
    const movimientos = await db.select().from(movimientosContables).where(eq(movimientosContables.periodo_id, id));
    if (movimientos.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar el periodo: existen movimientos asociados.' });
    }
    // Verificar facturas asociadas
    const facturasList = await db.select().from(facturas).where(eq(facturas.periodoId, id));
    if (facturasList.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar el periodo: existen facturas asociadas.' });
    }
    // Eliminar periodo si no hay dependencias
    await db.delete(periodosContables).where(eq(periodosContables.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar periodo:', err);
    res.status(500).json({ error: 'Error al eliminar periodo', detalles: err.message || err.toString() });
  }
});

export default router;
