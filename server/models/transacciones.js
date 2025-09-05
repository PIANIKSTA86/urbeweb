// Modelo para transacciones contables
// Define la estructura de una transacción contable

const transacciones = [
  // Ejemplo de transacción contable
  {
    id: 1,
    fecha: '2025-08-31',
    descripcion: 'Pago de cuota de administración',
    cuentas: [
      {
        codigo: '1001',
        nombre: 'Caja General',
        debito: 500000,
        credito: 0
      },
      {
        codigo: '4101',
        nombre: 'Ingresos por cuotas',
        debito: 0,
        credito: 500000
      }
    ],
    terceroId: 2,
    documento: 'REC-001',
    estado: 'registrada'
  }
  // Se pueden agregar más transacciones aquí
];

export default transacciones;
