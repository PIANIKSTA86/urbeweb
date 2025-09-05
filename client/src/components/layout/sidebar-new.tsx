import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Calculator, FileText, DollarSign, Briefcase, Building, Settings } from "lucide-react";

const navigationItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard", testId: "nav-dashboard" },
  { path: "/terceros", icon: Users, label: "Terceros", testId: "nav-terceros" },
  { path: "/contabilidad", icon: Calculator, label: "Contabilidad", testId: "nav-contabilidad" },
  { path: "/facturacion", icon: FileText, label: "Facturación", testId: "nav-facturacion" },
  { path: "/tesoreria", icon: DollarSign, label: "Tesorería", testId: "nav-tesoreria" },
  { path: "/nomina", icon: Briefcase, label: "Nómina", testId: "nav-nomina" },
  { path: "/presupuestos", icon: Calculator, label: "Presupuestos", testId: "nav-presupuestos" },
  { path: "/exogena", icon: FileText, label: "Exógena", testId: "nav-exogena" },
  { path: "/gestion-ph", icon: Building, label: "Gestión PH", testId: "nav-gestion-ph" },
  { path: "/configuracion", icon: Settings, label: "Configuración", testId: "nav-configuracion" },
];

export function SidebarNew() {
  const [collapsed, setCollapsed] = useState(false);
  const [location, setLocation] = useLocation();

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  return (
    <div className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}> 
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Building className="text-sidebar-primary text-2xl mr-3" />
            {!collapsed && (
              <span className="text-xl font-bold text-sidebar-primary">URBE</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1"
            data-testid="button-toggle-sidebar"
          >
            {collapsed ? <span>&#8250;</span> : <span>&#8249;</span>}
          </Button>
        </div>
        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Button
                key={item.path}
                variant="ghost"
                className={`w-full justify-start ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'}`}
                onClick={() => handleNavigation(item.path)}
                data-testid={item.testId}
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
