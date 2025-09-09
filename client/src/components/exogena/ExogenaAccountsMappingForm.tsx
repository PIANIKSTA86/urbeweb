// Adaptación inicial basada en ExogenaAccountsMappingForm de atria pro
import React from 'react';

const ExogenaAccountsMappingForm: React.FC = () => {
  // Simulación de mapeo de cuentas
  const mapeos = [
    { id: 1, cuenta: '110505', concepto: 'Caja' },
    { id: 2, cuenta: '130505', concepto: 'Clientes' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Mapeo de Cuentas</h2>
      <ul className="list-disc pl-6">
        {mapeos.map(m => (
          <li key={m.id}>{m.cuenta}: {m.concepto}</li>
        ))}
      </ul>
    </div>
  );
};

export default ExogenaAccountsMappingForm;
