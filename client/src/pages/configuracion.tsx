import { SidebarNew } from "@/components/layout/sidebar-new";
import { useState } from "react";

const tabs = [
  { label: "Información de Empresa", key: "empresa" },
  { label: "Gestión de Usuarios y Perfiles", key: "usuarios" },
  { label: "Auditoría de Usuarios", key: "auditoria" },
];

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState("empresa");
  return (
    <div className="flex">
      <SidebarNew />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Configuración</h1>
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
        {activeTab === "empresa" && (
          <section>
            <h2 className="text-xl font-bold mb-2">Información de Empresa</h2>
            <p>Aquí irá la información de la empresa.</p>
          </section>
        )}
        {activeTab === "usuarios" && (
          <section>
            <h2 className="text-xl font-bold mb-2">Gestión de Usuarios y Perfiles</h2>
            <p>Aquí irá la gestión de usuarios y perfiles.</p>
          </section>
        )}
        {activeTab === "auditoria" && (
          <section>
            <h2 className="text-xl font-bold mb-2">Auditoría de Usuarios</h2>
            <p>Aquí irá la auditoría de usuarios.</p>
          </section>
        )}
      </main>
    </div>
  );
}
