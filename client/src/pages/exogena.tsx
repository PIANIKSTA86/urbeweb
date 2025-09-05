import { SidebarNew } from "@/components/layout/sidebar-new";
import { useState } from "react";

const tabs = [
  { label: "Reportes Exógena", key: "reportes" },
  { label: "Configuración Exógena", key: "config" },
];

export default function ExogenaPage() {
  const [activeTab, setActiveTab] = useState("reportes");
  return (
    <div className="flex">
      <SidebarNew />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Exógena</h1>
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
        {activeTab === "reportes" && (
          <section>
            <h2 className="text-xl font-bold mb-2">Reportes Exógena</h2>
            <p>Aquí irá la generación y consulta de reportes exógena tributaria.</p>
          </section>
        )}
        {activeTab === "config" && (
          <section>
            <h2 className="text-xl font-bold mb-2">Configuración Exógena</h2>
            <p>Aquí irá la configuración de parámetros exógena.</p>
          </section>
        )}
      </main>
    </div>
  );
}
