import React from "react";
import { SidebarNew } from "@/components/layout/sidebar-new";
import { TopNavigation } from "@/components/layout/top-navigation";

const Reportes: React.FC = () => {
  return (
    <div className="flex h-screen">
      <SidebarNew />
      <div className="flex-1 flex flex-col">
        <TopNavigation title="Reportes" />
        <main className="flex-1 p-8 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Reportes</h1>
          <div className="bg-white rounded shadow p-6">
            <p className="text-gray-700">Aquí podrás consultar y descargar los reportes contables y financieros.</p>
            {/* Agrega aquí la UI de reportes según necesidades futuras */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reportes;
