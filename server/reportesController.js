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

    // --- Exportación jerárquica con subtotales ---
    function buildHierarchy(planCuentasRows, movimientosFiltrados) {
      // Construye un árbol de cuentas con subtotales y movimientos
      const cuentasMap = {};
      planCuentasRows.forEach(c => {
        cuentasMap[c.codigo] = { ...c, hijos: [], movimientos: [], subtotal: { saldo_anterior: 0, mov_debito: 0, mov_credito: 0, saldo_final: 0 } };
      });
      // Relacionar hijos con padres
      planCuentasRows.forEach(c => {
        if (c.padre_codigo && cuentasMap[c.padre_codigo]) {
          cuentasMap[c.padre_codigo].hijos.push(cuentasMap[c.codigo]);
        }
      });
      // Asignar movimientos a cuentas
      movimientosFiltrados.forEach(mov => {
        if (cuentasMap[mov.codigo_nivel]) {
          cuentasMap[mov.codigo_nivel].movimientos.push(mov);
        }
      });
      // Calcular subtotales recursivamente y filtrar cuentas vacías
      function calcularYFiltrar(cuenta) {
        let subtotal = { saldo_anterior: 0, mov_debito: 0, mov_credito: 0, saldo_final: 0 };
        // Sumar movimientos directos
        cuenta.movimientos.forEach(mov => {
          subtotal.saldo_anterior += Number(mov.saldo_anterior);
          subtotal.mov_debito += Number(mov.mov_debito);
          subtotal.mov_credito += Number(mov.mov_credito);
          subtotal.saldo_final += Number(mov.saldo_final);
        });
        // Filtrar hijos vacíos recursivamente
        cuenta.hijos = cuenta.hijos.filter(hijo => {
          const sub = calcularYFiltrar(hijo);
          // Si el hijo o alguno de sus descendientes tiene valores, se queda
          return (sub.saldo_anterior !== 0 || sub.mov_debito !== 0 || sub.mov_credito !== 0 || sub.saldo_final !== 0);
        });
        // Sumar subtotales de hijos válidos
        cuenta.hijos.forEach(hijo => {
          subtotal.saldo_anterior += hijo.subtotal.saldo_anterior;
          subtotal.mov_debito += hijo.subtotal.mov_debito;
          subtotal.mov_credito += hijo.subtotal.mov_credito;
          subtotal.saldo_final += hijo.subtotal.saldo_final;
        });
        cuenta.subtotal = subtotal;
        return subtotal;
      }
      // Raíces: cuentas sin padre
      let raices = planCuentasRows.filter(c => !c.padre_codigo).map(c => cuentasMap[c.codigo]);
      raices.forEach(c => calcularYFiltrar(c));
      // Filtrar raíces vacías
      raices = raices.filter(c => (c.subtotal.saldo_anterior !== 0 || c.subtotal.mov_debito !== 0 || c.subtotal.mov_credito !== 0 || c.subtotal.saldo_final !== 0));
      return raices;
    }

    function exportarExcelJerarquico(raices, workbook) {
      const sheet = workbook.addWorksheet('Balance de Prueba');
      sheet.addRow(['Código', 'Nombre', 'Tercero', 'Saldo Anterior', 'Débitos', 'Créditos', 'Saldo Final']);
      function recorrer(cuenta, nivel) {
        // Fila de subtotal de la cuenta
        sheet.addRow([
          cuenta.codigo,
          '  '.repeat(nivel) + cuenta.nombre,
          '',
          cuenta.subtotal.saldo_anterior,
          cuenta.subtotal.mov_debito,
          cuenta.subtotal.mov_credito,
          cuenta.subtotal.saldo_final
        ]);
        // Filas de movimientos de terceros (si existen)
        cuenta.movimientos.forEach(mov => {
          if (mov.tercero_nombre) {
            sheet.addRow([
              '',
              '  '.repeat(nivel + 1) + mov.tercero_nombre,
              mov.tercero_identificacion || '',
              mov.saldo_anterior,
              mov.mov_debito,
              mov.mov_credito,
              mov.saldo_final
            ]);
          }
        });
        cuenta.hijos.forEach(hijo => recorrer(hijo, nivel + 1));
      }
      raices.forEach(c => recorrer(c, 0));
    }

    function exportarPDFJerarquico(raices, doc) {
      // --- Modern PDF Styling ---
  const PAGE_WIDTH = 612; // Carta width in points
  const PAGE_HEIGHT = 792; // Carta height in points
  const MARGIN = 30;
  const COLS = [MARGIN, 90, 260, 340, 400, 460, 520];
  const ROW_HEIGHT = 14;
  let y = doc.y;

  // --- Encabezado empresarial ---
  // Título principal
  doc.font('Helvetica-Bold').fontSize(15).fillColor('#222').text('Balance de Prueba', MARGIN, y, { align: 'center', width: PAGE_WIDTH - 2 * MARGIN });
  y += 20;
  // Subtítulo con rango de fechas y nivel
  const fechaInicio = (typeof globalThis.fecha_inicio_pdf !== 'undefined') ? globalThis.fecha_inicio_pdf : '';
  const fechaFin = (typeof globalThis.fecha_fin_pdf !== 'undefined') ? globalThis.fecha_fin_pdf : '';
  const nivelReporte = (typeof globalThis.nivel_pdf !== 'undefined') ? globalThis.nivel_pdf : '';
  const fechaGeneracion = new Date();
  const fechaGenStr = fechaGeneracion.toLocaleDateString('es-CO');
  const horaGenStr = fechaGeneracion.toLocaleTimeString('es-CO');
  doc.font('Helvetica').fontSize(10).fillColor('#444').text(`Rango: ${fechaInicio} a ${fechaFin}`, MARGIN, y, { align: 'left', width: 250 });
  doc.font('Helvetica').fontSize(10).fillColor('#444').text(`Nivel: ${nivelReporte}`, PAGE_WIDTH/2 - 40, y, { align: 'left', width: 80 });
  doc.font('Helvetica').fontSize(9).fillColor('#888').text(`Generado: ${fechaGenStr} ${horaGenStr}`, PAGE_WIDTH - 200, y, { align: 'right', width: 170 });
  y += 18;
  // Línea divisoria
  doc.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y).strokeColor('#bbb').lineWidth(1).stroke();
  y += 6;

  // Cabecera de columnas
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#fff');
  doc.rect(MARGIN, y, PAGE_WIDTH - 2 * MARGIN, ROW_HEIGHT).fill('#2d3748');
  doc.fillColor('#fff').text('Código', COLS[0] + 2, y + 2, { width: COLS[1] - COLS[0] - 4 });
  doc.text('Nombre', COLS[1] + 2, y + 2, { width: COLS[2] - COLS[1] - 4 });
  doc.text('Tercero', COLS[2] + 2, y + 2, { width: COLS[3] - COLS[2] - 4 });
  doc.text('Saldo Ant.', COLS[3] + 2, y + 2, { width: COLS[4] - COLS[3] - 4, align: 'right' });
  doc.text('Débitos', COLS[4] + 2, y + 2, { width: COLS[5] - COLS[4] - 4, align: 'right' });
  doc.text('Créditos', COLS[5] + 2, y + 2, { width: COLS[6] - COLS[5] - 4, align: 'right' });
  doc.text('Saldo Final', COLS[6] + 2, y + 2, { width: 60, align: 'right' });
  y += ROW_HEIGHT;
  doc.fillColor('#222');

  // Línea bajo cabecera
  doc.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y).strokeColor('#bbb').lineWidth(1).stroke();
  y += 2;

      function printRow({codigo, nombre, tercero, saldo_anterior, mov_debito, mov_credito, saldo_final, bold, nivel, bg}) {
        // Salto de página si es necesario
        if (y + ROW_HEIGHT > PAGE_HEIGHT - MARGIN) {
          doc.addPage();
          y = MARGIN;
          // Redibujar encabezado empresarial en cada página
          doc.font('Helvetica-Bold').fontSize(15).fillColor('#222').text('Balance de Prueba', MARGIN, y, { align: 'center', width: PAGE_WIDTH - 2 * MARGIN });
          y += 20;
          doc.font('Helvetica').fontSize(10).fillColor('#444').text(`Rango: ${fechaInicio} a ${fechaFin}`, MARGIN, y, { align: 'left', width: 250 });
          doc.font('Helvetica').fontSize(10).fillColor('#444').text(`Nivel: ${nivelReporte}`, PAGE_WIDTH/2 - 40, y, { align: 'left', width: 80 });
          doc.font('Helvetica').fontSize(9).fillColor('#888').text(`Generado: ${fechaGenStr} ${horaGenStr}`, PAGE_WIDTH - 200, y, { align: 'right', width: 170 });
          y += 18;
          doc.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y).strokeColor('#bbb').lineWidth(1).stroke();
          y += 6;
          // Redibujar cabecera de columnas
          doc.font('Helvetica-Bold').fontSize(9).fillColor('#fff');
          doc.rect(MARGIN, y, PAGE_WIDTH - 2 * MARGIN, ROW_HEIGHT).fill('#2d3748');
          doc.fillColor('#fff').text('Código', COLS[0] + 2, y + 2, { width: COLS[1] - COLS[0] - 4 });
          doc.text('Nombre', COLS[1] + 2, y + 2, { width: COLS[2] - COLS[1] - 4 });
          doc.text('Tercero', COLS[2] + 2, y + 2, { width: COLS[3] - COLS[2] - 4 });
          doc.text('Saldo Ant.', COLS[3] + 2, y + 2, { width: COLS[4] - COLS[3] - 4, align: 'right' });
          doc.text('Débitos', COLS[4] + 2, y + 2, { width: COLS[5] - COLS[4] - 4, align: 'right' });
          doc.text('Créditos', COLS[5] + 2, y + 2, { width: COLS[6] - COLS[5] - 4, align: 'right' });
          doc.text('Saldo Final', COLS[6] + 2, y + 2, { width: 60, align: 'right' });
          y += ROW_HEIGHT;
          doc.fillColor('#222');
          doc.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y).strokeColor('#bbb').lineWidth(1).stroke();
          y += 2;
        }
        if (bg) {
          doc.rect(MARGIN, y, PAGE_WIDTH - 2 * MARGIN, ROW_HEIGHT).fill(bg);
          doc.fillColor('#222');
        }
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.5).fillColor('#222');
        doc.text(codigo || '', COLS[0] + 2, y + 2, { width: COLS[1] - COLS[0] - 4 });
        doc.text(nombre || '', COLS[1] + 2, y + 2, { width: COLS[2] - COLS[1] - 4 });
        doc.text(tercero || '', COLS[2] + 2, y + 2, { width: COLS[3] - COLS[2] - 4 });
        doc.text(saldo_anterior != null ? formatNumber(saldo_anterior) : '', COLS[3] + 2, y + 2, { width: COLS[4] - COLS[3] - 4, align: 'right' });
        doc.text(mov_debito != null ? formatNumber(mov_debito) : '', COLS[4] + 2, y + 2, { width: COLS[5] - COLS[4] - 4, align: 'right' });
        doc.text(mov_credito != null ? formatNumber(mov_credito) : '', COLS[5] + 2, y + 2, { width: COLS[6] - COLS[5] - 4, align: 'right' });
        doc.text(saldo_final != null ? formatNumber(saldo_final) : '', COLS[6] + 2, y + 2, { width: 60, align: 'right' });
        y += ROW_HEIGHT;
      }

      function formatNumber(n) {
        return Number(n).toLocaleString('es-CO', { minimumFractionDigits: 2 });
      }

      function recorrer(cuenta, nivel) {
        // Fila de subtotal/totales de la cuenta (solo negrilla para totales/subtotales)
        printRow({
          codigo: cuenta.codigo,
          nombre: '  '.repeat(nivel) + cuenta.nombre,
          tercero: '',
          saldo_anterior: cuenta.subtotal.saldo_anterior,
          mov_debito: cuenta.subtotal.mov_debito,
          mov_credito: cuenta.subtotal.mov_credito,
          saldo_final: cuenta.subtotal.saldo_final,
          bold: true,
          nivel,
          bg: nivel === 0 ? '#e2e8f0' : (nivel === 1 ? '#f7fafc' : null)
        });
        // Filas de movimientos de terceros (sin negrilla)
        cuenta.movimientos.forEach(mov => {
          if (mov.tercero_nombre) {
            printRow({
              codigo: '',
              nombre: '  '.repeat(nivel + 1) + mov.tercero_nombre,
              tercero: mov.tercero_identificacion || '',
              saldo_anterior: mov.saldo_anterior,
              mov_debito: mov.mov_debito,
              mov_credito: mov.mov_credito,
              saldo_final: mov.saldo_final,
              bold: false,
              nivel: nivel + 1,
              bg: null
            });
          }
        });
        cuenta.hijos.forEach(hijo => recorrer(hijo, nivel + 1));
      }

      raices.forEach(c => recorrer(c, 0));

      // Línea final
      doc.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y).strokeColor('#bbb').lineWidth(1).stroke();
      doc.end();
    }

    if (formato === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const raices = buildHierarchy(planCuentasRows, movimientosFiltrados);
      exportarExcelJerarquico(raices, workbook);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=balance_prueba.xlsx');
      await workbook.xlsx.write(res);
      res.end();
      return;
    }
    if (formato === 'pdf') {
  // Pasar parámetros de encabezado a la función de exportación usando globalThis (hack simple para no romper la firma)
  globalThis.fecha_inicio_pdf = fecha_inicio;
  globalThis.fecha_fin_pdf = fecha_fin;
  globalThis.nivel_pdf = nivel;
  const doc = new PDFDocument({ margin: 30, size: [612, 792] }); // Carta
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=balance_prueba.pdf');
  doc.pipe(res);
  const raices = buildHierarchy(planCuentasRows, movimientosFiltrados);
  exportarPDFJerarquico(raices, doc);
  // Limpiar globalThis
  delete globalThis.fecha_inicio_pdf;
  delete globalThis.fecha_fin_pdf;
  delete globalThis.nivel_pdf;
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

