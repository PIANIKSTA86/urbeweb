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
  const desde = req.query.desde ? new Date(req.query.desde) : null;
  const hasta = req.query.hasta ? new Date(req.query.hasta) : null;
  const saldos = {};
  db.select().from(planCuentas).then(cuentas => {
    cuentas.forEach(cuenta => {
      if (cuentaCodigo && cuenta.codigo !== cuentaCodigo) return;
      saldos[cuenta.codigo] = {
        nombre: cuenta.nombre,
        tipo: cuenta.tipo,
        debito: 0,
        credito: 0,
        saldo: 0
      };
    });

    transacciones.forEach(tx => {
      if (terceroId && tx.terceroId !== terceroId) return;
      if (desde && new Date(tx.fecha) < desde) return;
      if (hasta && new Date(tx.fecha) > hasta) return;
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

    // Exportación a Excel/PDF
    if (req.query.export === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Balance de Prueba');
      sheet.addRow(['Código', 'Nombre', 'Tipo', 'Débito', 'Crédito', 'Saldo']);
      Object.entries(saldos).forEach(([codigo, data]) => {
        sheet.addRow([codigo, data.nombre, data.tipo, data.debito, data.credito, data.saldo]);
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
        doc.fontSize(12).text(`Código: ${codigo} | Nombre: ${data.nombre} | Tipo: ${data.tipo} | Débito: ${data.debito} | Crédito: ${data.credito} | Saldo: ${data.saldo}`);
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

