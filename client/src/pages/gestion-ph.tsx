

import { SidebarNew } from "@/components/layout/sidebar-new";
import { TopNavigation } from "@/components/layout/top-navigation";
import { useState } from "react";
import { Calendar, Users, FileText } from "lucide-react";

const tabs = [
  { label: "Calendario", key: "calendario", icon: Calendar },
  { label: "Reserva de Zonas Comunes", key: "zonas", icon: Users },
  { label: "Gestión Documental", key: "documental", icon: FileText },
];

export default function GestionPHPage() {
  const [activeTab, setActiveTab] = useState("calendario");
  return (
    <div className="flex h-screen">
      <SidebarNew />
      <div className="flex-1 flex flex-col">
        <TopNavigation title="Gestión PH" />
        <main className="flex-1 p-8 overflow-auto">
          {/*<h1 className="text-2xl font-bold mb-4">Gestión PH</h1>*/}
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
          {activeTab === "calendario" && (
            <section>
              <h2 className="text-xl font-bold mb-2">Calendario</h2>
              <p>Aquí irá el calendario de actividades y eventos.</p>
            </section>
          )}
          {activeTab === "zonas" && (
            <section>
              <h2 className="text-xl font-bold mb-2">Reserva de Zonas Comunes</h2>
              <p>Aquí irá la gestión de reservas de zonas comunes.</p>
            </section>
          )}
        {activeTab === "documental" && (
          <section>
            <h2 className="text-xl font-bold mb-2">CRUD Gestión Documental</h2>
            <p>Aquí irá la gestión documental (crear, editar, eliminar, listar documentos).</p>
          </section>
        )}
        </main>
      </div>
    </div>
  );
}
