// Adaptación inicial basada en ExogenaConceptForm de atria pro
import React from 'react';

const ExogenaConceptForm: React.FC = () => {
  // Simulación de conceptos
  const conceptos = [
    { id: 1, nombre: 'Concepto 1', descripcion: 'Descripción 1' },
    { id: 2, nombre: 'Concepto 2', descripcion: 'Descripción 2' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Conceptos Exógena</h2>
      <ul className="list-disc pl-6">
        {conceptos.map(c => (
          <li key={c.id}>{c.nombre}: {c.descripcion}</li>
        ))}
      </ul>
    </div>
  );
};

export default ExogenaConceptForm;
