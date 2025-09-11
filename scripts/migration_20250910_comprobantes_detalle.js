// Migración para actualizar la estructura de comprobantes y comprobante_detalle
// - Agrega tercero_id a comprobantes_contables
// - Agrega documento_cruce y comentario a comprobante_detalle
// - Cambia enum de estado en comprobantes_contables

import { sql } from "drizzle-orm";

export async function up(db) {
  // 1. (Eliminado) No agregar tercero_id a comprobantes_contables

  // 2. Cambiar enum de estado
  await db.execute(sql`
    ALTER TABLE comprobantes_contables
    MODIFY COLUMN estado ENUM('borrador', 'contabilizado', 'anulado') NOT NULL DEFAULT 'borrador';
  `);

  // 3. Agregar documento_cruce y comentario a comprobante_detalle
  await db.execute(sql`
    ALTER TABLE comprobante_detalle
    ADD COLUMN documento_cruce VARCHAR(50) NULL AFTER tercero_id,
    ADD COLUMN comentario TEXT NULL AFTER documento_cruce;
  `);
}

export async function down(db) {
  // Revertir los cambios
  // (Eliminado) No quitar tercero_id porque nunca se agregó
  await db.execute(sql`
    ALTER TABLE comprobantes_contables
    MODIFY COLUMN estado ENUM('activo', 'anulado', 'registrado') NOT NULL DEFAULT 'registrado';
  `);
  await db.execute(sql`
    ALTER TABLE comprobante_detalle
    DROP COLUMN documento_cruce,
    DROP COLUMN comentario;
  `);
}
