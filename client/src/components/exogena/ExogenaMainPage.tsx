// Adaptación basada en ExogenaMainPage de atria pro
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, FileSpreadsheet, ListChecks, Settings } from "lucide-react";
// Importar los subcomponentes necesarios (pueden ser placeholders inicialmente)

const ExogenaFormatList = () => <div>Lista de formatos DIAN (en desarrollo)</div>;
const ExogenaParametersList = () => <div>Parámetros tributarios (en desarrollo)</div>;
const ExogenaReportForm = () => <div>Formulario de generación de reporte (en desarrollo)</div>;
const ExogenaConceptForm = () => <div>Conceptos y mapeo (en desarrollo)</div>;
const ExogenaAccountsMappingForm = () => <div>Mapeo de cuentas (en desarrollo)</div>;

const ExogenaMainPage: React.FC = () => {
  // Aquí podrías obtener la propiedad seleccionada desde contexto global si aplica
  // const { selectedProperty } = usePropertyContext();
  // if (!selectedProperty) return <div>Seleccione una propiedad para continuar</div>;

  return (
    <div className="container mx-auto py-6">
     {/*} <h1 className="text-3xl font-bold mb-4">Información Exógena DIAN</h1>*/}
      <Tabs defaultValue="reportes" className="w-full">
        <TabsList className="mb-6 flex gap-4 border-b pb-2 bg-transparent p-0 justify-start">
          <TabsTrigger value="reportes" className="px-4 py-2 rounded-t font-semibold flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground">
            <FileText className="w-4 h-4" /> Generar Reporte
          </TabsTrigger>
          <TabsTrigger value="formatos" className="px-4 py-2 rounded-t font-semibold flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground">
            <FileSpreadsheet className="w-4 h-4" /> Formatos DIAN
          </TabsTrigger>
          <TabsTrigger value="conceptos" className="px-4 py-2 rounded-t font-semibold flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground">
            <ListChecks className="w-4 h-4" /> Conceptos y Mapeo
          </TabsTrigger>
          <TabsTrigger value="parametros" className="px-4 py-2 rounded-t font-semibold flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground">
            <Settings className="w-4 h-4" /> Parámetros Tributarios
          </TabsTrigger>
        </TabsList>
        <TabsContent value="reportes">
          <ExogenaReportForm />
        </TabsContent>
        <TabsContent value="formatos">
          <ExogenaFormatList />
        </TabsContent>
        <TabsContent value="conceptos">
          <ExogenaConceptForm />
          <ExogenaAccountsMappingForm />
        </TabsContent>
        <TabsContent value="parametros">
          <ExogenaParametersList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExogenaMainPage;
