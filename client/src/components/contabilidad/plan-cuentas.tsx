import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Folder, Edit, Trash2 } from "lucide-react";
import Modal from "@/components/ui/modal";
import { useState } from "react";

interface PlanCuenta {
  id: string;
  codigo: string;
  nombre: string;
  clase: string;
  nombreClase: string;
  nivel: number;
  esDebito: boolean;
  activa: boolean;
}

export function PlanCuentas() {
  const [expandedClases, setExpandedClases] = useState<Set<string>>(new Set());
  const [editCuenta, setEditCuenta] = useState<PlanCuenta | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [cuentasActualizadas, setCuentasActualizadas] = useState<PlanCuenta[]>([]);

  const { data: cuentas, isLoading, error } = useQuery({
    queryKey: ["/api/contabilidad/plan-cuentas"],
  });

  const toggleClase = (clase: string) => {
    const newExpanded = new Set(expandedClases);
    if (newExpanded.has(clase)) {
      newExpanded.delete(clase);
    } else {
      newExpanded.add(clase);
    }
    setExpandedClases(newExpanded);
  };

  const handleEdit = (cuenta: PlanCuenta) => {
    setEditCuenta(cuenta);
    setShowModal(true);
  };

  const handleDelete = async (cuenta: PlanCuenta) => {
    if (!window.confirm(`¿Eliminar la cuenta ${cuenta.codigo} - ${cuenta.nombre}?`)) return;
    try {
      const res = await fetch(`/api/contabilidad/plan-cuentas/${cuenta.id}`, { method: "DELETE" });
      if (res.ok) {
        setCuentasActualizadas(prev => prev.filter(c => c.id !== cuenta.id));
        alert(`Cuenta eliminada: ${cuenta.codigo}`);
      } else {
        alert("Error al eliminar la cuenta");
      }
    } catch {
      alert("Error de conexión al eliminar");
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editCuenta) return;
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData);
    body.esDebito = body.esDebito === "debito";
    try {
      const res = await fetch(`/api/contabilidad/plan-cuentas/${editCuenta.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowModal(false);
        setEditCuenta(null);
        // Actualizar la lista localmente
        setCuentasActualizadas(prev => prev.map(c => c.id === editCuenta.id ? { ...c, ...body } : c));
        alert("Cuenta actualizada correctamente");
      } else {
        alert("Error al actualizar la cuenta");
      }
    } catch {
      alert("Error de conexión al actualizar");
    }
  };

  // Agrupar cuentas por clase
  const cuentasPorClase = ((cuentasActualizadas.length > 0 ? cuentasActualizadas : (cuentas as PlanCuenta[])) || []).reduce((acc: Record<string, PlanCuenta[]>, cuenta: PlanCuenta) => {
    if (!acc[cuenta.clase]) {
      acc[cuenta.clase] = [];
    }
    acc[cuenta.clase].push(cuenta);
    return acc;
  }, {});

  // Obtener clases principales (nivel 1)
  const clasesPrincipales = Object.keys(cuentasPorClase).map(clase => {
    const primeracuenta = cuentasPorClase[clase].find((c: PlanCuenta) => c.nivel === 1);
    return {
      codigo: clase,
      nombre: primeracuenta?.nombreClase || `Clase ${clase}`,
      subcuentas: cuentasPorClase[clase].filter((c: PlanCuenta) => c.nivel === 1).length
    };
  }).sort((a, b) => a.codigo.localeCompare(b.codigo));

  const getClaseColor = (clase: string) => {
    switch (clase) {
      case '1': return 'text-blue-600';
      case '2': return 'text-red-600';
      case '3': return 'text-green-600';
      case '4': return 'text-purple-600';
      case '5': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plan Único de Cuentas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plan Único de Cuentas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive py-8">
            <p>Error al cargar el plan de cuentas</p>
            <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Único de Cuentas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {clasesPrincipales.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay cuentas configuradas</p>
              <p className="text-sm mt-2">Configure el plan de cuentas para comenzar</p>
            </div>
          ) : (
            clasesPrincipales.map((clase) => (
              <div key={clase.codigo}>
                <div 
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => toggleClase(clase.codigo)}
                  data-testid={`plan-cuenta-clase-${clase.codigo}`}
                >
                  <div className="flex items-center">
                    <Folder className={`mr-3 ${getClaseColor(clase.codigo)}`} />
                    <div>
                      <p className="text-foreground font-medium">
                        {clase.codigo}. {clase.nombre}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {clase.subcuentas} subcuentas
                      </p>
                    </div>
                  </div>
                  <ChevronRight 
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      expandedClases.has(clase.codigo) ? 'rotate-90' : ''
                    }`}
                  />
                </div>

                {/* Mostrar subcuentas cuando está expandida */}
                {expandedClases.has(clase.codigo) && (
                  <div className="ml-6 mt-2">
                    <table className="w-full" data-testid={`table-subcuentas-${clase.codigo}`}> 
                      {/* Encabezado de la tabla, sin columna Descripción */}
                      <thead>
                        <tr className="bg-muted text-xs text-muted-foreground">
                          <th className="px-2 py-2 text-left">Código</th>
                          <th className="px-2 py-2 text-left">Nombre</th>
                          <th className="px-2 py-2 text-left">Tipo</th>
                          <th className="px-2 py-2 text-left">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cuentasPorClase[clase]?.map((cuenta) => (
                          <tr key={cuenta.id} className="border-b text-sm">
                            <td className="px-2 py-2 font-mono">{cuenta.codigo}</td>
                            <td className="px-2 py-2">{cuenta.nombre}</td>
                            <td className="px-2 py-2">{cuenta.esDebito ? "Débito" : "Crédito"}</td>
                            <td className="px-2 py-2 flex gap-2">
                              <button onClick={() => handleEdit(cuenta)} className="text-blue-600 hover:text-blue-800"><EditIcon size={16} /></button>
                              <button onClick={() => handleDelete(cuenta)} className="text-red-600 hover:text-red-800"><TrashIcon size={16} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Modal de edición de cuenta */}
                {showModal && editCuenta && (
                  <Modal onClose={() => { setShowModal(false); setEditCuenta(null); }}>
                    <form className="p-6 space-y-4" onSubmit={handleUpdate}>
                      <h3 className="font-semibold mb-4 text-lg">Editar cuenta</h3>
                      <div>
                        <label className="block font-medium mb-1">Código</label>
                        <input name="codigo" type="text" defaultValue={editCuenta.codigo} className="border p-2 rounded w-full" readOnly />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Nombre</label>
                        <input name="nombre" type="text" defaultValue={editCuenta.nombre} className="border p-2 rounded w-full" />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Tipo</label>
                        <select name="esDebito" defaultValue={editCuenta.esDebito ? "debito" : "credito"} className="border p-2 rounded w-full">
                          <option value="debito">Débito</option>
                          <option value="credito">Crédito</option>
                        </select>
                      </div>
                      <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded w-full font-semibold hover:bg-blue-700 transition">Guardar cambios</button>
                    </form>
                  </Modal>
                )}
              </div>
            ))
          )}
        </div>
        
        <Button 
          className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
          data-testid="button-manage-plan-cuentas"
        >
          Gestionar PUC
        </Button>
      </CardContent>
    </Card>
  );
}
