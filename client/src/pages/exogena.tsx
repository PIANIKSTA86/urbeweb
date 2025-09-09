
import { SidebarNew } from "@/components/layout/sidebar-new";
import ExogenaMainPage from "@/components/exogena/ExogenaMainPage";

export default function ExogenaPage() {
  return (
    <div className="flex">
      <SidebarNew />
      <main className="flex-1 p-8">
        <ExogenaMainPage />
      </main>
    </div>
  );
}
