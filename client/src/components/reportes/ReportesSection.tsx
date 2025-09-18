import React, { useState } from "react";
import ReportesTabs from "./ReportesTabs";
import ReporteFiltroModal from "./ReporteFiltroModal";
import reportesData, { ReporteCategoria, ReporteDef } from "./reportesData";
import ReporteCard from "./ReporteCard";

const ReportesSection: React.FC = () => {
  const [categoria, setCategoria] = useState<ReporteCategoria>(reportesData[0].categoria);
  const [modalReporte, setModalReporte] = useState<ReporteDef | null>(null);

  const categoriaActual = reportesData.find(c => c.categoria === categoria);

  return (
    <div>
      <ReportesTabs
        categorias={reportesData.map(c => c.categoria)}
        active={categoria}
        onChange={setCategoria}
      />
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
        {categoriaActual?.reportes.map(reporte => (
          <ReporteCard key={reporte.key} reporte={reporte} onClick={() => setModalReporte(reporte)} />
        ))}
      </div>
      {modalReporte && (
        <ReporteFiltroModal reporte={modalReporte} onClose={() => setModalReporte(null)} />
      )}
    </div>
  );
};

export default ReportesSection;
