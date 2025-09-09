// Servicio para gestión de información exógena DIAN
// Todas las funciones usan apiRequest y están documentadas en español
import { apiRequest } from "./queryClient";

/**
 * Obtiene la lista de formatos DIAN para exógena de una propiedad
 * @param propertyId ID de la propiedad
 */
export async function obtenerFormatosExogena(propertyId: string) {
  const res = await apiRequest("GET", `/api/exogena/${propertyId}/formatos`);
  return res.json();
}

/**
 * Obtiene la lista de reportes exógena generados para una propiedad y año
 * @param propertyId ID de la propiedad
 * @param taxYear Año gravable
 */
export async function obtenerReportesExogena(propertyId: string, taxYear: number) {
  const res = await apiRequest("GET", `/api/exogena/${propertyId}/reportes?year=${taxYear}`);
  return res.json();
}

/**
 * Genera un reporte exógena para una propiedad, formato y año
 * @param propertyId ID de la propiedad
 * @param formatoId ID del formato DIAN
 * @param taxYear Año gravable
 * @param tipoReporte Tipo de reporte (xml, txt, excel)
 */
export async function generarReporteExogena(propertyId: string, formatoId: string, taxYear: number, tipoReporte: string) {
  const res = await apiRequest("POST", `/api/exogena/${propertyId}/reportes`, {
    formatoId,
    taxYear,
    tipoReporte,
  });
  return res.json();
}

/**
 * Obtiene los parámetros tributarios configurados para exógena
 * @param propertyId ID de la propiedad
 */
export async function obtenerParametrosExogena(propertyId: string) {
  const res = await apiRequest("GET", `/api/exogena/${propertyId}/parametros`);
  return res.json();
}
