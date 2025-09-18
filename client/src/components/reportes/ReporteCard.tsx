import React from "react";
import { FileText } from "lucide-react";
import { ReporteDef } from "./reportesData";

interface Props {
  reporte: ReporteDef;
  onClick: () => void;
}

const ReporteCard: React.FC<Props> = ({ reporte, onClick }) => (
  <div className="bg-white rounded shadow p-6 flex flex-col items-start hover:shadow-lg transition cursor-pointer" onClick={onClick}>
    <FileText className="text-blue-600 mb-2" />
    <h3 className="font-bold text-lg mb-1">{reporte.nombre}</h3>
    <p className="text-gray-600 text-sm mb-2">{reporte.descripcion}</p>
    <button className="mt-auto bg-primary text-primary-foreground px-4 py-2 rounded">Generar</button>
  </div>
);

export default ReporteCard;
