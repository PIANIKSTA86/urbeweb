import { SidebarNew } from "@/components/layout/sidebar-new";
import { useState } from "react";

const tabs = [
  { label: "CRUD de Facturas", key: "crud" },
  { label: "Configuración", key: "config" },
];

export default function FacturacionPage() {
  const [activeTab, setActiveTab] = useState("crud");
  return (
    <div className="flex">
      <SidebarNew />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Facturación</h1>
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
        {activeTab === "crud" && (
          <section>
            <h2 className="text-xl font-bold mb-2">CRUD de Facturas</h2>
            <p>Aquí irá la gestión de facturas (crear, editar, eliminar, listar).</p>
          </section>
        )}
        {activeTab === "config" && (
          <section>
            <h2 className="text-xl font-bold mb-2">Configuración</h2>
            <p>Aquí irá la configuración de facturación.</p>
          </section>
        )}
      </main>
    </div>
  );
}
