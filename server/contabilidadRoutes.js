import { db } from './db';
import { movimientosContables } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

// ...existing code...

import express from 'express';
import * as contabilidadController from './contabilidadController.js';
import * as transaccionesController from './transaccionesController.js';
import * as reportesController from './reportesController.js';
import periodosRoutes from './periodosRoutes.js';

const router = express.Router();

// Endpoint para validar si existe un número de comprobante
router.get('/comprobantes/numero/:numero', async (req, res) => {
	   try {
		   const { numero } = req.params;
		   const movimiento = await db.select().from(movimientosContables).where(eq(movimientosContables.numero, numero));
		   res.json({ exists: movimiento.length > 0 });
	   } catch (err) {
		   res.status(500).json({ error: 'Error al validar número de comprobante', detalles: err.message });
	   }
});


// Endpoint para fechas únicas de movimientos contables
router.get('/transacciones/fechas', transaccionesController.getFechasMovimientos);

// Endpoint para consultar movimientos contables con filtros avanzados
router.get('/movimientos', async (req, res) => {
	try {
		const { centro_costo_id, partida_presupuestal_id, conciliado, fecha_conciliacion } = req.query;
		let query = db.select().from(movimientosContables);
		const where = [];
		if (centro_costo_id) where.push(eq(movimientosContables.centro_costo_id, Number(centro_costo_id)));
		if (partida_presupuestal_id) where.push(eq(movimientosContables.partida_presupuestal_id, Number(partida_presupuestal_id)));
		if (conciliado !== undefined) where.push(eq(movimientosContables.conciliado, Number(conciliado)));
		if (fecha_conciliacion) where.push(eq(movimientosContables.fecha_conciliacion, new Date(fecha_conciliacion)));
		if (where.length > 0) {
			query = query.where(where.length === 1 ? where[0] : where.reduce((a, b) => a.and(b)));
		}
		const movimientos = await query;
		res.json(movimientos);
	} catch (err) {
		res.status(500).json({ error: 'Error al consultar movimientos', detalles: err.message });
	}
});

// Endpoint para crear comprobante contable con movimientos
router.post('/comprobantes', contabilidadController.createComprobante);

// Endpoints para el Plan Único de Cuentas (PUC)
router.get('/puc', contabilidadController.getCuentasPUC); // Obtener todas las cuentas
router.post('/puc', contabilidadController.createCuentaPUC); // Crear nueva cuenta
router.post('/puc/import', contabilidadController.importPlanCuentas); // Importar plan de cuentas desde CSV
router.put('/puc/:id', contabilidadController.updateCuentaPUC); // Editar cuenta
router.delete('/puc/:id', contabilidadController.deleteCuentaPUC); // Eliminar cuenta

// Endpoints para periodos contables
router.use(periodosRoutes);

// Endpoints para reportes contables
router.get('/reportes/balance-prueba', reportesController.getBalancePrueba); // Balance de prueba por cuenta y tercero
router.get('/reportes/balance-general', reportesController.getBalanceGeneral); // Balance general
router.get('/reportes/estado-resultados', reportesController.getEstadoResultados); // Estado de resultados
router.get('/reportes/libro-diario', reportesController.getLibroDiario); // Libro diario

// Endpoints para transacciones contables
router.get('/transacciones', transaccionesController.getTransacciones); // Obtener todas las transacciones
// router.post('/transacciones', transaccionesController.createTransaccion); // Crear nueva transacción
router.put('/transacciones/:id', transaccionesController.updateTransaccion); // Editar transacción
router.delete('/transacciones/:id', transaccionesController.deleteTransaccion); // Eliminar transacción

export default router;
