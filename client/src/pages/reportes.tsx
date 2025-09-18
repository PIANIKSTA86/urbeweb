import React from "react";
import { SidebarNew } from "@/components/layout/sidebar-new";
import { TopNavigation } from "@/components/layout/top-navigation";
import ReportesSection from "@/components/reportes/ReportesSection";

const Reportes: React.FC = () => {
  return (
    <div className="flex h-screen">
      <SidebarNew />
      <div className="flex-1 flex flex-col">
        <TopNavigation title="Reportes" />
        <main className="flex-1 p-8 overflow-auto">
          {/*<h1 className="text-2xl font-bold mb-4">Reportes1</h1>*/}
          <ReportesSection />
        </main>
      </div>
    </div>
  );
};

export default Reportes;
