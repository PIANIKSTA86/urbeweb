
import React, { useContext } from "react";
import { SidebarContext } from "./layout/sidebarContext";
import { Menu } from "lucide-react";
import { ReactNode } from "react";

interface TablerLayoutProps {
  children: ReactNode;
}

export default function TablerLayout({ children }: TablerLayoutProps) {
  const { collapsed, setCollapsed } = useContext(SidebarContext);
  return (
    <div className="flex">
      <div className={`flex-1 min-h-screen transition-all duration-300 ${collapsed ? 'ml-0' : 'ml-64'}`}>
        <main className="w-full px-0 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
