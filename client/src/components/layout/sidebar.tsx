// ...existing code...
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  LayoutDashboard, 
  Users, 
  Home, 
  Calculator, 
  FileText, 
  Calendar, 
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const navigationItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard", testId: "nav-dashboard" },
  { path: "/terceros", icon: Users, label: "Terceros", testId: "nav-terceros" },
  { path: "/unidades", icon: Home, label: "Unidades", testId: "nav-unidades" },
  { path: "/contabilidad", icon: Calculator, label: "Contabilidad", testId: "nav-contabilidad" },
  { path: "/facturacion", icon: FileText, label: "Facturación", testId: "nav-facturacion" },
  { path: "/reservas", icon: Calendar, label: "Reservas", testId: "nav-reservas" },
  { path: "/reportes", icon: BarChart3, label: "Reportes", testId: "nav-reportes" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  return (
    <div className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
      collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'
    }`}>
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
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
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
                className={`w-full justify-start ${
                  isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
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
      
      {/* User Profile & Logout */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="border-t border-sidebar-border pt-4">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-sidebar-primary-foreground text-sm font-semibold">
                {(user as any)?.nombre?.[0]}{(user as any)?.apellido?.[0]}
              </span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-sidebar-foreground truncate">
                  {(user as any)?.nombre} {(user as any)?.apellido}
                </div>
                <div className="text-xs text-sidebar-foreground/70 truncate">
                  {(user as any)?.rol}
                </div>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:text-sidebar-foreground/80"
            onClick={logout}
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
            {!collapsed && <span>Cerrar Sesión</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}
