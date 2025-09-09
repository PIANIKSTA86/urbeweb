

import { SidebarNew } from "@/components/layout/sidebar-new";
import { TopNavigation } from "@/components/layout/top-navigation";
import ExogenaMainPage from "@/components/exogena/ExogenaMainPage";

export default function ExogenaPage() {
  return (
    <div className="flex h-screen">
      <SidebarNew />
      <div className="flex-1 flex flex-col">
        <TopNavigation title="Exógena" />
        <main className="flex-1 p-8 overflow-auto">
          <ExogenaMainPage />
        </main>
      </div>
    </div>
  );
}
