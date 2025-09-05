import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";

interface TopNavigationProps {
  title?: string;
}

export function TopNavigation({ title = "Dashboard Principal" }: TopNavigationProps) {
  return (
    <header className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
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
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Edificio Torre del Parque</span>
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-secondary-foreground text-sm">🏢</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
