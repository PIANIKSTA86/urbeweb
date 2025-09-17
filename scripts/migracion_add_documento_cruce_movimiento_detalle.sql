-- Agrega el campo documento_cruce a la tabla movimiento_detalle si no existe
ALTER TABLE movimiento_detalle ADD COLUMN documento_cruce VARCHAR(50) NULL AFTER tercero_id;