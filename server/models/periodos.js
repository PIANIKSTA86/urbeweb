// Modelo Periodo para Drizzle ORM

import { mysqlTable, int, varchar, date, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core';

export const periodosContables = mysqlTable('periodos_contables', {
  id: int('id').primaryKey().autoincrement(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  ano: int('ano').notNull(),
  mes: int('mes').notNull(),
  fecha_inicio: date('fecha_inicio').notNull(),
  fecha_fin: date('fecha_fin').notNull(),
  estado_periodo: mysqlEnum('estado_periodo', ['abierto', 'cerrado', 'bloqueado']).default('abierto'),
  usuario_creacion_id: int('usuario_creacion_id').notNull(),
  fecha_creacion: timestamp('fecha_creacion').notNull().default('current_timestamp()'),
  fecha_cierre: timestamp('fecha_cierre'),
  created_at: timestamp('created_at').notNull().default('current_timestamp()'),
  updated_at: timestamp('updated_at').notNull().default('current_timestamp()'),
});
