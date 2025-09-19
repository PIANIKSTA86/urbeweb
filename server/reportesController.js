// Controlador de reportes contables
// Genera reportes como balance de prueba, por cuenta y por tercero

import { db } from './db.js';
import { planCuentas } from '../shared/schema.js';
import transacciones from './models/transacciones.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// Balance de prueba: muestra saldos por cuenta
export function getBalancePrueba(req, res) {
  // Filtros avanzados: tercero, cuenta, rango de fechas
  const terceroId = req.query.terceroId ? parseInt(req.query.terceroId) : null;
  const cuentaCodigo = req.query.cuentaCodigo || null;
  const nivelFiltro = req.query.nivel ? parseInt(req.query.nivel) : null;
  let desde = req.query.desde ? new Date(req.query.desde) : null;
  let hasta = req.query.hasta ? new Date(req.query.hasta) : null;
  // Interpreta año y periodo contable si se envían
  if (req.query.anio) {
    const anio = parseInt(req.query.anio);
    desde = new Date(`${anio}-01-01T00:00:00`);
    hasta = new Date(`${anio}-12-31T23:59:59`);
  }
  if (req.query.periodoContable) {
    // Buscar el periodo contable en la BDD (simulado aquí)
    // En producción, deberías consultar la tabla periodos_contables
    // Ejemplo: periodoContable = "2025-01" => enero 2025
    const [anio, mes] = req.query.periodoContable.split("-");
    if (anio && mes) {
      desde = new Date(`${anio}-${mes}-01T00:00:00`);
      // Calcular último día del mes
      const lastDay = new Date(desde.getFullYear(), desde.getMonth() + 1, 0).getDate();
      hasta = new Date(`${anio}-${mes}-${lastDay}T23:59:59`);
    }
  }
  const saldos = {};
  db.select().from(planCuentas).then(cuentas => {
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

    // Calcular saldos anteriores (antes de 'desde')
    transacciones.forEach(tx => {
      if (terceroId && tx.terceroId !== terceroId) return;
      const fechaTx = new Date(tx.fecha);
      tx.cuentas.forEach(c => {
        if (saldos[c.codigo]) {
          if (desde && fechaTx < desde) {
            saldos[c.codigo].saldoAnterior += c.debito - c.credito;
          }
        }
      });
    });

    // Calcular movimientos del periodo y saldo final
    transacciones.forEach(tx => {
      if (terceroId && tx.terceroId !== terceroId) return;
      const fechaTx = new Date(tx.fecha);
      if (desde && fechaTx < desde) return;
      if (hasta && fechaTx > hasta) return;
      tx.cuentas.forEach(c => {
        if (saldos[c.codigo]) {
          saldos[c.codigo].movDebito += c.debito;
          saldos[c.codigo].movCredito += c.credito;
        }
      });
    });

    // Calcular saldos finales (separar en débito/crédito)
    Object.keys(saldos).forEach(codigo => {
      const s = saldos[codigo];
      const saldoFinal = s.saldoAnterior + s.movDebito - s.movCredito;
      s.saldoDebito = saldoFinal > 0 ? saldoFinal : 0;
      s.saldoCredito = saldoFinal < 0 ? Math.abs(saldoFinal) : 0;
    });

    // Exportación a Excel/PDF
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

