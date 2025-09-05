import { Card, CardContent } from "@/components/ui/card";
import { Building, DollarSign, AlertTriangle, Calendar } from "lucide-react";

interface StatsCardsProps {
  data?: {
    totalUnidades: number;
    ingresosMes: number;
    carteraPendiente: number;
    reservasActivas: number;
  };
}

export function StatsCards({ data }: StatsCardsProps) {
  const stats = [
    {
      title: "Total Unidades",
      value: data?.totalUnidades || 0,
      change: "+2.5% este mes",
      icon: Building,
      color: "blue",
      testId: "stat-total-units"
    },
    {
      title: "Ingresos del Mes",
      value: `$${(data?.ingresosMes || 0).toLocaleString()}`,
      change: "+8.3% vs anterior",
      icon: DollarSign,
      color: "green",
      testId: "stat-monthly-income"
    },
    {
      title: "Cartera Pendiente",
      value: `$${(data?.carteraPendiente || 0).toLocaleString()}`,
      change: "-12% este mes",
      icon: AlertTriangle,
      color: "red",
      isNegative: true,
      testId: "stat-pending-portfolio"
    },
    {
      title: "Reservas Activas",
      value: data?.reservasActivas || 0,
      change: "+15% esta semana",
      icon: Calendar,
      color: "yellow",
      testId: "stat-active-reservations"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} data-testid={stat.testId}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className={`text-sm ${stat.isNegative ? 'text-destructive' : 'text-secondary'}`}>
                  {stat.change}
                </p>
              </div>
              <div className={`bg-${stat.color}-100 p-3 rounded-full`}>
                <stat.icon className={`text-${stat.color}-600 text-xl`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
