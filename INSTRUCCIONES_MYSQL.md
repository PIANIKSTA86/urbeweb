
## Script completo para crear la base de datos URBE

```sql
-- 1. Crear la base de datos
CREATE DATABASE urbe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE urbe;

-- 2. Tabla de usuarios y roles
CREATE TABLE roles (
	id INT AUTO_INCREMENT PRIMARY KEY,
	nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE usuarios (
	id INT AUTO_INCREMENT PRIMARY KEY,
	nombre VARCHAR(100) NOT NULL,
	email VARCHAR(100) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL,
	telefono VARCHAR(20),
	rol_id INT,
	estado ENUM('activo','inactivo') DEFAULT 'activo',
	FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- 3. Tabla de terceros
CREATE TABLE terceros (
	id INT AUTO_INCREMENT PRIMARY KEY,
	tipo_tercero VARCHAR(50),
	tipo_persona VARCHAR(50),
	tipo_contribuyente VARCHAR(50),
	tipo_identificacion VARCHAR(50),
	numero_identificacion VARCHAR(30),
	primer_nombre VARCHAR(50),
	segundo_nombre VARCHAR(50),
	primer_apellido VARCHAR(50),
	segundo_apellido VARCHAR(50),
	razon_social VARCHAR(100),
	direccion VARCHAR(100),
	pais VARCHAR(50),
	departamento VARCHAR(50),
	municipio VARCHAR(50),
	telefono VARCHAR(20),
	movil VARCHAR(20),
	email VARCHAR(100)
);

-- 4. Tabla de unidades habitacionales
CREATE TABLE unidades (
	id INT AUTO_INCREMENT PRIMARY KEY,
	tipo_unidad VARCHAR(50),
	codigo_unidad VARCHAR(30) NOT NULL UNIQUE,
	propietario_id INT,
	area DECIMAL(10,2),
	coeficiente DECIMAL(5,2),
	cuota_administracion DECIMAL(10,2),
	parqueadero BOOLEAN DEFAULT FALSE,
	cuota_parqueadero DECIMAL(10,2),
	intereses BOOLEAN DEFAULT FALSE,
	estado_ocupacion VARCHAR(50),
	FOREIGN KEY (propietario_id) REFERENCES terceros(id)
);

-- 5. Tabla de PUC (Plan Único de Cuentas)
CREATE TABLE puc (
	id INT AUTO_INCREMENT PRIMARY KEY,
	codigo VARCHAR(10) NOT NULL,
	clase VARCHAR(50) NOT NULL,
	grupo VARCHAR(50),
	cuenta VARCHAR(100),
	subcuenta VARCHAR(100),
	auxiliar VARCHAR(100),
	nombre VARCHAR(100) NOT NULL,
	nivel INT NOT NULL,
	estado ENUM('activo','inactivo') DEFAULT 'activo',
	es_debito BOOLEAN DEFAULT TRUE,
	nombre_clase VARCHAR(50),
	registra_tercero BOOLEAN DEFAULT FALSE
);

-- 6. Tabla de transacciones contables
CREATE TABLE transacciones (
	id INT AUTO_INCREMENT PRIMARY KEY,
	fecha DATE NOT NULL,
	descripcion VARCHAR(255),
	tipo_documento VARCHAR(50),
	documento_fuente VARCHAR(50),
	periodo_id INT,
	usuario_id INT,
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 7. Tabla de movimientos contables (detalle de transacciones)
CREATE TABLE movimientos (
	id INT AUTO_INCREMENT PRIMARY KEY,
	transaccion_id INT,
	puc_id INT,
	tercero_id INT,
	valor DECIMAL(15,2) NOT NULL,
	tipo_movimiento ENUM('debito','credito') NOT NULL,
	FOREIGN KEY (transaccion_id) REFERENCES transacciones(id),
	FOREIGN KEY (puc_id) REFERENCES puc(id),
	FOREIGN KEY (tercero_id) REFERENCES terceros(id)
);

-- 8. Tabla de periodos contables
CREATE TABLE periodos (
	id INT AUTO_INCREMENT PRIMARY KEY,
	nombre VARCHAR(50) NOT NULL,
	fecha_inicio DATE NOT NULL,
	fecha_fin DATE NOT NULL,
	estado ENUM('abierto','cerrado') DEFAULT 'abierto'
);

-- 9. Tabla de reservas de zonas comunes
CREATE TABLE zonas_comunes (
	id INT AUTO_INCREMENT PRIMARY KEY,
	nombre VARCHAR(100) NOT NULL,
	descripcion VARCHAR(255),
	estado ENUM('disponible','no_disponible') DEFAULT 'disponible'
);

CREATE TABLE reservas (
	id INT AUTO_INCREMENT PRIMARY KEY,
	zona_id INT,
	unidad_id INT,
	usuario_id INT,
	fecha DATE NOT NULL,
	hora_inicio TIME NOT NULL,
	hora_fin TIME NOT NULL,
	estado ENUM('pendiente','aprobada','cancelada') DEFAULT 'pendiente',
	FOREIGN KEY (zona_id) REFERENCES zonas_comunes(id),
	FOREIGN KEY (unidad_id) REFERENCES unidades(id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 10. Tabla de auditoría y trazabilidad
CREATE TABLE auditoria (
	id INT AUTO_INCREMENT PRIMARY KEY,
	usuario_id INT,
	accion VARCHAR(100),
	descripcion VARCHAR(255),
	fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

---
Sigue estos pasos para migrar y conectar el backend como se indica en la sección anterior.
