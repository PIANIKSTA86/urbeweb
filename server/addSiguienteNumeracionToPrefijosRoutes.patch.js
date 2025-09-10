// PATCH: Agrega endpoint para el siguiente consecutivo real de numeración
import { getSiguienteNumeracion } from './transaccionesController.js';

export default function patchPrefijosRoutes(router) {
  // Endpoint: /api/contabilidad/siguiente-numeracion?prefijo=CI
  router.get('/siguiente-numeracion', getSiguienteNumeracion);
}
