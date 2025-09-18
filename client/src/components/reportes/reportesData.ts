export interface ReporteDef {
  key: string;
  nombre: string;
  descripcion: string;
}

export interface CategoriaReportes {
  categoria: string;
  reportes: ReporteDef[];
}

const reportesData: CategoriaReportes[] = [
  {
    categoria: "Financieros",
    reportes: [
      { key: "situacion-financiera", nombre: "Estado de Situación Financiera", descripcion: "Balance general de activos, pasivos y patrimonio." },
      { key: "resultados", nombre: "Estado de Resultados", descripcion: "Ingresos, gastos y utilidad del periodo." },
      { key: "balance-prueba", nombre: "Balance de Prueba", descripcion: "Verificación de saldos contables." },
      { key: "flujo-efectivo", nombre: "Flujo de Efectivo", descripcion: "Entradas y salidas de efectivo." },
      { key: "cambios-patrimonio", nombre: "Estado de Cambios en el Patrimonio", descripcion: "Variaciones en el patrimonio." },
    ]
  },
  {
    categoria: "Contables",
    reportes: [
      { key: "libro-diario", nombre: "Libro Diario", descripcion: "Registro cronológico de todas las transacciones." },
      { key: "libro-mayor", nombre: "Libro Mayor", descripcion: "Saldos y movimientos acumulados por cuenta." },
      { key: "auxiliares-cuentas", nombre: "Libro Auxiliar", descripcion: "Detalle de movimientos por cuenta y/o tercero." },
      { key: "conciliacion-bancaria", nombre: "Conciliación Bancaria", descripcion: "Conciliación de movimientos bancarios." },
      { key: "comprobantes-contables", nombre: "Listado de Comprobantes Contables", descripcion: "Listado de todos los comprobantes generados." },
    ]
  },
  {
    categoria: "Tributarios",
    reportes: [
      { key: "retenciones", nombre: "Retenciones practicadas y sufridas", descripcion: "Detalle de retenciones aplicadas y recibidas." },
      { key: "iva", nombre: "Declaración y control de IVA generado y descontable", descripcion: "Control de IVA generado y descontable." },
      { key: "certificados-retenciones", nombre: "Certificados de Ingresos y Retenciones", descripcion: "Certificados emitidos a terceros." },
    ]
  },
  {
    categoria: "Cartera y Tesorería",
    reportes: [
      { key: "cuentas-cobrar", nombre: "Cuentas por Cobrar", descripcion: "Clientes o propietarios con saldos pendientes." },
      { key: "cuentas-pagar", nombre: "Cuentas por Pagar", descripcion: "Proveedores con saldos pendientes." },
      { key: "estados-cuenta", nombre: "Estados de Cuenta", descripcion: "Detalle de movimientos y saldos por tercero o cuenta." },
      { key: "conciliacion-bancaria-tes", nombre: "Conciliación bancaria", descripcion: "Conciliación de movimientos bancarios en tesorería." },
      { key: "anticipos", nombre: "Listado de Anticipos", descripcion: "Anticipos recibidos y entregados." },
      { key: "proyeccion-pagos-cobros", nombre: "Proyección de Pagos y Cobros", descripcion: "Pagos y cobros futuros estimados." },
    ]
  },
  {
    categoria: "Nómina",
    reportes: [
      { key: "aportes-seguridad-social", nombre: "Aportes a Seguridad Social y Parafiscales", descripcion: "EPS, ARL, AFP, cajas de compensación." },
      { key: "prestaciones-sociales", nombre: "Prestaciones Sociales", descripcion: "Liquidación y provisión de prestaciones sociales." },
      { key: "provisiones", nombre: "Provisiones realizadas", descripcion: "Detalle de provisiones de nómina." },
    ]
  },
  {
    categoria: "Gestión y Control",
    reportes: [
      { key: "ejecucion-presupuestal", nombre: "Ejecución presupuestal", descripcion: "Seguimiento de ejecución del presupuesto." },
      { key: "centros-costos", nombre: "Centros de Costos", descripcion: "Análisis por centro de costos." },
      { key: "indicadores-financieros", nombre: "Indicadores Financieros", descripcion: "KPIs y métricas clave." },
      { key: "analisis-ia", nombre: "Análisis financiero con IA", descripcion: "Insights automáticos y predicciones." },
      { key: "terceros", nombre: "Terceros", descripcion: "Reporte de terceros y relaciones." },
      { key: "actividades-pendientes", nombre: "Actividades pendientes", descripcion: "Tareas y actividades por realizar." },
      { key: "estados-cuenta", nombre: "Estados de Cuenta", descripcion: "Detalle de movimientos y saldos por tercero o cuenta." },
    ]
  }
];

export default reportesData;
