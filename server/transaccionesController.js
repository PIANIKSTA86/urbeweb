// Controlador para transacciones contables
// Gestiona las operaciones CRUD sobre las transacciones

import { db } from './db.ts';
import { comprobantesContables, movimientosContables } from '../shared/schema.ts';
import { eq, and, like } from 'drizzle-orm';

// Obtener todas las transacciones
export async function getTransacciones(req, res) {
  try {
    const { page = 1, pageSize = 20, fecha, descripcion, estado } = req.query;
    let whereClause = [];
    // Filter by fecha
    if (fecha) {
      whereClause.push(eq(comprobantesContables.fecha, fecha));
    }
    // Filter by descripcion
    if (descripcion) {
      whereClause.push(like(comprobantesContables.concepto, `%${descripcion}%`));
    }
    // Filter by estado
    if (estado) {
      whereClause.push(eq(comprobantesContables.estado, estado));
    }
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const comprobantes = await db.select().from(comprobantesContables)
      .where(whereClause.length ? and(...whereClause) : undefined)
      .limit(parseInt(pageSize)).offset(offset);
    // Para cada comprobante, obtener sus movimientos relacionados
    const comprobantesConMovimientos = await Promise.all(comprobantes.map(async (comprobante) => {
      const movimientos = await db.select().from(movimientosContables)
        .where(eq(movimientosContables.comprobanteId, comprobante.id));
      return { ...comprobante, movimientos };
    }));
    // Obtener el total de comprobantes según filtros
    const totalComprobantes = await db.select().from(comprobantesContables)
      .where(whereClause.length ? and(...whereClause) : undefined);
    const total = totalComprobantes.length;
    res.json({ data: comprobantesConMovimientos, total });
  } catch (err) {
    console.error('Error al obtener transacciones:', err);
    res.status(500).json({ error: 'Error interno al obtener transacciones', detalles: err.message });
  }
}

// Crear una nueva transacción
export async function createTransaccion(req, res) {
  try {
    const nuevaTransaccion = req.body;
    // Validar cuentas y montos
    if (!Array.isArray(nuevaTransaccion.cuentas) || nuevaTransaccion.cuentas.length === 0) {
      return res.status(400).json({ error: 'Debe incluir al menos una cuenta en la transacción.' });
    }
    let errorCuentas = [];
    let totalDebito = 0;
    let totalCredito = 0;
    for (const cuenta of nuevaTransaccion.cuentas) {
      // Validar existencia de la cuenta en el plan de cuentas
      const cuentaDb = await db.select().from(planCuentas).where(eq(planCuentas.codigo, cuenta.codigo));
      if (cuentaDb.length === 0) {
        errorCuentas.push(cuenta.codigo);
      }
      if (typeof cuenta.debito !== 'number' || typeof cuenta.credito !== 'number' || cuenta.debito < 0 || cuenta.credito < 0) {
        errorCuentas.push(`Monto inválido en cuenta ${cuenta.codigo}`);
      }
      totalDebito += cuenta.debito;
      totalCredito += cuenta.credito;
    }
    if (errorCuentas.length > 0) {
      return res.status(400).json({ error: 'Cuentas inválidas o no existen en el PUC', detalles: errorCuentas });
    }
    if (totalDebito !== totalCredito) {
      return res.status(400).json({ error: 'La suma de débitos y créditos debe ser igual.' });
    }
    // Crear comprobante contable
    // Crear comprobante contable con los campos correctos
    const comprobante = {
      numero: nuevaTransaccion.documento, // número del comprobante
      tipo: nuevaTransaccion.tipo, // tipo de comprobante
      fecha: nuevaTransaccion.fecha,
      descripcion: nuevaTransaccion.descripcion,
      estado: 'registrado',
      usuario_id: nuevaTransaccion.usuario_id, // id del usuario que crea
    };
    // Insertar comprobante y obtener el id generado
    const [insertedComprobante] = await db.insert(comprobantesContables).values(comprobante);
    // Crear movimientos contables con los campos correctos
    for (const cuenta of nuevaTransaccion.cuentas) {
      await db.insert(movimientosContables).values({
        comprobante_id: insertedComprobante.id,
        cuenta_id: cuenta.cuenta_id,
        tercero_id: cuenta.tercero_id || null,
        descripcion: cuenta.descripcion || nuevaTransaccion.descripcion,
        debito: cuenta.debito,
        credito: cuenta.credito,
      });
    }
    res.status(201).json({ comprobante: insertedComprobante });
  } catch (err) {
    console.error('Error al crear transacción:', err);
    res.status(500).json({ error: 'Error interno al crear la transacción', detalles: err.message });
  }
}

export async function updateTransaccion(req, res) {
  try {
    const id = req.params.id;
    const updateData = req.body;
    const result = await db.update(comprobantesContables)
      .set(updateData)
      .where(eq(comprobantesContables.id, id));
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    // Opcional: actualizar movimientos contables relacionados si se envían en el body
    if (updateData.cuentas && Array.isArray(updateData.cuentas)) {
      // Eliminar movimientos anteriores
      await db.delete(movimientosContables).where(eq(movimientosContables.comprobanteId, id));
      // Insertar nuevos movimientos
      for (const cuenta of updateData.cuentas) {
        await db.insert(movimientosContables).values({
          comprobanteId: id,
          cuentaId: cuenta.cuentaId,
          terceroId: updateData.terceroId,
          descripcion: updateData.descripcion,
          valorDebito: cuenta.debito,
          valorCredito: cuenta.credito,
        });
      }
    }
    res.json({ message: 'Transacción actualizada', id });
  } catch (err) {
    console.error('Error al actualizar transacción:', err);
    res.status(500).json({ error: 'Error interno al actualizar la transacción', detalles: err.message });
  }
}

export async function deleteTransaccion(req, res) {
  try {
    const id = req.params.id;
    // Eliminar movimientos relacionados primero
    await db.delete(movimientosContables).where(eq(movimientosContables.comprobanteId, id));
    // Eliminar el comprobante
    const result = await db.delete(comprobantesContables)
      .where(eq(comprobantesContables.id, id));
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error al eliminar transacción:', err);
    res.status(500).json({ error: 'Error interno al eliminar la transacción', detalles: err.message });
  }
}

