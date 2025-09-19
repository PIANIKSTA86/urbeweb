/* global setTimeout */
// Adaptación inicial basada en ExogenaReportForm de atria pro
import React, { useState } from 'react';

const ExogenaReportForm: React.FC = () => {
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Generar Reporte Exógena</h2>
      <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
        {generating ? 'Generando...' : 'Generar Reporte'}
      </button>
      {success && <div className="mt-4 text-green-600">¡Reporte generado exitosamente!</div>}
    </div>
  );
};

export default ExogenaReportForm;
