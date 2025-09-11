import {
  usuarios,
  terceros,
  unidades,
  planCuentas,
  periodosContables,
  movimientosContables,
  movimientosContables,
  facturas,
  type Usuario,
  type InsertUsuario,
  type Tercero,
  type InsertTercero,
  type Unidad,
  type InsertUnidad,
  type PlanCuenta,
  type InsertPlanCuenta,
  type PeriodoContable,
  // type ComprobanteContable, // Eliminado
  type MovimientoContable,
  type Factura
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, sql, count } from "drizzle-orm";
import bcrypt from "bcrypt";

// Interfaz principal de almacenamiento
export interface IStorage {
  // Operaciones de usuarios
  getUsuario(id: string): Promise<Usuario | undefined>;
  getUsuarioPorEmail(email: string): Promise<Usuario | undefined>;
  crearUsuario(usuario: InsertUsuario): Promise<Usuario>;
  actualizarUsuario(id: string, datos: Partial<InsertUsuario>): Promise<Usuario>;
  
  // Operaciones de terceros
  getTerceros(filtros?: { tipo?: string; busqueda?: string; limite?: number; offset?: number }): Promise<{ terceros: Tercero[]; total: number }>;
  getTercero(id: string): Promise<Tercero | undefined>;
  crearTercero(tercero: InsertTercero): Promise<Tercero>;
  actualizarTercero(id: string, datos: Partial<InsertTercero>): Promise<Tercero>;
  eliminarTercero(id: string): Promise<void>;
  
  // Operaciones de unidades
  getUnidades(filtros?: { propietarioId?: string; limite?: number; offset?: number }): Promise<{ unidades: Unidad[]; total: number }>;
  getUnidad(id: string): Promise<Unidad | undefined>;
  crearUnidad(unidad: InsertUnidad): Promise<Unidad>;
  actualizarUnidad(id: string, datos: Partial<InsertUnidad>): Promise<Unidad>;
  eliminarUnidad(id: string): Promise<void>;
  
  // Operaciones del plan de cuentas
  getPlanCuentas(): Promise<PlanCuenta[]>;
  getCuenta(id: string): Promise<PlanCuenta | undefined>;
  crearCuenta(cuenta: InsertPlanCuenta): Promise<PlanCuenta>;
  
  // Operaciones de períodos contables
  getPeriodos(): Promise<PeriodoContable[]>;
  getPeriodoActual(): Promise<PeriodoContable | undefined>;
  
  // Operaciones de comprobantes y movimientos
  getMovimientos(periodoId?: string): Promise<MovimientoContable[]>;
  crearMovimiento(movimiento: any): Promise<MovimientoContable>;
  
  // Estadísticas del dashboard
  getEstadisticasDashboard(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Operaciones de usuarios
  async getUsuario(id: string): Promise<Usuario | undefined> {
    const [usuario] = await db.select().from(usuarios).where(eq(usuarios.id, id));
    return usuario;
  }

  async getUsuarioPorEmail(email: string): Promise<Usuario | undefined> {
    const [usuario] = await db.select().from(usuarios).where(eq(usuarios.email, email));
    return usuario;
  }

  async crearUsuario(datosUsuario: InsertUsuario): Promise<Usuario> {
    // Encriptar la contraseña antes de guardar
    const passwordEncriptado = await bcrypt.hash(datosUsuario.password, 10);
    await db
      .insert(usuarios)
      .values({
        email: datosUsuario.email,
        password: passwordEncriptado,
        nombre: datosUsuario.nombre,
        apellido: datosUsuario.apellido,
        telefono: datosUsuario.telefono,
        rol_id: datosUsuario.rol_id,
        activo: true
      });
    // Buscar el usuario recién creado por email
    const usuario = await this.getUsuarioPorEmail(datosUsuario.email);
    if (!usuario) throw new Error('No se pudo crear el usuario');
    return usuario;
  }

  async actualizarUsuario(id: string, datos: Partial<InsertUsuario>): Promise<Usuario> {
    const datosActualizacion = { ...datos };
    
    // Si se actualiza la contraseña, encriptarla
    if (datosActualizacion.password) {
      datosActualizacion.password = await bcrypt.hash(datosActualizacion.password, 10);
    }
    
    const [usuario] = await db
      .update(usuarios)
      .set({
        ...datosActualizacion,
        fechaActualizacion: new Date(),
      })
      .where(eq(usuarios.id, id))
      .returning();
    return usuario;
  }

  // Operaciones de terceros
  async getTerceros(filtros: { tipo?: string; busqueda?: string; limite?: number; offset?: number } = {}): Promise<{ terceros: Tercero[]; total: number }> {
    const { tipo, busqueda, limite = 10, offset = 0 } = filtros;
    
    const condiciones = [eq(terceros.activo, true)];
    
    if (tipo) {
      condiciones.push(eq(terceros.tipoTercero, tipo as any));
    }
    
    if (busqueda) {
      const search = `%${busqueda.toLowerCase()}%`;
      condiciones.push(
        sql`(LOWER(CONCAT_WS(' ', ${terceros.primerNombre}, ${terceros.primerApellido}, ${terceros.numeroIdentificacion}, COALESCE(${terceros.email},''))) LIKE ${search})`
      );
    }
    
    const whereCondition = condiciones.length > 0 ? and(...condiciones) : undefined;
    
    const [tercerosResult, totalResult] = await Promise.all([
      db.select().from(terceros)
        .where(whereCondition)
        .orderBy(desc(terceros.fechaCreacion))
        .limit(limite)
        .offset(offset),
      db.select({ count: count() }).from(terceros)
        .where(whereCondition)
    ]);

    // Mapear los campos a camelCase según el esquema actual
    const tercerosCamel = tercerosResult.map((t: any) => ({
  id: t.id,
  tipoTercero: t.tipoTercero,
  tipoPersona: t.tipoPersona,
  tipoContribuyente: t.tipoContribuyente,
  tipoIdentificacion: t.tipoIdentificacion,
  numeroIdentificacion: t.numeroIdentificacion,
  primerNombre: t.primerNombre,
  segundoNombre: t.segundoNombre,
  primerApellido: t.primerApellido,
  segundoApellido: t.segundoApellido,
  razonSocial: t.razonSocial,
  direccion: t.direccion,
  pais: t.pais,
  departamento: t.departamento,
  municipio: t.municipio,
  municipioCodigoDane: t.municipioCodigoDane,
  telefono: t.telefono,
  movil: t.movil,
  email: t.email,
  activo: t.activo,
  fechaCreacion: t.fechaCreacion,
  fechaActualizacion: t.fechaActualizacion,
    }));

    return {
      terceros: tercerosCamel,
      total: totalResult[0].count
    };
  }

  async getTercero(id: string): Promise<Tercero | undefined> {
    const [tercero] = await db.select().from(terceros).where(eq(terceros.id, id));
    if (!tercero) return undefined;
    return {
      ...tercero,
      municipioCodigoDane: tercero.municipioCodigoDane,
    };
  }

  async crearTercero(tercero: InsertTercero): Promise<Tercero> {
    // Insertar el tercero
    await db
      .insert(terceros)
      .values({
        ...tercero,
        municipioCodigoDane: tercero.municipioCodigoDane || null,
      });
    // Buscar el tercero recién creado por número de identificación
    const [nuevoTercero] = await db
      .select()
      .from(terceros)
      .where(eq(terceros.numeroIdentificacion, tercero.numeroIdentificacion));
    if (!nuevoTercero) throw new Error('No se pudo crear el tercero');
    return nuevoTercero;
  }

  async actualizarTercero(id: string, datos: Partial<InsertTercero>): Promise<Tercero> {
    await db
      .update(terceros)
      .set({
        ...datos,
        municipioCodigoDane: datos.municipioCodigoDane || null,
        fechaActualizacion: new Date(),
      })
      .where(eq(terceros.id, id));
    // Seleccionar el tercero actualizado
    const [tercero] = await db.select().from(terceros).where(eq(terceros.id, id));
    return tercero;
  }

  async eliminarTercero(id: string): Promise<void> {
    await db
      .update(terceros)
      .set({ activo: false })
      .where(eq(terceros.id, id));
  }

  // Operaciones de unidades
  async getUnidades(filtros: { propietarioId?: string; busqueda?: string; limite?: number; offset?: number } = {}): Promise<{ unidades: Unidad[]; total: number }> {
    const { propietarioId, busqueda, limite = 10, offset = 0 } = filtros;
    const condiciones = [eq(unidades.activo, true)];
    if (propietarioId) {
      condiciones.push(eq(unidades.propietarioId, propietarioId));
    }
    if (busqueda) {
      condiciones.push(like(unidades.codigoUnidad, `%${busqueda}%`));
    }
    const whereCondition = condiciones.length > 0 ? and(...condiciones) : undefined;
    const [unidadesResult, totalResult] = await Promise.all([
      db.select({
        id: unidades.id,
        tipoUnidad: unidades.tipoUnidad,
        codigoUnidad: unidades.codigoUnidad,
        propietarioId: unidades.propietarioId,
        inquilinoId: unidades.inquilinoId,
        area: unidades.area,
        coeficiente: unidades.coeficiente,
        cuotaAdministracion: unidades.cuotaAdministracion,
        tieneParqueadero: unidades.tieneParqueadero,
        cuotaParqueadero: unidades.cuotaParqueadero,
        generaIntereses: unidades.generaIntereses,
        estadoOcupacion: unidades.estadoOcupacion,
        activo: unidades.activo,
        fechaCreacion: unidades.fechaCreacion,
        fechaActualizacion: unidades.fechaActualizacion,
        propietario: {
          id: terceros.id,
          primerNombre: terceros.primerNombre,
          primerApellido: terceros.primerApellido,
          numeroIdentificacion: terceros.numeroIdentificacion
        }
      })
      .from(unidades)
      .leftJoin(terceros, eq(unidades.propietarioId, terceros.id))
      .where(whereCondition)
      .orderBy(unidades.codigoUnidad)
      .limit(limite)
      .offset(offset),
      db.select({ count: count() }).from(unidades)
        .where(whereCondition)
    ]);
    return {
      unidades: unidadesResult,
      total: totalResult[0].count
    };
  }

  async getUnidad(id: string): Promise<Unidad | undefined> {
    const [unidad] = await db.select().from(unidades).where(eq(unidades.id, id));
    return unidad;
  }

  async crearUnidad(unidad: InsertUnidad): Promise<Unidad> {
    await db
      .insert(unidades)
      .values(unidad);
    // Buscar la unidad recién creada por código
    const [nuevaUnidad] = await db
      .select()
      .from(unidades)
      .where(eq(unidades.codigoUnidad, unidad.codigoUnidad));
    if (!nuevaUnidad) throw new Error('No se pudo crear la unidad');
    return nuevaUnidad;
  }

  async actualizarUnidad(id: string, datos: Partial<InsertUnidad>): Promise<Unidad> {
    await db
      .update(unidades)
      .set({
        ...datos,
        fechaActualizacion: new Date(),
      })
      .where(eq(unidades.id, id));
    // Seleccionar la unidad actualizada
    const [unidad] = await db.select().from(unidades).where(eq(unidades.id, id));
    return unidad;
  }

  async eliminarUnidad(id: string): Promise<void> {
    await db
      .update(unidades)
      .set({ 
        activo: false,
        fechaActualizacion: new Date(),
      })
      .where(eq(unidades.id, id));
  }

  // Operaciones del plan de cuentas
  async getPlanCuentas(): Promise<PlanCuenta[]> {
    return await db
      .select()
      .from(planCuentas)
  .orderBy(planCuentas.codigo);
  }

  async getCuenta(id: string): Promise<PlanCuenta | undefined> {
    const [cuenta] = await db.select().from(planCuentas).where(eq(planCuentas.id, id));
    return cuenta;
  }

  async crearCuenta(cuenta: InsertPlanCuenta): Promise<PlanCuenta> {
    const [nuevaCuenta] = await db
      .insert(planCuentas)
      .values(cuenta)
      .returning();
    return nuevaCuenta;
  }

  // Operaciones de períodos contables
  async getPeriodos(): Promise<PeriodoContable[]> {
    return await db
      .select()
      .from(periodosContables)
      .orderBy(desc(periodosContables.ano), desc(periodosContables.mes));
  }

  async getPeriodoActual(): Promise<PeriodoContable | undefined> {
    const [periodo] = await db
      .select()
      .from(periodosContables)
      .where(eq(periodosContables.estado_periodo, 'abierto'))
      .orderBy(desc(periodosContables.ano), desc(periodosContables.mes))
      .limit(1);
    return periodo;
  }

  // Operaciones de movimientos contables
  async getMovimientos(periodoId?: string): Promise<MovimientoContable[]> {
    const whereCondition = periodoId ? eq(movimientosContables.periodo_id, periodoId) : undefined;
    return await db.select().from(movimientosContables)
      .where(whereCondition)
      .orderBy(desc(movimientosContables.fecha));
  }

  async crearMovimiento(datosMovimiento: any): Promise<MovimientoContable> {
    const [movimiento] = await db
      .insert(movimientosContables)
      .values(datosMovimiento)
      .returning();
    return movimiento;
  }

  // Estadísticas del dashboard
  async getEstadisticasDashboard(): Promise<any> {
    // Contar total de unidades
    const [totalUnidades] = await db
      .select({ count: count() })
      .from(unidades)
      .where(eq(unidades.activo, true));

    // Contar total de terceros por tipo
    const tercerosActivos = await db
      .select({ 
        tipo: terceros.tipoTercero,
        count: count()
      })
      .from(terceros)
      .where(eq(terceros.activo, true))
      .groupBy(terceros.tipoTercero);

    // Obtener período actual
    const periodoActual = await this.getPeriodoActual();

    // Calcular totales financieros simulados (en una implementación real, estos vendrían de cálculos contables)
    return {
      totalUnidades: totalUnidades.count,
      ingresosMes: 45200000, // Este sería calculado desde los movimientos contables
      carteraPendiente: 8700000,
      reservasActivas: 28,
      tercerosActivos,
      periodoActual,
      transaccionesRecientes: [
        {
          tipo: 'ingreso',
          concepto: 'Pago administración',
          valor: 850000,
          fecha: new Date(),
          tercero: 'María González'
        },
        {
          tipo: 'egreso',
          concepto: 'Mantenimiento ascensor',
          valor: 1200000,
          fecha: new Date(Date.now() - 86400000),
          tercero: 'Elevadores Express'
        }
      ]
    };
  }

  // Método para validar contraseña
  async validarContrasena(email: string, password: string): Promise<Usuario | null> {
    const usuario = await this.getUsuarioPorEmail(email);
    if (!usuario) return null;
    
    const esValida = await bcrypt.compare(password, usuario.password);
    return esValida ? usuario : null;
  }
}

export const storage = new DatabaseStorage();
