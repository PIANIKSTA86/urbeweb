// Tabla comprobante_detalle
export const comprobanteDetalle = mysqlTable("comprobante_detalle", {
  id: int("id").primaryKey().autoincrement().notNull(),
  comprobante_id: int("comprobante_id").notNull(),
  cuenta_id: int("cuenta_id").notNull(),
  tercero_id: int("tercero_id"),
  descripcion: text("descripcion"),
  debito: decimal("debito", { precision: 18, scale: 2 }).default("0.00"),
  credito: decimal("credito", { precision: 18, scale: 2 }).default("0.00"),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});
// Tabla de auditoría
export const auditoria = mysqlTable("auditoria", {
  id: int("id").primaryKey().autoincrement().notNull(),
  usuario_id: int("usuario_id"),
  accion: varchar("accion", { length: 100 }),
  descripcion: varchar("descripcion", { length: 255 }),
  fecha: datetime("fecha").default(sql`CURRENT_TIMESTAMP`),
});
import { sql } from "drizzle-orm";
import {
  mysqlTable,
  text,
  varchar,
  int,
  decimal,
  boolean,
  datetime,
  mysqlEnum,
  tinyint,
  timestamp,
  mysqlTableWithSchema,
  mysqlSchema,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums para tipos de datos
export const tipoPersonaEnum = mysqlEnum('tipo_persona', ['natural', 'juridica']);
export const tipoTerceroEnum = mysqlEnum('tipo_tercero', ['propietario', 'inquilino', 'proveedor']);
export const tipoContribuyenteEnum = mysqlEnum('tipo_contribuyente', ['responsable_iva', 'no_responsable_iva', 'gran_contribuyente']);
export const tipoIdentificacionEnum = mysqlEnum('tipo_identificacion', ['cedula', 'nit', 'pasaporte', 'cedula_extranjeria']);
export const tipoUnidadEnum = mysqlEnum('tipo_unidad', ['apartamento', 'local_comercial', 'oficina', 'deposito', 'parqueadero']);
export const estadoOcupacionEnum = mysqlEnum('estado_ocupacion', ['ocupado', 'desocupado', 'en_mantenimiento']);
export const estadoPeriodoEnum = mysqlEnum('estado_periodo', ['abierto', 'cerrado']);
export const tipoTransaccionEnum = mysqlEnum('tipo_transaccion', ['ingreso', 'egreso', 'ajuste']);
export const rolUsuarioEnum = mysqlEnum('rol_usuario', ['superadmin', 'administrador', 'contador', 'revisor', 'auxiliar', 'propietario']);

export const usuarios = mysqlTable("usuarios", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  apellido: varchar("apellido", { length: 100 }).notNull(),
  rol_id: int("rol_id").notNull().default(1),
  activo: boolean("activo").default(true),
  fechaCreacion: datetime("fecha_creacion").default(sql`CURRENT_TIMESTAMP`),
  fechaActualizacion: datetime("fecha_actualizacion").default(sql`CURRENT_TIMESTAMP`),
});

export const terceros = mysqlTable("terceros", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  tipoPersona: tipoPersonaEnum.notNull(),
  tipoTercero: tipoTerceroEnum.notNull(),
  tipoContribuyente: tipoContribuyenteEnum.notNull(),
  tipoIdentificacion: tipoIdentificacionEnum.notNull(),
  numeroIdentificacion: varchar("numero_identificacion", { length: 20 }).unique().notNull(),
  primerNombre: varchar("primer_nombre", { length: 50 }),
  segundoNombre: varchar("segundo_nombre", { length: 50 }),
  primerApellido: varchar("primer_apellido", { length: 50 }),
  segundoApellido: varchar("segundo_apellido", { length: 50 }),
  razonSocial: varchar("razon_social", { length: 200 }),
  direccion: text("direccion").notNull(),
  pais: varchar("pais", { length: 50 }).notNull().default('Colombia'),
  departamento: varchar("departamento", { length: 50 }).notNull(),
  municipio: varchar("municipio", { length: 50 }).notNull(),
  municipioCodigoDane: varchar("municipio_codigo_dane", { length: 10 }),
  telefono: varchar("telefono", { length: 20 }),
  movil: varchar("movil", { length: 20 }),
  email: varchar("email", { length: 255 }),
  activo: boolean("activo").default(true),
  fechaCreacion: datetime("fecha_creacion").default(sql`CURRENT_TIMESTAMP`),
  fechaActualizacion: datetime("fecha_actualizacion").default(sql`CURRENT_TIMESTAMP`),
});

export const unidades = mysqlTable("unidades", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  tipoUnidad: tipoUnidadEnum.notNull(),
  codigoUnidad: varchar("codigo_unidad", { length: 20 }).unique().notNull(),
  propietarioId: varchar("propietario_id", { length: 36 }),
  inquilinoId: varchar("inquilino_id", { length: 36 }),
  area: decimal("area", { precision: 10, scale: 2 }).notNull(),
  coeficiente: decimal("coeficiente", { precision: 8, scale: 6 }).notNull(),
  cuotaAdministracion: decimal("cuota_administracion", { precision: 10, scale: 2 }).notNull(),
  tieneParqueadero: boolean("tiene_parqueadero").default(false),
  cuotaParqueadero: decimal("cuota_parqueadero", { precision: 10, scale: 2 }).default('0'),
  generaIntereses: boolean("genera_intereses").default(true),
  estadoOcupacion: estadoOcupacionEnum.notNull().default('desocupado'),
  activo: boolean("activo").default(true),
  fechaCreacion: datetime("fecha_creacion").default(sql`CURRENT_TIMESTAMP`),
  fechaActualizacion: datetime("fecha_actualizacion").default(sql`CURRENT_TIMESTAMP`),
});

export const planCuentas = mysqlTable("plan_cuentas", {
  id: int("id").primaryKey().autoincrement().notNull(),
  codigo: varchar("codigo", { length: 20 }).unique().notNull(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  tipo: mysqlEnum("tipo", ["activo", "pasivo", "patrimonio", "ingreso", "gasto", "orden"]).notNull(),
  nivel: int("nivel").notNull(),
  padre_codigo: varchar("padre_codigo", { length: 20 }),
  descripcion: text("descripcion"),
  estado: tinyint("estado").default(1),
  es_debito: tinyint("es_debito"),
  registra_tercero: tinyint("registra_tercero").default(0),
  fecha_creacion: datetime("fecha_creacion").default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const periodosContables = mysqlTable("periodos_contables", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  ano: int("ano").notNull(),
  mes: int("mes").notNull(),
  nombre: varchar("nombre", { length: 50 }).notNull(),
  fechaInicio: datetime("fecha_inicio").notNull(),
  fechaCierre: datetime("fecha_cierre").notNull(),
  estado: estadoPeriodoEnum.notNull().default('abierto'),
  fechaCreacion: datetime("fecha_creacion").default(sql`CURRENT_TIMESTAMP`),
});

export const comprobantesContables = mysqlTable("comprobantes_contables", {
  id: int("id").primaryKey().autoincrement().notNull(),
  numero: varchar("numero", { length: 50 }).notNull(),
  tipo: mysqlEnum("tipo", ['venta', 'compra', 'ingreso', 'egreso', 'nota']).notNull(),
  fecha: datetime("fecha").notNull(),
  descripcion: text("descripcion"),
  estado: mysqlEnum("estado", ['activo', 'anulado', 'registrado']).notNull().default('registrado'),
  usuario_id: int("usuario_id").notNull(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const movimientosContables = mysqlTable("movimientos_contables", {
  id: int("id").primaryKey().autoincrement().notNull(),
  comprobante_id: int("comprobante_id").notNull(),
  cuenta_id: int("cuenta_id").notNull(),
  tercero_id: int("tercero_id"),
  descripcion: text("descripcion"),
  debito: decimal("debito", { precision: 18, scale: 2 }).default('0.00'),
  credito: decimal("credito", { precision: 18, scale: 2 }).default('0.00'),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const facturas = mysqlTable("facturas", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  numeroFactura: varchar("numero_factura", { length: 20 }).unique().notNull(),
  terceroId: varchar("tercero_id", { length: 36 }).notNull(),
  unidadId: varchar("unidad_id", { length: 36 }),
  periodoId: varchar("periodo_id", { length: 36 }).notNull(),
  fechaFactura: datetime("fecha_factura").notNull(),
  fechaVencimiento: datetime("fecha_vencimiento").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  iva: decimal("iva", { precision: 10, scale: 2 }).default('0'),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  pagada: boolean("pagada").default(false),
  fechaPago: datetime("fecha_pago"),
  observaciones: text("observaciones"),
  fechaCreacion: datetime("fecha_creacion").default(sql`CURRENT_TIMESTAMP`),
});

// Relaciones
export const tercerosRelations = relations(terceros, ({ many }) => ({
  unidadesPropias: many(unidades, { relationName: "propietario" }),
  unidadesArrendadas: many(unidades, { relationName: "inquilino" }),
  facturas: many(facturas),
  movimientos: many(movimientosContables),
}));

export const unidadesRelations = relations(unidades, ({ one, many }) => ({
  propietario: one(terceros, { 
    fields: [unidades.propietarioId], 
    references: [terceros.id],
    relationName: "propietario"
  }),
  inquilino: one(terceros, { 
    fields: [unidades.inquilinoId], 
    references: [terceros.id],
    relationName: "inquilino"
  }),
  facturas: many(facturas),
}));

export const comprobantesRelations = relations(comprobantesContables, ({ one, many }) => ({
  // periodo: one(periodosContables, {
  //   fields: [comprobantesContables.periodo_id],
  //   references: [periodosContables.id]
  // }),
  usuario: one(usuarios, {
    fields: [comprobantesContables.usuario_id],
    references: [usuarios.id]
  }),
  movimientos: many(movimientosContables),
}));

export const movimientosRelations = relations(movimientosContables, ({ one }) => ({
  comprobante: one(comprobantesContables, {
    fields: [movimientosContables.comprobante_id],
    references: [comprobantesContables.id]
  }),
  cuenta: one(planCuentas, {
    fields: [movimientosContables.cuenta_id],
    references: [planCuentas.id]
  }),
  tercero: one(terceros, {
    fields: [movimientosContables.tercero_id],
    references: [terceros.id]
  }),
}));

// Schemas de inserción
export const insertUsuarioSchema = createInsertSchema(usuarios).omit({
  id: true,
  fechaCreacion: true,
  fechaActualizacion: true,
});

export const insertTerceroSchema = createInsertSchema(terceros).omit({
  id: true,
  fechaCreacion: true,
  fechaActualizacion: true,
});

export const insertUnidadSchema = createInsertSchema(unidades).omit({
  id: true,
  fechaCreacion: true,
  fechaActualizacion: true,
}).extend({
  area: z.number(),
  coeficiente: z.number(),
  cuotaAdministracion: z.number(),
  cuotaParqueadero: z.number().nullable(),
});

export const insertPlanCuentaSchema = createInsertSchema(planCuentas).omit({
  id: true,
  fecha_creacion: true,
  updated_at: true,
});

export const insertComprobanteSchema = createInsertSchema(comprobantesContables).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertMovimientoSchema = createInsertSchema(movimientosContables).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Tipos de inferencia
export type Usuario = typeof usuarios.$inferSelect;
export type InsertUsuario = z.infer<typeof insertUsuarioSchema>;

export type Tercero = typeof terceros.$inferSelect;
export type InsertTercero = z.infer<typeof insertTerceroSchema>;

export type Unidad = typeof unidades.$inferSelect;
export type InsertUnidad = z.infer<typeof insertUnidadSchema>;

export type PlanCuenta = typeof planCuentas.$inferSelect;
export type InsertPlanCuenta = z.infer<typeof insertPlanCuentaSchema>;

export type PeriodoContable = typeof periodosContables.$inferSelect;
export type ComprobanteContable = typeof comprobantesContables.$inferSelect;
export type MovimientoContable = typeof movimientosContables.$inferSelect;
export type Factura = typeof facturas.$inferSelect;
