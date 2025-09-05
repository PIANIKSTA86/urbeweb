import { SidebarNew } from "@/components/layout/sidebar-new";
import { useState } from "react";

const tabs = [
  { label: "Gestión de Presupuestos", key: "gestion" },
  { label: "Configuración de Presupuestos", key: "config" },
];

export default function PresupuestosPage() {
  const [activeTab, setActiveTab] = useState("gestion");
  return (
    <div className="flex">
      <SidebarNew />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Presupuestos</h1>
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
        {activeTab === "gestion" && (
          <section>
            <h2 className="text-xl font-bold mb-2">Gestión de Presupuestos</h2>
            <p>Aquí irá la gestión y control de presupuestos.</p>
          </section>
        )}
        {activeTab === "config" && (
          <section>
            <h2 className="text-xl font-bold mb-2">Configuración de Presupuestos</h2>
            <p>Aquí irá la configuración de presupuestos.</p>
          </section>
        )}
      </main>
    </div>
  );
}
