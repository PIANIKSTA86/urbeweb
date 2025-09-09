import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Calculator, FileText, DollarSign, Briefcase, Building, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

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
  const { logout } = useAuth();

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  return (
  <div className={`bg-gradient-to-b from-blue-50 via-white to-purple-50 border-r border-sidebar-border shadow-lg transition-all duration-300 ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}> 
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
              <Building className="text-blue-600 text-3xl mr-3 drop-shadow-lg animate-pulse" />
              {!collapsed && (
                <span className="text-2xl font-extrabold text-blue-700 tracking-wide drop-shadow">URBE</span>
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
          {navigationItems.map((item, idx) => {
            const isActive = location === item.path;
            const pastelColors = [
              'from-blue-100 to-blue-50',
              'from-red-100 to-red-50',
              'from-green-100 to-green-50',
              'from-yellow-100 to-yellow-50',
              'from-purple-100 to-purple-50',
              'from-orange-100 to-orange-50',
            ];
            const pastel = pastelColors[idx % pastelColors.length];
            return (
              <Button
                key={item.path}
                variant="ghost"
                className={`w-full justify-start rounded-lg transition-all duration-200 ${isActive ? `bg-gradient-to-r ${pastel} text-blue-900 shadow-md` : 'text-sidebar-foreground hover:bg-blue-50'} hover:scale-105`}
                onClick={() => handleNavigation(item.path)}
                data-testid={item.testId}
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0 opacity-80" />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            );
          })}
          {/* Botón de logout */}
          <Button
            variant="ghost"
            className="w-full justify-start rounded-lg transition-all duration-200 text-sidebar-foreground hover:bg-red-100 hover:text-red-700 mt-8"
            onClick={logout}
            data-testid="nav-logout"
          >
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0 opacity-80" />
            {!collapsed && <span>Cerrar sesión</span>}
          </Button>
        </nav>
      </div>
    </div>
  );
}
