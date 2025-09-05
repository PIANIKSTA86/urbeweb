import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Receipt, BarChart3 } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      icon: Plus,
      label: "Nueva Factura",
      color: "blue",
      onClick: () => console.log("Nueva factura"),
      testId: "action-new-invoice"
    },
    {
      icon: UserPlus,
      label: "Agregar Propietario",
      color: "green",
      onClick: () => console.log("Agregar propietario"),
      testId: "action-add-owner"
    },
    {
      icon: Receipt,
      label: "Registro Contable",
      color: "purple",
      onClick: () => console.log("Registro contable"),
      testId: "action-accounting-record"
    },
    {
      icon: BarChart3,
      label: "Ver Reportes",
      color: "orange",
      onClick: () => console.log("Ver reportes"),
      testId: "action-view-reports"
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className={`w-full justify-start bg-${action.color}-50 hover:bg-${action.color}-100 border-${action.color}-200`}
              onClick={action.onClick}
              data-testid={action.testId}
            >
              <action.icon className={`text-${action.color}-600 mr-3`} />
              <span className="text-foreground">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
