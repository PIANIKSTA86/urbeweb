// Controlador de reportes contables
// Genera reportes como balance de prueba, por cuenta y por tercero

import { db } from './db.js';
import { planCuentas, movimientosContables, movimientoDetalle } from '../shared/schema.js';
// import transacciones from './models/transacciones.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// Balance de prueba: muestra saldos por cuenta
export async function getBalancePrueba(req, res) {
  console.log('== Balance de Prueba: INICIO ==');
  console.log('Query params:', req.query);
  // Filtros avanzados: tercero, cuenta, rango de fechas
  const terceroId = req.query.terceroId ? parseInt(req.query.terceroId) : null;
  const cuentaCodigo = req.query.cuentaCodigo || null;
  const nivelFiltro = req.query.nivel ? parseInt(req.query.nivel) : null;
  let desde = req.query.desde ? new Date(req.query.desde) : null;
  let hasta = req.query.hasta ? new Date(req.query.hasta) : null;
  // Forzar siempre el rango si no está definido
  if (!desde) desde = new Date('1900-01-01');
  if (!hasta) hasta = new Date('2100-12-31');
  // Si la fecha viene sin hora, asegurar que el rango incluya todo el día en zona local
  if (desde && req.query.desde && req.query.desde.length === 10) {
    // YYYY-MM-DD
    desde.setHours(0, 0, 0, 0);
  }
  if (hasta && req.query.hasta && req.query.hasta.length === 10) {
    // YYYY-MM-DD
    hasta.setHours(23, 59, 59, 999);
  }
  console.log('Filtro de fechas:', {
    desde: desde ? desde.toISOString() : null,
    hasta: hasta ? hasta.toISOString() : null
  });
  // Interpreta año y periodo contable si se envían
  if (req.query.anio) {
    const anio = parseInt(req.query.anio);
    desde = new Date(`${anio}-01-01T00:00:00`);
    hasta = new Date(`${anio}-12-31T23:59:59`);
  }
  if (req.query.periodoContable) {
    // Si es UUID, buscar en la tabla periodos_contables
    const periodoId = req.query.periodoContable;
    if (/^[0-9a-fA-F-]{36}$/.test(periodoId)) {
      // Es un UUID
      try {
        const periodosContables = (await import('../shared/schema.js')).periodosContables;
        const periodo = await db.select().from(periodosContables).where(periodosContables.id.eq(periodoId)).limit(1);
        if (periodo && periodo.length > 0) {
          desde = new Date(periodo[0].fecha_inicio);
          hasta = new Date(periodo[0].fecha_fin);
        } else {
          console.warn('No se encontró el periodo contable con id', periodoId);
        }
      } catch (err) {
        console.error('Error consultando periodo contable:', err);
      }
    } else {
      // Si no es UUID, asumir formato "YYYY-MM"
      const [anio, mes] = periodoId.split("-");
      if (anio && mes) {
        desde = new Date(`${anio}-${mes}-01T00:00:00`);
        const lastDay = new Date(desde.getFullYear(), desde.getMonth() + 1, 0).getDate();
        hasta = new Date(`${anio}-${mes}-${lastDay}T23:59:59`);
      }
    }
  }
  const saldos = {};
  // Usar la base de datos real de movimientos contables
  // Si no hay filtro de fechas, pero hay año, usar el año
  // (ya calculado arriba)
  db.select().from(planCuentas).then(async cuentas => {
    console.log('Cuentas PUC obtenidas:', cuentas.length);
    // Crear mapa de id a código de cuenta
    const idToCodigo = {};
    cuentas.forEach(cuenta => {
      idToCodigo[cuenta.id] = cuenta.codigo;
    });
    // Si se filtra por cuentaCodigo, obtener todas las descendientes recursivamente
    let codigosPermitidos = null;
    if (cuentaCodigo) {
      codigosPermitidos = new Set();
      function agregarDescendientes(cod) {
        codigosPermitidos.add(cod);
        cuentas.filter(c => c.padre_codigo === cod).forEach(hija => agregarDescendientes(hija.codigo));
      }
      agregarDescendientes(cuentaCodigo);
    }
    cuentas.forEach(cuenta => {
      if (codigosPermitidos && !codigosPermitidos.has(cuenta.codigo)) return;
      if (nivelFiltro && cuenta.nivel > nivelFiltro) return;
      saldos[cuenta.codigo] = {
        nombre: cuenta.nombre,
        tipo: cuenta.tipo,
        nivel: cuenta.nivel,
        padre_codigo: cuenta.padre_codigo,
        saldoAnterior: 0,
        movDebito: 0,
        movCredito: 0,
        saldoDebito: 0,
        saldoCredito: 0
      };
    });

  // Obtener movimientos contables reales
    const movimientos = await db.select().from(movimientosContables);
    const detalles = await db.select().from(movimientoDetalle);
    console.log('Movimientos contables:', movimientos.length);
    console.log('Detalles de movimientos:', detalles.length);

    // Agrupar detalles por transacción
    const detallesPorTransaccion = {};
    detalles.forEach(det => {
      if (!detallesPorTransaccion[det.movimiento_id]) detallesPorTransaccion[det.movimiento_id] = [];
      detallesPorTransaccion[det.movimiento_id].push(det);
    });

    let movimientosPrevios = 0;
    movimientos.forEach(tx => {
      if (terceroId && tx.tercero_id !== terceroId) return;
      // Normalizar fechas a YYYY-MM-DD para comparar solo la fecha
      // Forzar a YYYY-MM-DD ambos lados
      const fechaTxStr = (tx.fecha instanceof Date)
        ? tx.fecha.toISOString().slice(0, 10)
        : String(tx.fecha).split('T')[0].split(' ')[0];
      const desdeStr = desde.toISOString().slice(0, 10);
      const cuentasTx = detallesPorTransaccion[tx.id] || [];
      cuentasTx.forEach(c => {
        if (saldos[c.codigo]) {
          if (desdeStr && fechaTxStr < desdeStr) {
            saldos[c.codigo].saldoAnterior += c.debito - c.credito;
            movimientosPrevios++;
          }
        }
      });
    });
    console.log('Movimientos previos al periodo:', movimientosPrevios);

    let movimientosPeriodo = 0;
    movimientos.forEach(tx => {
      if (terceroId && tx.tercero_id !== terceroId) return;
      // Normalizar fechas a YYYY-MM-DD para comparar solo la fecha
      const fechaTxStr = (tx.fecha instanceof Date)
        ? tx.fecha.toISOString().slice(0, 10)
        : String(tx.fecha).split('T')[0].split(' ')[0];
      const desdeStr = desde.toISOString().slice(0, 10);
      const hastaStr = hasta.toISOString().slice(0, 10);
      // Log de depuración para cada transacción filtrada por fecha
      if (movimientosPeriodo < 10) {
        console.log('[DEBUG] tx:', JSON.stringify({
          id: tx.id,
          fecha: tx.fecha,
          fechaTxStr,
          detalles: (detallesPorTransaccion[tx.id]||[]).length
        }, null, 2));
      }
      // Usar >= desde y <= hasta para incluir todo el rango
      if (desdeStr && fechaTxStr < desdeStr) return;
      if (hastaStr && fechaTxStr > hastaStr) return;
      const cuentasTx = detallesPorTransaccion[tx.id] || [];
      let detallesSumados = 0;
      cuentasTx.forEach(c => {
        // Usar el campo correcto del detalle: cuenta_id
        const codigoCuenta = idToCodigo[c.cuenta_id];
        // Log si debito o credito es nulo, vacío o NaN
        if (
          c.debito == null || c.credito == null ||
          c.debito === '' || c.credito === '' ||
          isNaN(Number(c.debito)) || isNaN(Number(c.credito))
        ) {
          console.warn('[WARN] Detalle con valor no numérico:', {
            movimiento_id: c.movimiento_id,
            cuenta_id: c.cuenta_id,
            debito: c.debito,
            credito: c.credito
          });
        }
        if (codigoCuenta && saldos[codigoCuenta]) {
          saldos[codigoCuenta].movDebito += Number(c.debito) || 0;
          saldos[codigoCuenta].movCredito += Number(c.credito) || 0;
          movimientosPeriodo++;
          detallesSumados++;
        }
      });
      if (movimientosPeriodo < 10) {
        console.log('[DEBUG] detalles sumados para tx.id', tx.id, ':', detallesSumados);
      }
    });
    console.log('Movimientos en el periodo:', movimientosPeriodo);

    Object.keys(saldos).forEach(codigo => {
      const s = saldos[codigo];
      const saldoFinal = s.saldoAnterior + s.movDebito - s.movCredito;
      s.saldoDebito = saldoFinal > 0 ? saldoFinal : 0;
      s.saldoCredito = saldoFinal < 0 ? Math.abs(saldoFinal) : 0;
    });
    console.log('Saldos calculados:', Object.keys(saldos).length);

  console.log('== Balance de Prueba: FIN ==');
  if (req.query.export === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Balance de Prueba');
      sheet.addRow(['Código', 'Nombre', 'Saldo anterior', 'Mov. Débito', 'Mov. Crédito', 'Saldo Débito', 'Saldo Crédito']);
      Object.entries(saldos).forEach(([codigo, data]) => {
        sheet.addRow([
          codigo,
          data.nombre,
          data.saldoAnterior,
          data.movDebito,
          data.movCredito,
          data.saldoDebito,
          data.saldoCredito
        ]);
      });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=balance_prueba.xlsx');
      workbook.xlsx.write(res).then(() => res.end());
      return;
    }
    if (req.query.export === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=balance_prueba.pdf');
      doc.pipe(res);
      doc.fontSize(16).text('Balance de Prueba', { align: 'center' });
      doc.moveDown();
      Object.entries(saldos).forEach(([codigo, data]) => {
        doc.fontSize(12).text(`Código: ${codigo} | Nombre: ${data.nombre} | Saldo anterior: ${data.saldoAnterior} | Mov. Débito: ${data.movDebito} | Mov. Crédito: ${data.movCredito} | Saldo Débito: ${data.saldoDebito} | Saldo Crédito: ${data.saldoCredito}`);
      });
      doc.end();
      return;
    }
    res.json(saldos);
  });
}

// Balance general: clasifica activos, pasivos y patrimonio
export function getBalanceGeneral(req, res) {
  db.select().from(planCuentas).then(cuentas => {
    const saldos = {};
    cuentas.forEach(cuenta => {
      saldos[cuenta.codigo] = {
        nombre: cuenta.nombre,
        tipo: cuenta.tipo,
        debito: 0,
        credito: 0,
        saldo: 0
      };
    });
    transacciones.forEach(tx => {
      tx.cuentas.forEach(c => {
        if (saldos[c.codigo]) {
          saldos[c.codigo].debito += c.debito;
          saldos[c.codigo].credito += c.credito;
        }
      });
    });
    Object.keys(saldos).forEach(codigo => {
      saldos[codigo].saldo = saldos[codigo].debito - saldos[codigo].credito;
    });
    // Agrupar por tipo
    const resumen = { activo: 0, pasivo: 0, patrimonio: 0 };
    Object.values(saldos).forEach(c => {
      if (resumen[c.tipo] !== undefined) {
        resumen[c.tipo] += c.saldo;
      }
    });
    res.json({ resumen, detalle: saldos });
  });
}

// Estado de resultados: ingresos, gastos y utilidad
export function getEstadoResultados(req, res) {
  // Asume que las cuentas de ingresos y gastos están clasificadas en el PUC
  db.select().from(planCuentas).then(cuentas => {
    const resultado = { ingresos: 0, gastos: 0, utilidad: 0 };
    cuentas.forEach(cuenta => {
      let saldo = 0;
      transacciones.forEach(tx => {
        tx.cuentas.forEach(c => {
          if (c.codigo === cuenta.codigo) {
            saldo += c.debito - c.credito;
          }
        });
      });
      if (cuenta.tipo === 'ingreso') resultado.ingresos += saldo;
      if (cuenta.tipo === 'gasto') resultado.gastos += saldo;
    });
    resultado.utilidad = resultado.ingresos - resultado.gastos;
    res.json(resultado);
  });
}

// Libro diario: lista de transacciones por fecha
export function getLibroDiario(req, res) {
  // Filtros avanzados: rango de fechas, cuenta, tercero
  const { desde, hasta, cuentaCodigo, terceroId, export: exportType } = req.query;
  let lista = transacciones;
  if (desde || hasta || cuentaCodigo || terceroId) {
    lista = transacciones.filter(tx => {
      const fechaTx = new Date(tx.fecha);
      if (desde && fechaTx < new Date(desde)) return false;
      if (hasta && fechaTx > new Date(hasta)) return false;
      if (terceroId && tx.terceroId !== parseInt(terceroId)) return false;
      if (cuentaCodigo && !tx.cuentas.some(c => c.codigo === cuentaCodigo)) return false;
      return true;
    });
  }
  // Exportación a Excel/PDF
  if (exportType === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Libro Diario');
    sheet.addRow(['Fecha', 'Descripción', 'Documento', 'Cuenta', 'Débito', 'Crédito', 'Tercero']);
    lista.forEach(tx => {
      tx.cuentas.forEach(c => {
        sheet.addRow([
          tx.fecha,
          tx.descripcion,
          tx.documento,
          c.codigo,
          c.debito,
          c.credito,
          tx.terceroId || ''
        ]);
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=libro_diario.xlsx');
    workbook.xlsx.write(res).then(() => res.end());
    return;
  }
  if (exportType === 'pdf') {
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=libro_diario.pdf');
    doc.pipe(res);
    doc.fontSize(16).text('Libro Diario', { align: 'center' });
    doc.moveDown();
    lista.forEach(tx => {
      doc.fontSize(12).text(`Fecha: ${tx.fecha} | Desc: ${tx.descripcion} | Doc: ${tx.documento}`);
      tx.cuentas.forEach(c => {
        doc.fontSize(10).text(`   Cuenta: ${c.codigo} | Débito: ${c.debito} | Crédito: ${c.credito}`);
      });
      doc.moveDown();
    });
    doc.end();
    return;
  }
  res.json(lista);
}

