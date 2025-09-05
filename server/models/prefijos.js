// Modelo para prefijos y numeraciones asociados a tipos de transacción
import { mysqlTable, int, varchar, timestamp } from 'drizzle-orm/mysql-core';

export const prefijos = mysqlTable('prefijos', {
  id: int('id').primaryKey().autoincrement(),
  tipo_transaccion_id: int('tipo_transaccion_id').notNull(),
  prefijo: varchar('prefijo', { length: 20 }).notNull(),
  numeracion_actual: int('numeracion_actual').notNull().default(1),
  descripcion: varchar('descripcion', { length: 255 }),
  created_at: timestamp('created_at').notNull().default('current_timestamp()'),
  updated_at: timestamp('updated_at').notNull().default('current_timestamp()'),
});
