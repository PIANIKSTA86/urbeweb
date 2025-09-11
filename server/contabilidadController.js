
import { movimientosContables, movimientoDetalle, terceros, auditoria, planCuentas } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

// Crear comprobante contable con movimientos y auditoría
export async function createComprobante(req, res) {
  console.log('DEBUG inicio createComprobante', req.body);
  try {

  let { numero, tipo, fecha, descripcion, usuario_id, movimientos, estado, periodo_id } = req.body;
    // Si fecha es string, convertir a Date
    if (typeof fecha === 'string') {
      fecha = new Date(fecha);
    }

  await db.transaction(async (trx) => {
      // Validación básica
      if (!numero || !tipo || !fecha || !Array.isArray(movimientos) || movimientos.length === 0) {
        throw new Error('Datos incompletos para el comprobante.');
      }

      // Validar que todas las cuentas y terceros existen y sumar débitos/créditos
      let totalDebito = 0, totalCredito = 0;
      for (const mov of movimientos) {
        if (mov.cuenta_id == null) {
          throw new Error('No se puede registrar un movimiento sin cuenta_id.');
        }
        const cuenta = await trx.select().from(planCuentas).where(eq(planCuentas.id, mov.cuenta_id));
        if (!cuenta.length) {
          throw new Error(`Cuenta no existe: ${mov.cuenta_id}`);
        }
        // Validar tercero por movimiento
        if (mov.tercero_id) {
          const tercero = await trx.select().from(terceros).where(eq(terceros.id, mov.tercero_id));
          if (!tercero.length) {
            throw new Error(`Tercero no existe: ${mov.tercero_id}`);
          }
        }
        if ((Number(mov.debito) > 0 && Number(mov.credito) > 0) || (Number(mov.debito) === 0 && Number(mov.credito) === 0)) {
          throw new Error('Cada movimiento debe tener solo débito o solo crédito, nunca ambos o ninguno.');
        }
        totalDebito += Number(mov.debito || 0);
        totalCredito += Number(mov.credito || 0);
      }
      if (totalDebito !== totalCredito) {
        throw new Error('El comprobante no está balanceado.');
      }

      // TODO: Validar periodo contable abierto aquí si aplica



      // Insertar comprobante y obtener id (MySQL: insertId)

  console.log('DEBUG antes de insert movimientosContables', { numero, tipo, fecha, descripcion, usuario_id, estado, periodo_id });
      const result = await trx.insert(movimientosContables).values({ 
        numero, 
        tipo, 
        fecha, 
        descripcion, 
        usuario_id, 
        estado: estado || 'borrador',
        periodo_id: periodo_id || null
      });
  console.log('DEBUG despues de insert movimientosContables', result);
      let movimiento_id = undefined;
      if (result && typeof result === 'object') {
        if ('insertId' in result && result.insertId) {
          movimiento_id = result.insertId;
        } else if (Array.isArray(result) && result[0]?.insertId) {
          movimiento_id = result[0].insertId;
        } else if ('lastInsertId' in result && result.lastInsertId) {
          movimiento_id = result.lastInsertId;
        } else if ('id' in result && result.id) {
          movimiento_id = result.id;
        }
      } else if (typeof result === 'number') {
        movimiento_id = result;
      }
      console.log('DEBUG movimiento_id:', movimiento_id, 'result:', result);
      if (!movimiento_id || isNaN(Number(movimiento_id))) {
        throw new Error('No se pudo obtener el ID del comprobante insertado. Valor devuelto: ' + JSON.stringify(result));
      }

      // Insertar movimientos con el id correcto
      for (const mov of movimientos) {
        if (!movimiento_id) {
          throw new Error('movimiento_id indefinido al insertar detalle.');
        }
        await trx.insert(movimientoDetalle).values({
          movimiento_id,
          cuenta_id: mov.cuenta_id,
          tercero_id: mov.tercero_id || null,
          documento_cruce: mov.documentoCruce || null,
          comentario: mov.comentario || null,
          descripcion: mov.descripcion || descripcion,
          debito: mov.debito || 0,
          credito: mov.credito || 0
        });
      }

      // Registrar auditoría
      await trx.insert(auditoria).values({
        usuario_id,
        accion: 'crear_comprobante',
        descripcion: `Creó comprobante #${numero} (${tipo})`,
        fecha: new Date()
      });

  res.status(201).json({ movimiento_id });
    });
  } catch (err) {
    console.error('Error al crear comprobante:', err);
    res.status(500).json({ error: err.message || 'Error interno al crear comprobante' });
  }
}
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import multer from 'multer';

// Configuración de multer para subir archivos
const upload = multer({ dest: 'uploads/' });

// Endpoint para importar plan de cuentas desde CSV
export const importPlanCuentas = [
  upload.single('file'),
  async (req, res) => {
    try {
      const filePath = req.file.path;
      const parser = parse({ columns: true, delimiter: ',' });
      const cuentas = [];
      fs.createReadStream(filePath)
        .pipe(parser);
      parser.on('data', (row) => {
        cuentas.push(row);
      });
      parser.on('end', async () => {
        let errores = [];
        for (const cuenta of cuentas) {
          try {
            await db.insert(planCuentas).values({
              codigo: cuenta.codigo ? cuenta.codigo.trim() : null,
              nombre: cuenta.nombre ? cuenta.nombre.trim() : null,
              tipo: cuenta.tipo ? cuenta.tipo.trim() : null,
              nivel: cuenta.nivel ? parseInt(cuenta.nivel.trim()) : null,
              padre_codigo: cuenta.padre_codigo ? cuenta.padre_codigo.trim() : null,
              descripcion: cuenta.descripcion ? cuenta.descripcion.trim() : null,
              estado: cuenta.estado !== undefined && cuenta.estado !== '' ? parseInt(cuenta.estado.trim()) : 1,
              es_debito: cuenta.es_debito !== undefined && cuenta.es_debito !== '' ? parseInt(cuenta.es_debito.trim()) : null,
              registra_tercero: cuenta.registra_tercero !== undefined && cuenta.registra_tercero !== '' ? parseInt(cuenta.registra_tercero.trim()) : 0,
              registra_documento: cuenta.registra_documento !== undefined && cuenta.registra_documento !== '' ? parseInt(cuenta.registra_documento.trim()) : 0,
              fecha_creacion: cuenta.fecha_creacion || new Date(),
            });
          } catch (err) {
            console.error(`Error al importar cuenta:`, {
              cuenta: cuenta,
              error: err.message
            });
            errores.push({ cuenta: cuenta.codigo || cuenta.nombre, error: err.message });
          }
        }
        fs.unlinkSync(filePath);
        if (errores.length > 0) {
          res.status(400).json({ mensaje: 'Algunos registros no se importaron', errores });
        } else {
          res.status(201).json({ mensaje: 'Plan de cuentas importado correctamente', total: cuentas.length });
        }
      });
      parser.on('error', (err) => {
  console.error('Error al procesar el archivo CSV:', err);
  res.status(500).json({ error: err.message });
      });
    } catch (error) {
  console.error('Error al importar plan de cuentas:', error);
  res.status(500).json({ error: error.message });
    }
  }
];


// Controlador para el módulo contable
// Gestiona las operaciones CRUD sobre el Plan Único de Cuentas usando MySQL y Drizzle ORM

import { db } from './db.js'; // Importa la instancia de Drizzle ORM

// Obtener todas las cuentas del PUC
export async function getCuentasPUC(req, res) {
  try {
    const { search } = req.query;
    let cuentas;
    if (search && typeof search === 'string' && search.trim() !== '') {
      // Interpolar el parámetro directamente en el SQL (escapando para evitar inyección)
      const safeSearch = search.trim().replace(/'/g, "''");
      try {
        // Consulta priorizada: primero códigos que empiezan con search, luego nombres que contienen search y no están en los códigos ya listados
  const sql = `SELECT id, codigo, nombre, nivel FROM (SELECT id, codigo, nombre, nivel, 1 AS priority FROM plan_cuentas WHERE codigo LIKE CONCAT('${safeSearch}', '%') UNION ALL SELECT id, codigo, nombre, nivel, 2 AS priority FROM plan_cuentas WHERE nombre LIKE CONCAT('%', '${safeSearch}', '%') AND codigo NOT LIKE CONCAT('${safeSearch}', '%')) AS t ORDER BY priority, codigo LIMIT 40;`;
        const result = await db.execute(sql);
        console.log('Consulta ejecutada correctamente:', sql);
        // Drizzle puede devolver [[{...}]] o {rows: [...]}, normalizamos a array plano
        if (Array.isArray(result)) {
          // Si es array anidado, tomar el primer elemento si es array
          cuentas = Array.isArray(result[0]) ? result[0] : result;
        } else if (result && Array.isArray(result.rows)) {
          cuentas = result.rows;
        } else {
          cuentas = [];
        }
      } catch (err) {
        console.error('Error ejecutando consulta raw plan_cuentas:', err);
        throw err;
      }
    } else {
      cuentas = await db.select().from(planCuentas);
    }
    res.json(cuentas);
  } catch (error) {
    console.error('Error general en getCuentasPUC:', error);
    res.status(500).json({ error: 'Error al obtener cuentas PUC', detalle: error.message });
  }
}

// Crear una nueva cuenta en el PUC
export async function createCuentaPUC(req, res) {
  try {
    const {
      codigo,
      nombre,
      tipo,
      nivel,
      padre_codigo,
      descripcion,
      estado,
      es_debito,
      registra_tercero,
      registra_documento
    } = req.body;
    const nuevaCuenta = {
      codigo,
      nombre,
      tipo,
      nivel: nivel ? parseInt(nivel) : null,
      padre_codigo,
      descripcion,
      estado: estado !== undefined && estado !== '' ? parseInt(estado) : 1,
      es_debito: es_debito !== undefined && es_debito !== '' ? parseInt(es_debito) : null,
      registra_tercero: registra_tercero !== undefined && registra_tercero !== '' ? parseInt(registra_tercero) : 0,
      registra_documento: registra_documento !== undefined && registra_documento !== '' ? parseInt(registra_documento) : 0,
      fecha_creacion: new Date(),
    };
    const resultado = await db.insert(planCuentas).values(nuevaCuenta);
    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear cuenta PUC', detalle: error.message });
  }
}

// Editar una cuenta existente
export async function updateCuentaPUC(req, res) {
  try {
    const id = parseInt(req.params.id);
    const {
      codigo,
      nombre,
      tipo,
      nivel,
      padre_codigo,
      descripcion,
      estado,
      es_debito,
      registra_tercero,
      registra_documento
    } = req.body;
    const datosActualizados = {
      codigo,
      nombre,
      tipo,
      nivel: nivel ? parseInt(nivel) : null,
      padre_codigo,
      descripcion,
      estado: estado !== undefined && estado !== '' ? parseInt(estado) : 1,
      es_debito: es_debito !== undefined && es_debito !== '' ? parseInt(es_debito) : null,
      registra_tercero: registra_tercero !== undefined && registra_tercero !== '' ? parseInt(registra_tercero) : 0,
      registra_documento: registra_documento !== undefined && registra_documento !== '' ? parseInt(registra_documento) : 0,
      updated_at: new Date(),
    };
    const resultado = await db.update(planCuentas).set(datosActualizados).where({ id });
    if (resultado.affectedRows === 0) return res.status(404).json({ error: 'Cuenta no encontrada' });
    res.json({ mensaje: 'Cuenta actualizada', resultado });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cuenta PUC', detalle: error.message });
  }
}

// Eliminar una cuenta
export async function deleteCuentaPUC(req, res) {
  try {
    const id = parseInt(req.params.id);
    const resultado = await db.delete(planCuentas).where({ id });
    if (resultado.affectedRows === 0) return res.status(404).json({ error: 'Cuenta no encontrada' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cuenta PUC', detalle: error.message });
  }
}

