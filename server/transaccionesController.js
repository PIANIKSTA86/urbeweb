import { prefijos } from './models/prefijos.js';
import { like } from 'drizzle-orm';
// Obtener el siguiente consecutivo real para un prefijo
export async function getSiguienteNumeracion(req, res) {
  try {
    const { prefijo } = req.query;
    if (!prefijo) {
      return res.status(400).json({ error: 'Prefijo requerido' });
    }
    // Buscar el mayor número usado para ese prefijo
    // Se asume que el campo movimientosContables.numero es tipo "PREFIJO-NUMERO"
    const resultados = await db
      .select({ numero: movimientosContables.numero })
      .from(movimientosContables)
      .where(like(movimientosContables.numero, `${prefijo}-%`));
    let maxNum = 0;
    for (const r of resultados) {
      const partes = r.numero.split('-');
      const num = parseInt(partes[1], 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
    // Consultar el numeracion_actual del prefijo por si nunca se ha usado
  const prefijoDbArr = await db.select().from(prefijos).where(eq(prefijos.prefijo, prefijo));
    let sugerido = 1;
    if (prefijoDbArr.length) {
      sugerido = Math.max(maxNum + 1, prefijoDbArr[0].numeracion_actual);
    } else {
      sugerido = maxNum + 1;
    }
    res.json({ siguiente: sugerido });
  } catch (err) {
    res.status(500).json({ error: 'Error al calcular siguiente numeración', detalles: err.message });
  }
}
// Endpoint para obtener fechas únicas de movimientos contables
export async function getFechasMovimientos(req, res) {
  try {
    // Obtener fechas únicas de la tabla movimientosContables
    const fechas = await db
      .select({ fecha: movimientosContables.fecha })
      .from(movimientosContables)
      .groupBy(movimientosContables.fecha)
      .orderBy(movimientosContables.fecha);
    res.json(fechas.map(f => f.fecha));
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener fechas de movimientos', detalles: err.message });
  }
}
// Controlador para transacciones contables
// Gestiona las operaciones CRUD sobre las transacciones

import { db } from './db.ts';
import { movimientosContables, movimientoDetalle, planCuentas, terceros, periodosContables } from '../shared/schema.ts';
import { eq, and, lte, gte } from 'drizzle-orm';

// Obtener todas las transacciones
export async function getTransacciones(req, res) {
  try {
    const { page = 1, pageSize = 20, fecha, descripcion, estado, periodo_id, tipoDocumento } = req.query;
    let whereClause = [];
    // Filter by fecha
    if (fecha) {
      whereClause.push(eq(movimientosContables.fecha, fecha));
    }
    // Filter by descripcion
    if (descripcion) {
      whereClause.push(like(movimientosContables.descripcion, `%${descripcion}%`));
    }
    // Filter by estado
    if (estado) {
      whereClause.push(eq(movimientosContables.estado, estado));
    }
    // Filtrar por periodo_id directamente (UUID)
    if (periodo_id) {
      whereClause.push(eq(movimientosContables.periodo_id, periodo_id));
    }
    // Filtro por tipo de documento (campo 'tipo')
    if (tipoDocumento) {
      whereClause.push(eq(movimientosContables.tipo, tipoDocumento));
    }
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const movimientos = await db.select().from(movimientosContables)
      .where(whereClause.length ? and(...whereClause) : undefined)
      .limit(parseInt(pageSize)).offset(offset);
    // Para cada movimiento, obtener sus detalles relacionados
    const movimientosConDetalles = await Promise.all(movimientos.map(async (movimiento) => {
      const detalles = await db.select().from(movimientoDetalle)
        .where(eq(movimientoDetalle.movimiento_id, movimiento.id));
      const detallesConTercero = await Promise.all(detalles.map(async det => {
        let terceroRazonSocial = null;
        if (det.tercero_id) {
          const tercero = await db.select().from(terceros).where(eq(terceros.id, det.tercero_id));
          if (tercero && tercero[0]) {
            terceroRazonSocial = tercero[0].razonSocial || tercero[0].primerNombre + ' ' + (tercero[0].primerApellido || '');
          }
        }
        return {
          ...det,
          valorDebito: det.debito,
          valorCredito: det.credito,
          terceroId: det.tercero_id,
          terceroRazonSocial
        };
      }));
      return {
        id: movimiento.id,
        tipoTransaccion: movimiento.tipo,
        numeroComprobante: movimiento.numero,
        fecha: movimiento.fecha,
        estado: movimiento.estado,
        concepto: movimiento.descripcion,
        detalles: detallesConTercero
      };
    }));
    // Obtener el total de movimientos según filtros
    const totalMovimientos = await db.select().from(movimientosContables)
      .where(whereClause.length ? and(...whereClause) : undefined);
    const total = totalMovimientos.length;
    res.json({ data: movimientosConDetalles, total });
  } catch (err) {
    console.error('Error al obtener transacciones:', err);
    res.status(500).json({ error: 'Error interno al obtener transacciones', detalles: err.message });
  }
}

// Crear una nueva transacción  createTransaccion eliminado


export async function updateTransaccion(req, res) {
  try {
    const id = req.params.id;
    const updateData = req.body;
    // Si se actualiza la fecha, buscar el periodo correspondiente
    let periodoId = null;
    if (updateData.fecha) {
      const periodo = await db.select().from(periodosContables)
        .where(and(
          periodosContables.fechaInicio.lte(updateData.fecha),
          periodosContables.fechaCierre.gte(updateData.fecha),
          periodosContables.estado_periodo.eq('abierto')
        ));
      if (periodo && periodo[0]) {
        periodoId = periodo[0].id;
        updateData.periodo_id = periodoId;
      } else {
        return res.status(400).json({ error: 'No existe un periodo contable abierto para la fecha seleccionada.' });
      }
    }
    const result = await db.update(movimientosContables)
      .set(updateData)
      .where(eq(movimientosContables.id, id));
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    // Opcional: actualizar movimientos contables relacionados si se envían en el body
    if (updateData.cuentas && Array.isArray(updateData.cuentas)) {
      // Eliminar detalles anteriores
      await db.delete(movimientoDetalle).where(eq(movimientoDetalle.movimiento_id, id));
      // Insertar nuevos detalles
      for (const cuenta of updateData.cuentas) {
        await db.insert(movimientoDetalle).values({
          movimiento_id: id,
          cuenta_id: cuenta.cuenta_id,
          tercero_id: cuenta.tercero_id || null,
          descripcion: cuenta.descripcion || updateData.descripcion,
          debito: cuenta.debito,
          credito: cuenta.credito,
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
    // Eliminar detalles relacionados primero
    await db.delete(movimientoDetalle).where(eq(movimientoDetalle.movimiento_id, id));
    // Eliminar el movimiento principal
    const result = await db.delete(movimientosContables)
      .where(eq(movimientosContables.id, id));
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error al eliminar transacción:', err);
    res.status(500).json({ error: 'Error interno al eliminar la transacción', detalles: err.message });
  }
}

