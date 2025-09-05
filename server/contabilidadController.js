import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import multer from 'multer';
import { planCuentas } from '../shared/schema.js';

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
      registra_tercero
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
      registra_tercero
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

