import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Terceros from "@/pages/terceros";
import Contabilidad from "@/pages/contabilidad";
import Facturacion from "@/pages/facturacion";
import Tesoreria from "@/pages/tesoreria";
import Nomina from "@/pages/nomina";
import GestionPH from "@/pages/gestion-ph";
import Configuracion from "@/pages/configuracion";
import Exogena from "@/pages/exogena";
import Presupuestos from "@/pages/presupuestos";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Si está cargando, mostrar la página de landing
  if (isLoading) {
    return <Landing />;
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
  <Route path="/terceros" component={Terceros} />
  <Route path="/contabilidad" component={Contabilidad} />
  <Route path="/facturacion" component={Facturacion} />
  <Route path="/tesoreria" component={Tesoreria} />
  <Route path="/nomina" component={Nomina} />
  <Route path="/presupuestos" component={Presupuestos} />
  <Route path="/exogena" component={Exogena} />
  <Route path="/gestion-ph" component={GestionPH} />
  <Route path="/configuracion" component={Configuracion} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
