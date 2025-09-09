
import { useState } from "react";
import { SidebarNew } from "@/components/layout/sidebar-new";
import { TopNavigation } from "@/components/layout/top-navigation";
import { TercerosTable } from "@/components/terceros/terceros-table";
import { TerceroForm } from "@/components/terceros/tercero-form";
import { UnidadesTable } from "@/components/terceros/unidades-table";
import { UnidadForm } from "@/components/terceros/unidad-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Plus, Users, Building } from "lucide-react";

export default function Terceros() {

  const [activeTab, setActiveTab] = useState("terceros");
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [showTerceroForm, setShowTerceroForm] = useState(false);
  const [selectedTercero, setSelectedTercero] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [searchUnidades, setSearchUnidades] = useState("");
  const [showUnidadForm, setShowUnidadForm] = useState(false);
  const [selectedUnidad, setSelectedUnidad] = useState<any>(null);
  const [unidadFormMode, setUnidadFormMode] = useState<'create' | 'edit'>('create');

  return (
    <div className="flex h-screen">
      <SidebarNew />
      <div className="flex-1 flex flex-col">
        <TopNavigation title="Terceros" />
        <main className="flex-1 p-8 overflow-auto">
         {/*} <h1 className="text-2xl font-bold mb-4">Gestión de Terceros</h1>
          <p className="text-muted-foreground mb-6">Administra propietarios, inquilinos, proveedores y unidades habitacionales</p> */}
          <div className="mb-6 flex gap-4 border-b pb-2">
            <button
              className={`px-4 py-2 rounded-t font-semibold flex items-center gap-2 ${activeTab === "terceros" ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              onClick={() => setActiveTab("terceros")}
            >
              <Users className="w-4 h-4" /> Terceros
            </button>
          <button
            className={`px-4 py-2 rounded-t font-semibold flex items-center gap-2 ${activeTab === "unidades" ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            onClick={() => setActiveTab("unidades")}
          >
            <Building className="w-4 h-4" /> Unidades
          </button>
        </div>
        {activeTab === "terceros" && (
          <section className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Buscar por nombre, documento o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      data-testid="input-search-terceros"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                      <SelectTrigger className="w-48" data-testid="select-tipo-tercero">
                        <SelectValue placeholder="Tipo de Tercero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los tipos</SelectItem>
                        <SelectItem value="propietario">Propietario</SelectItem>
                        <SelectItem value="inquilino">Inquilino</SelectItem>
                        <SelectItem value="empleado">Empleado</SelectItem>
                        <SelectItem value="proveedor">Proveedor</SelectItem>
                        <SelectItem value="acreedor">Acreedor</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => {
                        setFormMode('create');
                        setSelectedTercero(null);
                        setShowTerceroForm(true);
                      }}
                      data-testid="button-add-tercero"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Tercero
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <TercerosTable 
              searchTerm={searchTerm} 
              tipoFiltro={tipoFiltro}
              onEdit={(tercero) => {
                setFormMode('edit');
                setSelectedTercero(tercero);
                setShowTerceroForm(true);
              }}
            />
          </section>
        )}
        {activeTab === "unidades" && (
          <section className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Buscar por código de unidad..."
                      value={searchUnidades}
                      onChange={(e) => setSearchUnidades(e.target.value)}
                      data-testid="input-search-unidades"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => {
                        setUnidadFormMode('create');
                        setSelectedUnidad(null);
                        setShowUnidadForm(true);
                      }}
                      data-testid="button-add-unidad"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Unidad
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <UnidadesTable 
              searchTerm={searchUnidades}
              onEdit={(unidad) => {
                setUnidadFormMode('edit');
                setSelectedUnidad(unidad);
                setShowUnidadForm(true);
              }}
            />
          </section>
        )}
        <TerceroForm
          isOpen={showTerceroForm}
          onClose={() => {
            setShowTerceroForm(false);
            setSelectedTercero(null);
          }}
          tercero={selectedTercero}
          mode={formMode}
        />
        <UnidadForm
          isOpen={showUnidadForm}
          onClose={() => {
            setShowUnidadForm(false);
            setSelectedUnidad(null);
          }}
          unidad={selectedUnidad}
          mode={unidadFormMode}
        />
        </main>
      </div>
    </div>
  );
}
