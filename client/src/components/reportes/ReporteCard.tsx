
import React from "react";
import { FileText } from "lucide-react";
import { ReporteDef } from "./reportesData";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  reporte: ReporteDef;
  onClick: () => void;
}


const pastel = "from-blue-100 via-white to-blue-50"; // Puedes personalizar el gradiente

const ReporteCard: React.FC<Props> = ({ reporte, onClick }) => (
  <Card
    className="shadow-lg border-0 cursor-pointer transition-all hover:scale-105 mx-auto"
    style={{ width: 240, height: 180, minWidth: 240, minHeight: 180, maxWidth: 240, maxHeight: 180 }}
    onClick={onClick}
  >
    <CardContent className={`p-4 bg-gradient-to-br ${pastel} rounded-xl flex flex-col h-full`} style={{ height: '100%' }}>
      <div className="flex items-center justify-between w-full mb-1">
        <div className="bg-white/70 p-2 rounded-full shadow-md">
          <FileText className="text-blue-600 text-xl" />
        </div>
      </div>
      <div className="flex-1 w-full">
        <h3 className="font-bold text-base mb-0.5 text-foreground drop-shadow-lg line-clamp-2">{reporte.nombre}</h3>
        <p className="text-muted-foreground text-xs mb-1 line-clamp-2">{reporte.descripcion}</p>
      </div>
      <button className="mt-2 bg-primary text-primary-foreground px-3 py-1.5 rounded shadow hover:bg-primary/90 transition text-xs w-full">Generar</button>
    </CardContent>
  </Card>
);

export default ReporteCard;
