import { createContext, useState } from "react";

export const SidebarContext = createContext({
  collapsed: false,
  setCollapsed: (_: boolean) => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}