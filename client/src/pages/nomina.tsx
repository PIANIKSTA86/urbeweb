import { SidebarNew } from "@/components/layout/sidebar-new";
import { useState } from "react";

const tabs = [
  { label: "CRUD Gestión de Empleados", key: "empleados" },
  { label: "Configuración", key: "config" },
];

export default function NominaPage() {
  const [activeTab, setActiveTab] = useState("empleados");
  return (
    <div className="flex">
      <SidebarNew />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Nómina</h1>
        <div className="mb-6 flex gap-4 border-b pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`px-4 py-2 rounded-t font-semibold ${activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
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
  );
}
