// Controlador de reportes contables
// Genera reportes como balance de prueba, por cuenta y por tercero

import { db, pool } from './db.js';
import { planCuentas, movimientosContables, movimientoDetalle } from '../shared/schema.js';
// import transacciones from './models/transacciones.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// Balance de prueba: muestra saldos por cuenta
export async function getBalancePrueba(req, res) {
  // Parámetros recibidos del frontend
  const fecha_inicio = req.query.fecha_inicio || req.body.fecha_inicio;
  const fecha_fin = req.query.fecha_fin || req.body.fecha_fin;
  const cuenta_filtro = req.query.cuenta_filtro || req.body.cuenta_filtro;
  const nivel = parseInt(req.query.nivel || req.body.nivel || 1);
  const mostrar_terceros = parseInt(req.query.mostrar_terceros || req.body.mostrar_terceros || 0);
  const centro_costo_id = req.query.centro_costo_id || req.body.centro_costo_id;
  const formato = req.query.formato || req.body.formato || null;

  // ...
  // Consulta SQL avanzada
  const sql = `
    SELECT 
      pc.codigo AS codigo_nivel,
      pc.nombre AS nombre_nivel,
      t.numero_identificacion AS tercero_identificacion,
      TRIM(CONCAT_WS(' ', t.razon_social, t.primer_nombre, t.segundo_nombre, t.primer_apellido, t.segundo_apellido)) AS tercero_nombre,
      SUM(CASE WHEN mc.fecha < ? THEN md.debito - md.credito ELSE 0 END) AS saldo_anterior,
      SUM(CASE WHEN mc.fecha BETWEEN ? AND ? THEN md.debito ELSE 0 END) AS mov_debito,
      SUM(CASE WHEN mc.fecha BETWEEN ? AND ? THEN md.credito ELSE 0 END) AS mov_credito,
      SUM(CASE WHEN mc.fecha <= ? THEN md.debito - md.credito ELSE 0 END) AS saldo_final,
      'con_terceros' AS tipo_reporte
    FROM plan_cuentas pc
    INNER JOIN movimiento_detalle md ON md.cuenta_id = pc.id
    INNER JOIN movimientos_contables mc ON mc.id = md.movimiento_id
  LEFT JOIN terceros t ON t.id = md.tercero_id
    WHERE ? = 1 AND ? >= 5 AND pc.nivel = ?
      AND (? IS NULL OR pc.codigo LIKE CONCAT(?, '%'))
      AND mc.fecha <= ?
  AND (? IS NULL OR mc.centro_costo_id = ? OR mc.centro_costo_id IS NULL)
    GROUP BY pc.codigo, pc.nombre, t.numero_identificacion, tercero_nombre
    HAVING saldo_anterior != 0 OR mov_debito != 0 OR mov_credito != 0
    UNION ALL
    SELECT 
      CASE ?
        WHEN 1 THEN pc.nv1
        WHEN 2 THEN pc.nv2
        WHEN 3 THEN pc.nv3
        WHEN 4 THEN pc.nv4
        WHEN 5 THEN pc.nv5
        ELSE pc.codigo
      END AS codigo_nivel,
      MAX(pc.nombre) AS nombre_nivel,
      NULL AS tercero_identificacion,
      NULL AS tercero_nombre,
      SUM(CASE WHEN mc.fecha < ? THEN md.debito - md.credito ELSE 0 END) AS saldo_anterior,
      SUM(CASE WHEN mc.fecha BETWEEN ? AND ? THEN md.debito ELSE 0 END) AS mov_debito,
      SUM(CASE WHEN mc.fecha BETWEEN ? AND ? THEN md.credito ELSE 0 END) AS mov_credito,
      SUM(CASE WHEN mc.fecha <= ? THEN md.debito - md.credito ELSE 0 END) AS saldo_final,
      'consolidado' AS tipo_reporte
    FROM plan_cuentas pc
    INNER JOIN movimiento_detalle md ON md.cuenta_id = pc.id
    INNER JOIN movimientos_contables mc ON mc.id = md.movimiento_id
    WHERE (? BETWEEN 1 AND 4 OR (? >= 5 AND ? = 0))
      AND (? IS NULL OR pc.codigo LIKE CONCAT(?, '%'))
      AND mc.fecha <= ?
  AND (? IS NULL OR mc.centro_costo_id = ? OR mc.centro_costo_id IS NULL)
      AND (
        (? = 1 AND pc.nv1 IS NOT NULL) OR
        (? = 2 AND pc.nv2 IS NOT NULL) OR
        (? = 3 AND pc.nv3 IS NOT NULL) OR
        (? = 4 AND pc.nv4 IS NOT NULL) OR
        (? = 5 AND pc.nv5 IS NOT NULL) OR
        (? = 6 AND pc.nivel = 6)
      )
    GROUP BY 
      CASE ?
        WHEN 1 THEN pc.nv1
        WHEN 2 THEN pc.nv2
        WHEN 3 THEN pc.nv3
        WHEN 4 THEN pc.nv4
        WHEN 5 THEN pc.nv5
        ELSE pc.codigo
      END
    HAVING saldo_anterior != 0 OR mov_debito != 0 OR mov_credito != 0
    ORDER BY tipo_reporte DESC, codigo_nivel, tercero_nombre
  `;

  // Log de la consulta SQL y parámetros
  console.log('[BalancePrueba] SQL:', sql);
  // Si tienes un array de parámetros, descomenta la siguiente línea:
  // console.log('[BalancePrueba] Params SQL:', params);
  // Log de depuración para centro de costo y parámetros recibidos
  console.log('[BalancePrueba] Params:', {
    fecha_inicio,
    fecha_fin,
    cuenta_filtro,
    nivel,
    mostrar_terceros,
    centro_costo_id
  });

  const params = [
    fecha_inicio, fecha_inicio, fecha_fin, fecha_inicio, fecha_fin, fecha_fin,
    mostrar_terceros, nivel, nivel, cuenta_filtro, cuenta_filtro, fecha_fin,
    centro_costo_id, centro_costo_id,
    nivel, fecha_inicio, fecha_inicio, fecha_fin, fecha_inicio, fecha_fin, fecha_fin,
    nivel, nivel, mostrar_terceros, cuenta_filtro, cuenta_filtro, fecha_fin,
    centro_costo_id, centro_costo_id,
    nivel, nivel, nivel, nivel, nivel, nivel, nivel,
    nivel
  ];

  // Usar pool de mysql2 para ejecutar SQL directo
  try {
    console.log('[BalancePrueba] SQL:', sql);
    console.log('[BalancePrueba] Params SQL:', params);
    // Obtener movimientos filtrados
    const [movimientos] = await pool.query(sql, params);
    // Filtrar movimientos con todos los saldos en cero
    const movimientosFiltrados = movimientos.filter(row => {
      return (
        (Number(row.saldo_anterior) !== 0 || Number(row.mov_debito) !== 0 || Number(row.mov_credito) !== 0 || Number(row.saldo_final) !== 0)
      );
    });
    // Obtener solo cuentas activas
    const [planCuentasRows] = await pool.query('SELECT id, codigo, nombre, tipo, nivel, padre_codigo FROM plan_cuentas WHERE estado = 1 ORDER BY codigo');

    // Exportación Excel o PDF
    if (formato === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Balance de Prueba');
      // Cabecera
      sheet.addRow(['Código', 'Nombre', 'Tercero', 'Saldo Anterior', 'Débitos', 'Créditos', 'Saldo Final']);
      movimientosFiltrados.forEach(row => {
        sheet.addRow([
          row.codigo_nivel,
          row.nombre_nivel,
          row.tercero_nombre || '',
          row.saldo_anterior,
          row.mov_debito,
          row.mov_credito,
          row.saldo_final
        ]);
      });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=balance_prueba.xlsx');
      await workbook.xlsx.write(res);
      res.end();
      return;
    }
    if (formato === 'pdf') {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=balance_prueba.pdf');
      doc.pipe(res);
      doc.fontSize(14).text('Balance de Prueba', { align: 'center' });
      doc.moveDown();
      // Cabecera
      doc.fontSize(10).text('Código', 30, doc.y, { continued: true });
      doc.text('Nombre', 80, doc.y, { continued: true });
      doc.text('Tercero', 200, doc.y, { continued: true });
      doc.text('Saldo Ant.', 320, doc.y, { continued: true });
      doc.text('Débitos', 390, doc.y, { continued: true });
      doc.text('Créditos', 450, doc.y, { continued: true });
      doc.text('Saldo Final', 520, doc.y);
      doc.moveDown(0.5);
      movimientosFiltrados.forEach(row => {
        doc.text(row.codigo_nivel, 30, doc.y, { continued: true });
        doc.text(row.nombre_nivel, 80, doc.y, { continued: true });
        doc.text(row.tercero_nombre || '', 200, doc.y, { continued: true });
        doc.text(String(row.saldo_anterior), 320, doc.y, { continued: true });
        doc.text(String(row.mov_debito), 390, doc.y, { continued: true });
        doc.text(String(row.mov_credito), 450, doc.y, { continued: true });
        doc.text(String(row.saldo_final), 520, doc.y);
      });
      doc.end();
      return;
    }
    // Respuesta normal JSON
    res.json({ movimientos: movimientosFiltrados, planCuentas: planCuentasRows });
  } catch (err) {
    console.error('Error ejecutando balance de prueba:', err);
    res.status(500).json({ error: 'Error ejecutando balance de prueba', details: err });
  }
}

// const sql = "select id, codigo, nombre, tipo, nivel, padre_codigo, descripcion, estado, es_debito, registra_tercero, es_presupuestal, es_exogena, requiere_centro_costo, fecha_creacion, updated_at from plan_cuentas";
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

