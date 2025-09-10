// Obtener el siguiente consecutivo real para un prefijo
export async function getSiguienteNumeracion(req, res) {
  try {
    const { prefijo } = req.query;
    if (!prefijo) {
      return res.status(400).json({ error: 'Prefijo requerido' });
    }
    // Buscar el mayor número usado para ese prefijo
    // Se asume que el campo comprobantesContables.numero es tipo "PREFIJO-NUMERO"
    const resultados = await db
      .select({ numero: comprobantesContables.numero })
      .from(comprobantesContables)
      .where(comprobantesContables.numero.like(`${prefijo}-%`));
    let maxNum = 0;
    for (const r of resultados) {
      const partes = r.numero.split('-');
      const num = parseInt(partes[1], 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
    // Consultar el numeracion_actual del prefijo por si nunca se ha usado
    const prefijoDbArr = await db.select().from(require('./models/prefijos.js').prefijos).where(eq(require('./models/prefijos.js').prefijos.prefijo, prefijo));
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
    // Obtener fechas únicas de la tabla comprobantesContables (o movimientosContables si aplica)
    const fechas = await db
      .select({ fecha: comprobantesContables.fecha })
      .from(comprobantesContables)
      .groupBy(comprobantesContables.fecha)
      .orderBy(comprobantesContables.fecha);
    res.json(fechas.map(f => f.fecha));
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener fechas de movimientos', detalles: err.message });
  }
}
// Controlador para transacciones contables
// Gestiona las operaciones CRUD sobre las transacciones

import { db } from './db.ts';
import { comprobantesContables, movimientosContables, planCuentas, comprobanteDetalle, terceros, periodosContables } from '../shared/schema.ts';
import { eq, and, like } from 'drizzle-orm';

// Obtener todas las transacciones
export async function getTransacciones(req, res) {
  try {
  const { page = 1, pageSize = 20, fecha, descripcion, estado, periodo_id } = req.query;
    let whereClause = [];
    // Filter by fecha
    if (fecha) {
      whereClause.push(eq(comprobantesContables.fecha, fecha));
    }
    // Filter by descripcion
    if (descripcion) {
      whereClause.push(like(comprobantesContables.descripcion, `%${descripcion}%`));
    }
    // Filter by estado
    if (estado) {
      whereClause.push(eq(comprobantesContables.estado, estado));
    }
    // Filtrar por periodo_id directamente (UUID)
    if (periodo_id) {
      whereClause.push(eq(comprobantesContables.periodo_id, periodo_id));
    }
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const comprobantes = await db.select().from(comprobantesContables)
      .where(whereClause.length ? and(...whereClause) : undefined)
      .limit(parseInt(pageSize)).offset(offset);
    // Para cada comprobante, obtener sus movimientos relacionados
    const comprobantesConMovimientos = await Promise.all(comprobantes.map(async (comprobante) => {
      // Obtener movimientos y, si hay tercero_id, buscar la razón social
      const movimientos = await db.select().from(comprobanteDetalle)
        .where(eq(comprobanteDetalle.comprobante_id, comprobante.id));
      const movimientosConTercero = await Promise.all(movimientos.map(async mov => {
        let terceroRazonSocial = null;
        if (mov.tercero_id) {
          const tercero = await db.select().from(terceros).where(eq(terceros.id, mov.tercero_id));
          if (tercero && tercero[0]) {
            terceroRazonSocial = tercero[0].razonSocial || tercero[0].primerNombre + ' ' + (tercero[0].primerApellido || '');
          }
        }
        return {
          ...mov,
          valorDebito: mov.debito,
          valorCredito: mov.credito,
          terceroId: mov.tercero_id,
          terceroRazonSocial
        };
      }));
      return {
        id: comprobante.id,
        tipoTransaccion: comprobante.tipo,
        numeroComprobante: comprobante.numero,
        fecha: comprobante.fecha,
        estado: comprobante.estado,
        concepto: comprobante.descripcion,
        movimientos: movimientosConTercero
      };
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
    // Log para depuración: ver la estructura de las cuentas recibidas
    console.log('Cuentas recibidas en la transacción:', JSON.stringify(nuevaTransaccion.cuentas, null, 2));
    // Validar cuentas y montos
    if (!Array.isArray(nuevaTransaccion.cuentas) || nuevaTransaccion.cuentas.length === 0) {
      return res.status(400).json({ error: 'Debe incluir al menos una cuenta en la transacción.' });
    }
    let errorCuentas = [];
    let totalDebito = 0;
    let totalCredito = 0;
    for (const cuenta of nuevaTransaccion.cuentas) {
      console.log('Cuenta recibida para validación:', JSON.stringify(cuenta, null, 2));
      // Validar existencia de la cuenta en el plan de cuentas usando el id
      const cuentaDb = await db.select().from(planCuentas).where(eq(planCuentas.id, cuenta.cuenta_id));
      if (cuentaDb.length === 0) {
        errorCuentas.push(cuenta.cuenta_id);
      }
      if (typeof cuenta.debito !== 'number' || typeof cuenta.credito !== 'number' || cuenta.debito < 0 || cuenta.credito < 0) {
        errorCuentas.push(`Monto inválido en cuenta ${cuenta.cuenta_id}`);
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
    // Validación estricta de prefijo y numeración
    const prefijoSeleccionado = nuevaTransaccion.prefijo;
    const numeracion = Number(nuevaTransaccion.numeracion);
    const prefijoDbArr = await db.select().from(require('./models/prefijos.js').prefijos).where(eq(require('./models/prefijos.js').prefijos.prefijo, prefijoSeleccionado));
    if (!prefijoDbArr.length) {
      return res.status(400).json({ error: 'Prefijo no encontrado.' });
    }
    const prefijoDb = prefijoDbArr[0];
    if (numeracion !== prefijoDb.numeracion_actual) {
      return res.status(400).json({ error: `La numeración no es válida para este prefijo. El siguiente número disponible es ${prefijoDb.numeracion_actual}` });
    }
    // Buscar el periodo correspondiente a la fecha
    let periodoId = null;
    if (nuevaTransaccion.fecha) {
      const periodo = await db.select().from(periodosContables)
        .where(and(
          periodosContables.fechaInicio.lte(nuevaTransaccion.fecha),
          periodosContables.fechaCierre.gte(nuevaTransaccion.fecha),
          periodosContables.estado_periodo.eq('abierto')
        ));
      if (periodo && periodo[0]) {
        periodoId = periodo[0].id;
      } else {
        return res.status(400).json({ error: 'No existe un periodo contable abierto para la fecha seleccionada.' });
      }
    }
    // Crear comprobante contable con periodo_id
    const comprobante = {
      numero: nuevaTransaccion.documento, // número del comprobante
      tipo: nuevaTransaccion.tipo, // tipo de comprobante
      fecha: nuevaTransaccion.fecha,
      periodo_id: periodoId,
      descripcion: nuevaTransaccion.descripcion,
      estado: nuevaTransaccion.estado || 'borrador', // por defecto 'borrador'
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
    // Actualizar numeracion_actual del prefijo usado
    await db.update(require('./models/prefijos.js').prefijos)
      .set({ numeracion_actual: prefijoDb.numeracion_actual + 1 })
      .where(eq(require('./models/prefijos.js').prefijos.id, prefijoDb.id));
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

