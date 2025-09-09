// Adaptación inicial basada en ExogenaFormatList de atria pro
import React from 'react';

const ExogenaFormatList: React.FC = () => {
  // Simulación de formatos DIAN
  const formatos = [
    { id: 1, codigo: '1001', nombre: 'Pagos o abonos en cuenta' },
    { id: 2, codigo: '1002', nombre: 'Retenciones practicadas' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Formatos DIAN</h2>
      <ul className="list-disc pl-6">
        {formatos.map(f => (
          <li key={f.id}>{f.codigo} - {f.nombre}</li>
        ))}
      </ul>
    </div>
  );
};

export default ExogenaFormatList;
