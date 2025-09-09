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
      pastel: "from-blue-100 to-blue-50",
      testId: "stat-total-units"
    },
    {
      title: "Cartera Pendiente",
      value: `$${(data?.carteraPendiente || 0).toLocaleString()}`,
      change: "-12% este mes",
      icon: AlertTriangle,
      color: "red",
      pastel: "from-red-100 to-red-50",
      isNegative: true,
      testId: "stat-pending-portfolio"
    },
    {
      title: "Ingresos del Mes",
      value: `$${(data?.ingresosMes || 0).toLocaleString()}`,
      change: "+8.3% vs anterior",
      icon: DollarSign,
      color: "green",
      pastel: "from-green-100 to-green-50",
      testId: "stat-monthly-income"
    },
    {
      title: "Reservas Activas",
      value: data?.reservasActivas || 0,
      change: "+15% esta semana",
      icon: Calendar,
      color: "yellow",
      pastel: "from-yellow-100 to-yellow-50",
      testId: "stat-active-reservations"
    },
    {
      title: "Estadística Púrpura",
      value: 42,
      change: "+5% este mes",
      icon: Building,
      color: "purple",
      pastel: "from-purple-100 to-purple-50",
      testId: "stat-purple"
    },
    {
      title: "Estadística Naranja",
      value: 17,
      change: "-3% este mes",
      icon: DollarSign,
      color: "orange",
      pastel: "from-orange-100 to-orange-50",
      testId: "stat-orange"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} data-testid={stat.testId} className="shadow-lg border-0">
          <CardContent className={`p-6 bg-gradient-to-br ${stat.pastel} rounded-xl transition-all duration-300 hover:scale-105`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground drop-shadow-lg">{stat.value}</p>
                <p className={`text-sm ${stat.isNegative ? 'text-destructive' : 'text-secondary'}`}>{stat.change}</p>
              </div>
              <div className={`bg-white/70 p-3 rounded-full shadow-md`}>
                <stat.icon className={`text-${stat.color}-600 text-2xl`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
