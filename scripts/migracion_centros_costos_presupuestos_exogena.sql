-- Script de migración: Centros de Costo
CREATE TABLE centros_costo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    estado TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Script de migración: Partidas Presupuestales
CREATE TABLE partidas_presupuestales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50),
    monto_aprobado DECIMAL(18,2) DEFAULT 0,
    saldo DECIMAL(18,2) DEFAULT 0,
    estado TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Script de migración: Conceptos Exógena
CREATE TABLE conceptos_exogena (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    formato VARCHAR(50),
    tipo VARCHAR(50),
    estado TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Script de migración: Relación Cuentas-Exógena
CREATE TABLE plan_cuentas_exogena (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cuenta_id INT NOT NULL,
    exogena_id INT NOT NULL,
    formato VARCHAR(50),
    observaciones TEXT,
    FOREIGN KEY (cuenta_id) REFERENCES plan_cuentas(id),
    FOREIGN KEY (exogena_id) REFERENCES conceptos_exogena(id)
);

-- Alterar tabla movimientos_contables
ALTER TABLE movimientos_contables
    ADD COLUMN centro_costo_id INT,
    ADD COLUMN partida_presupuestal_id INT,
    ADD COLUMN conciliado TINYINT DEFAULT 0,
    ADD COLUMN fecha_conciliacion DATETIME,
    ADD FOREIGN KEY (centro_costo_id) REFERENCES centros_costo(id),
    ADD FOREIGN KEY (partida_presupuestal_id) REFERENCES partidas_presupuestales(id);

-- Alterar tabla movimiento_detalle
ALTER TABLE movimiento_detalle
    ADD COLUMN valor_base DECIMAL(18,2) DEFAULT 0;

-- Alterar tabla plan_cuentas
ALTER TABLE plan_cuentas
    ADD COLUMN es_presupuestal TINYINT DEFAULT 0,
    ADD COLUMN es_exogena TINYINT DEFAULT 0,
    ADD COLUMN requiere_tercero TINYINT DEFAULT 0,
    ADD COLUMN requiere_centro_costo TINYINT DEFAULT 0;
