// Modelo para tipos de transacción contable
import { mysqlTable, int, varchar, timestamp } from 'drizzle-orm/mysql-core';

export const tiposTransaccion = mysqlTable('tipos_transaccion', {
  id: int('id').primaryKey().autoincrement(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  descripcion: varchar('descripcion', { length: 255 }),
  created_at: timestamp('created_at').notNull().default('current_timestamp()'),
  updated_at: timestamp('updated_at').notNull().default('current_timestamp()'),
});
