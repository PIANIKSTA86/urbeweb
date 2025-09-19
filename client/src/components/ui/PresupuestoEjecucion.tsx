/* global fetch, localStorage, alert */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Rubro {
  id: number;
  nombre: string;
  presupuestado: number;
  ejecutado: number;
}

interface Presupuesto {
  id: number;
  anio: number;
  // otros campos si existen
}

export default function PresupuestoEjecucion() {
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null);
  const [rubros, setRubros] = useState<Rubro[]>([]);

  useEffect(() => {
    fetch("/api/presupuestos/1")
      .then(res => res.json())
      .then(data => {
        setPresupuesto(data);
      });
    fetch("/api/rubros/presupuesto/1")
      .then(res => res.json())
      .then(data => setRubros(data));
  }, []);

  const actualizarRubro = async (id: number, nuevo: { presupuestado: number; ejecutado: number }) => {
    await fetch(`/api/rubros/${id}` , {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo),
    });
    alert("Rubro actualizado!");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Presupuesto {presupuesto?.anio}</h1>
      <table className="w-full mt-4 border">
        <thead>
          <tr>
            <th>Rubro</th>
            <th>Presupuestado</th>
            <th>Ejecutado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {rubros.map(r => (
            <tr key={r.id}>
              <td>{r.nombre}</td>
              <td>{r.presupuestado}</td>
              <td>{r.ejecutado}</td>
              <td>
                <Button
                  onClick={() =>
                    actualizarRubro(r.id, {
                      presupuestado: r.presupuestado + 100,
                      ejecutado: r.ejecutado,
                    })
                  }
                >
                  +100
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
