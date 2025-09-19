
import { Button } from "@/components/ui/button";
import { Bell, Menu, User, LogOut, Settings, HelpCircle } from "lucide-react";
import { useContext } from "react";
/* global window */
import { SidebarContext } from "./sidebarContext";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useAuth, User as AuthUser } from "@/hooks/use-auth";

interface TopNavigationProps {
  title?: string;
}

export function TopNavigation({ title = "Dashboard Principal" }: TopNavigationProps) {
  const { collapsed, setCollapsed } = useContext(SidebarContext);
  const { user, logout } = useAuth();
  const typedUser = user as (AuthUser & { foto?: string }) | null;
  return (
    <header className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => setCollapsed(!collapsed)}
            data-testid="button-toggle-sidebar"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 text-muted-foreground hover:text-foreground relative"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full border border-muted-foreground/20 shadow hover:shadow-md focus:ring-2 focus:ring-primary/40">
                {typedUser && typedUser.foto ? (
                  <img src={typedUser.foto} alt="Usuario" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-muted-foreground" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2 flex items-center gap-3">
                {typedUser && typedUser.foto ? (
                  <img src={typedUser.foto} alt="Usuario" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
                <div>
                  <div className="font-semibold text-base leading-tight">{typedUser?.nombre} {typedUser?.apellido}</div>
                  <div className="text-xs text-muted-foreground">{typedUser?.email}</div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = '/perfil'}>
                <User className="w-4 h-4 mr-2" /> Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/soporte'}>
                <HelpCircle className="w-4 h-4 mr-2" /> Soporte
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/configuracion'}>
                <Settings className="w-4 h-4 mr-2" /> Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
