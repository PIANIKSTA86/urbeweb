import React from "react";
import { ReporteDef } from "./reportesData";

interface Props {
  reporte: ReporteDef;
  onClose: () => void;
}

const ReporteFiltroModal: React.FC<Props> = ({ reporte, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded shadow-lg p-8 w-full max-w-md relative">
      <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>×</button>
      <h2 className="text-xl font-bold mb-4">{reporte.nombre}</h2>
      <p className="mb-4 text-gray-700">{reporte.descripcion}</p>
      {/* Aquí van los filtros específicos del reporte */}
      <div className="mb-4">(Filtros por implementar)</div>
      <button className="bg-primary text-primary-foreground px-4 py-2 rounded w-full">Generar reporte</button>
    </div>
  </div>
);

export default ReporteFiltroModal;
