import { SidebarNew } from "@/components/layout/sidebar-new";
import { TopNavigation } from "@/components/layout/top-navigation";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Calendar, DollarSign } from "lucide-react";

export default function Dashboard() {
  const { data: estadisticas, isLoading } = useQuery({
    queryKey: ["/api/dashboard/estadisticas"],
  });

  if (isLoading) {
    return (
      <div className="flex h-screen">
  <SidebarNew />
        <div className="flex-1 flex flex-col">
          <TopNavigation />
          <main className="flex-1 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
  <SidebarNew />
      <div className="flex-1 flex flex-col">
        <TopNavigation title="Dashboard Principal" />
        <main className="flex-1 p-6 overflow-auto">
          <StatsCards data={estadisticas as any} />
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ingresos Mensuales</CardTitle>
                <select className="text-sm border border-border rounded px-3 py-1 bg-background">
                  <option>Últimos 6 meses</option>
                  <option>Último año</option>
                </select>
              </CardHeader>
              <CardContent>
                <div className="chart-container rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-chart-1 mx-auto mb-4" />
                    <p className="text-muted-foreground">Gráfico de Ingresos Mensuales</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Aquí se mostraría un gráfico de líneas con los ingresos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Distribución de Gastos</CardTitle>
                <button className="text-sm text-primary hover:text-primary/80">
                  Ver detalles
                </button>
              </CardHeader>
              <CardContent>
                <div className="chart-container rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingDown className="h-16 w-16 text-chart-2 mx-auto mb-4" />
                    <p className="text-muted-foreground">Gráfico de Distribución de Gastos</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Aquí se mostraría un gráfico circular
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <QuickActions />
            
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Transacciones Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(estadisticas as any)?.transaccionesRecientes?.map((transaccion: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-3 ${
                          transaccion.tipo === 'ingreso' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <TrendingUp className={`text-sm ${
                            transaccion.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        </div>
                        <div>
                          <p className="text-foreground font-medium">{transaccion.concepto}</p>
                          <p className="text-muted-foreground text-sm">{transaccion.tercero}</p>
                        </div>
                      </div>
                      <span className={`font-semibold ${
                        transaccion.tipo === 'ingreso' ? 'text-secondary' : 'text-destructive'
                      }`}>
                        {transaccion.tipo === 'ingreso' ? '+' : '-'}${transaccion.valor.toLocaleString()}
                      </span>
                    </div>
                  )) || (
                    <div className="text-center text-muted-foreground py-8">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay transacciones recientes</p>
                    </div>
                  )}
                </div>
                
                <button 
                  className="w-full mt-4 text-primary hover:text-primary/80 text-sm font-medium"
                  data-testid="button-view-all-transactions"
                >
                  Ver todas las transacciones
                </button>
              </CardContent>
            </Card>
            
            {/* Upcoming Reservations */}
            <Card>
              <CardHeader>
                <CardTitle>Próximas Reservas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { espacio: "Piscina", fecha: "Hoy 2:00 PM", usuario: "Familia Pérez", icon: "🏊" },
                    { espacio: "Salón Social", fecha: "Mañana 6:00 PM", usuario: "Ana López", icon: "🏠" },
                    { espacio: "Gimnasio", fecha: "Sábado 9:00 AM", usuario: "Jorge Silva", icon: "💪" }
                  ].map((reserva, index) => (
                    <div key={index} className="flex items-center p-3 border border-border rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <span className="text-sm">{reserva.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground font-medium">{reserva.espacio}</p>
                        <p className="text-muted-foreground text-sm">{reserva.fecha} - {reserva.usuario}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  className="w-full mt-4 text-primary hover:text-primary/80 text-sm font-medium"
                  data-testid="button-view-all-reservations"
                >
                  Ver todas las reservas
                </button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
