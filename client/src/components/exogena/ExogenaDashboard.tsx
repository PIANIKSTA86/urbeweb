/* global setTimeout */
// Adaptación inicial basada en ExogenaDashboard de atria pro
import React, { useState, useEffect } from "react";
// Aquí puedes importar hooks y servicios reales cuando estén disponibles

const ExogenaDashboard: React.FC = () => {
  // Estado simulado para ejemplo
  const [loading, setLoading] = useState(false);
  const [formats, setFormats] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setFormats([{ id: 1, nombre: 'Formato 1001' }]);
      setReports([{ id: 1, nombre: 'Reporte 2024' }]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <div>Cargando dashboard exógena...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Dashboard Exógena</h2>
      <div className="mb-4">Formatos disponibles: {formats.length}</div>
      <div>Reportes generados: {reports.length}</div>
    </div>
  );
};

export default ExogenaDashboard;
