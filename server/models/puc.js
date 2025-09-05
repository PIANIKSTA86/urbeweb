// Modelo para el Plan Único de Cuentas (PUC)
// Este archivo define la estructura de las cuentas contables

const cuentasPUC = [
  // Ejemplo de cuenta contable
  {
    id: 1,
    codigo: '1001',
    clase: 'Activo',
    grupo: 'Caja',
    cuenta: 'Caja General',
    subcuenta: '',
    auxiliar: '',
    nombre: 'Caja General',
    nivel: 1,
    estado: 'activo',
    esDebito: true,
    nombreClase: 'Activo',
    registraTercero: false
  }
  // Se pueden agregar más cuentas aquí
];

export default cuentasPUC;
