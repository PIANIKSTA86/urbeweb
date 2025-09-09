// Adaptación inicial basada en ExogenaParametersList de atria pro
import React from 'react';

const ExogenaParametersList: React.FC = () => {
  // Simulación de parámetros tributarios
  const parametros = [
    { id: 1, nombre: 'Año gravable', valor: '2024' },
    { id: 2, nombre: 'Responsable', valor: 'Contador' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Parámetros Tributarios</h2>
      <ul className="list-disc pl-6">
        {parametros.map(p => (
          <li key={p.id}>{p.nombre}: {p.valor}</li>
        ))}
      </ul>
    </div>
  );
};

export default ExogenaParametersList;
