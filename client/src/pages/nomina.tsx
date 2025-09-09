

import { SidebarNew } from "@/components/layout/sidebar-new";
import { TopNavigation } from "@/components/layout/top-navigation";
import { useState } from "react";
import { Users, Settings } from "lucide-react";

const tabs = [
  { label: "Empleados", key: "empleados", icon: Users },
  { label: "Configuración", key: "config", icon: Settings },
];

export default function NominaPage() {
  const [activeTab, setActiveTab] = useState("empleados");
  return (
    <div className="flex h-screen">
      <SidebarNew />
      <div className="flex-1 flex flex-col">
        <TopNavigation title="Nómina" />
        <main className="flex-1 p-8 overflow-auto">
          {/*<h1 className="text-2xl font-bold mb-4">Nómina</h1> */}
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
          {activeTab === "empleados" && (
            <section>
              <h2 className="text-xl font-bold mb-2">CRUD Gestión de Empleados</h2>
              <p>Aquí irá la gestión de empleados (crear, editar, eliminar, listar).</p>
            </section>
          )}
          {activeTab === "config" && (
            <section>
              <h2 className="text-xl font-bold mb-2">Configuración</h2>
            <p>Aquí irá la configuración de nómina.</p>
          </section>
        )}
        </main>
      </div>
    </div>
  );
}
