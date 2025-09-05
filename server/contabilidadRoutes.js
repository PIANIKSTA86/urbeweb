
import express from 'express';
import * as contabilidadController from './contabilidadController.js';
import * as transaccionesController from './transaccionesController.js';
import * as reportesController from './reportesController.js';
import periodosRoutes from './periodosRoutes.js';

const router = express.Router();

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
router.post('/transacciones', transaccionesController.createTransaccion); // Crear nueva transacción
router.put('/transacciones/:id', transaccionesController.updateTransaccion); // Editar transacción
router.delete('/transacciones/:id', transaccionesController.deleteTransaccion); // Eliminar transacción

export default router;
