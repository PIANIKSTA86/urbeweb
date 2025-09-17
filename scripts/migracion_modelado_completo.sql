-- Migración SQL para partidas_presupuestales
CREATE TABLE IF NOT EXISTS partidas_presupuestales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(50),
  monto_aprobado DECIMAL(18,2) DEFAULT 0,
  saldo DECIMAL(18,2) DEFAULT 0,
  estado TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Migración SQL para conceptos_exogena
CREATE TABLE IF NOT EXISTS conceptos_exogena (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  formato VARCHAR(50),
  tipo VARCHAR(50),
  estado TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Migración SQL para plan_cuentas_exogena (relación)
CREATE TABLE IF NOT EXISTS plan_cuentas_exogena (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cuenta_id INT NOT NULL,
  exogena_id INT NOT NULL,
  formato VARCHAR(50),
  observaciones TEXT
);

-- Modificaciones a movimiento_detalle
ALTER TABLE movimiento_detalle 
  ADD COLUMN IF NOT EXISTS valor_base DECIMAL(18,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tercero_id INT;

-- Modificaciones a movimientos_contables
ALTER TABLE movimientos_contables 
  ADD COLUMN IF NOT EXISTS centro_costo_id INT,
  ADD COLUMN IF NOT EXISTS partida_presupuestal_id INT,
  ADD COLUMN IF NOT EXISTS conciliado TINYINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fecha_conciliacion DATETIME;

-- Modificaciones a plan_cuentas
ALTER TABLE plan_cuentas 
  ADD COLUMN IF NOT EXISTS es_presupuestal TINYINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS es_exogena TINYINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS requiere_tercero TINYINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS requiere_centro_costo TINYINT DEFAULT 0;
