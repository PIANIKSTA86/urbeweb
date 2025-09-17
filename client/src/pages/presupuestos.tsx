

import { SidebarNew } from "@/components/layout/sidebar-new";
import { TopNavigation } from "@/components/layout/top-navigation";
import { useState } from "react";
import { FileText, BarChart2, FileBarChart2 } from "lucide-react";
import PartidasPresupuestalesConfig from "@/components/ui/PartidasPresupuestalesConfig";

const tabs = [
  { label: "Presupuestos", key: "presupuestos", icon: FileText },
  { label: "Ejecución", key: "ejecucion", icon: BarChart2 },
  { label: "Reportes", key: "reportes", icon: FileBarChart2 },
];

export default function PresupuestosPage() {
  const [activeTab, setActiveTab] = useState("presupuestos");
  return (
    <div className="flex h-screen">
      <SidebarNew />
      <div className="flex-1 flex flex-col">
        <TopNavigation title="Presupuestos" />
        <main className="flex-1 p-8 overflow-auto">
          {/*<h1 className="text-2xl font-bold mb-4">Presupuestos</h1>*/}
          <div className="mb-6 flex gap-4 border-b pb-2 justify-start">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  className={`px-4 py-2 rounded-t font-semibold flex items-center gap-2 ${activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </div>
          {activeTab === "presupuestos" && (
            <section>
              <h2 className="text-xl font-bold mb-2">Gestión de Presupuestos</h2>
              <PartidasPresupuestalesConfig />
            </section>
          )}
          {activeTab === "ejecucion" && (
            <section>
              <h2 className="text-xl font-bold mb-2">Ejecución Presupuestal</h2>
              <p>Aquí se mostrará la integración con movimientos contables, comparación real vs. presupuestado y reportes de desviaciones.</p>
            </section>
          )}
          {activeTab === "reportes" && (
            <section>
              <h2 className="text-xl font-bold mb-2">Reportes de Presupuesto</h2>
              <p>Aquí se mostrarán reportes imprimibles, ejecución comparada, cuotas de administración y proyección de caja.</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
