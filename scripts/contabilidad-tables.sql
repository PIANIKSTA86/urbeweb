-- Tabla: plan_cuentas
CREATE TABLE IF NOT EXISTS plan_cuentas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clase VARCHAR(20) NOT NULL,
    grupo VARCHAR(20) NOT NULL,
    cuenta VARCHAR(20) NULL,
    subcuenta VARCHAR(20) NULL,
    auxiliar VARCHAR(20) NULL,
    nombre VARCHAR(255) NOT NULL,
    tipo ENUM('activo','pasivo','patrimonio','ingreso','gasto','costo','orden') NOT NULL,
    nivel INT NOT NULL,
    padre_id INT,
    descripcion TEXT,
    estado ENUM('activo','inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (padre_id) REFERENCES plan_cuentas(id)
);

-- Tabla: comprobantes_contables
CREATE TABLE IF NOT EXISTS comprobantes_contables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(50) NOT NULL,
    tipo ENUM('venta','compra','ingreso','egreso','nota_credito','nota_debito','traslado','apertura','cierre','nota_ajuste') NOT NULL,
    fecha DATE NOT NULL,
    descripcion TEXT,
    estado ENUM('activo','anulado') DEFAULT 'activo',
    usuario_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    -- Puedes agregar FOREIGN KEY (usuario_id) REFERENCES usuarios(id) si existe la tabla usuarios
);

CREATE TABLE IF NOT EXISTS periodos_contables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ano INT NOT NULL,
    mes INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado_periodo ENUM('abierto','cerrado','bloqueado') DEFAULT 'abierto',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- Tabla: comprobante_detalle
CREATE TABLE IF NOT EXISTS comprobante_detalle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comprobante_id INT NOT NULL,
    cuenta_id INT NOT NULL,
    tercero_id INT,
    descripcion TEXT,
    debito DECIMAL(18,2) DEFAULT 0,
    credito DECIMAL(18,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (comprobante_id) REFERENCES comprobantes_contables(id),
    FOREIGN KEY (cuenta_id) REFERENCES plan_cuentas(id)
    -- Puedes agregar FOREIGN KEY (tercero_id) REFERENCES terceros(id) si existe la tabla terceros
);
