// ...existing code...

interface PeriodoFormModalProps {
  editPeriodo: Periodo | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const PeriodoFormModal: React.FC<PeriodoFormModalProps> = ({ editPeriodo, onSubmit }) => {
  const [ano, setAno] = React.useState<number>(editPeriodo?.ano ?? new Date().getFullYear());
  const [mes, setMes] = React.useState<number>(editPeriodo?.mes ?? new Date().getMonth() + 1);
  const fechaInicio = new Date(ano, mes - 1, 1).toISOString().slice(0, 10);
  const fechaFin = new Date(ano, mes, 0).toISOString().slice(0, 10);
  return (
    <form className="p-6 space-y-4" onSubmit={onSubmit}>
      <h3 className="font-semibold mb-4 text-lg">{editPeriodo ? "Editar periodo contable" : "Crear periodo contable"}</h3>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium mb-1">Año</label>
          <input name="ano" type="number" min="2000" max="2100" value={ano} onChange={e => setAno(Number(e.target.value))} required placeholder="Año" className="border p-2 rounded w-full focus:ring focus:ring-blue-200" />
        </div>
        <div className="flex-1">
          <label className="block font-medium mb-1">Mes <span className="text-gray-400 text-xs">1=Enero, 12=Diciembre</span></label>
          <input name="mes" type="number" min="1" max="12" value={mes} onChange={e => setMes(Number(e.target.value))} required placeholder="Mes" className="border p-2 rounded w-full focus:ring focus:ring-blue-200" />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium mb-1">Fecha inicio</label>
          <input name="fecha_inicio" type="date" value={fechaInicio} readOnly required className="border p-2 rounded w-full bg-gray-100 text-gray-500" />
        </div>
        <div className="flex-1">
          <label className="block font-medium mb-1">Fecha fin</label>
          <input name="fecha_fin" type="date" value={fechaFin} readOnly required className="border p-2 rounded w-full bg-gray-100 text-gray-500" />
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">Estado</label>
        <select name="estado_periodo" defaultValue={editPeriodo?.estado_periodo || "abierto"} className="border p-2 rounded w-full focus:ring focus:ring-blue-200">
          <option value="abierto">Abierto</option>
          <option value="cerrado">Cerrado</option>
          <option value="bloqueado">Bloqueado</option>
        </select>
      </div>
      <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded w-full font-semibold hover:bg-blue-700 transition">{editPeriodo ? "Guardar cambios" : "Crear periodo"}</button>
    </form>
  );
};
import React, { useState, useEffect } from "react";
import { Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "@/hooks/use-auth";
import Modal from "@/components/ui/modal";

export interface Periodo {
  id: number;
  nombre: string;
  ano: number;
  mes: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado_periodo: "abierto" | "cerrado" | "bloqueado";
  fecha_creacion?: string;
  fecha_cierre?: string;
  created_at?: string;
  updated_at?: string;
}

const PeriodosPage: React.FC = () => {
  const { user } = useAuth() as { user: User | null };
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editPeriodo, setEditPeriodo] = useState<Periodo | null>(null);

  // Datos precargados para nuevo periodo
  const now = new Date();
  const defaultAno = now.getFullYear();
  const defaultMes = now.getMonth() + 1;
  const defaultFechaInicio = new Date(defaultAno, now.getMonth(), 1).toISOString().slice(0, 10);
  const defaultFechaFin = new Date(defaultAno, now.getMonth() + 1, 0).toISOString().slice(0, 10);
  const getFechaInicio = (ano: number, mes: number) => new Date(ano, mes - 1, 1).toISOString().slice(0, 10);
  const getFechaFin = (ano: number, mes: number) => new Date(ano, mes, 0).toISOString().slice(0, 10);

  useEffect(() => {
    setLoading(true);
    fetch("/api/contabilidad/periodos")
      .then(res => res.json())
      .then(data => setPeriodos(data))
      .catch(() => setError("Error al cargar los periodos"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData);
    // Generar nombre automáticamente
    const mesNum = Number(body.mes);
    const anoNum = Number(body.ano);
    const nombre = `Periodo ${new Date(anoNum, mesNum - 1).toLocaleString('es-ES', { month: 'long' })} ${anoNum}`;
    body.nombre = nombre;
    // Actualizar fechas según año y mes
    body.fecha_inicio = getFechaInicio(anoNum, mesNum);
    body.fecha_fin = getFechaFin(anoNum, mesNum);
    // Añadir id de usuario autenticado
    if (user && user.id) {
      body.usuario_creacion_id = user.id;
    }
    const method = editPeriodo ? "PUT" : "POST";
    const url = editPeriodo ? `/api/contabilidad/periodos/${editPeriodo.id}` : "/api/contabilidad/periodos";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      setShowModal(false);
      setEditPeriodo(null);
      setLoading(true);
      fetch("/api/contabilidad/periodos")
        .then(res => res.json())
        .then(data => setPeriodos(data))
        .finally(() => setLoading(false));
    } else {
      alert("Error al guardar el periodo");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar periodo?")) return;
    const res = await fetch(`/api/contabilidad/periodos/${id}`, { method: "DELETE" });
    if (res.ok) {
      setLoading(true);
      fetch("/api/contabilidad/periodos")
        .then(res => res.json())
        .then(data => setPeriodos(data))
        .finally(() => setLoading(false));
    } else {
      alert("Error al eliminar");
    }
  };

  // Ordenar periodos por año y mes descendente
  const periodosOrdenados = [...periodos].sort((a, b) => {
    if (a.ano !== b.ano) return b.ano - a.ano;
    return b.mes - a.mes;
  });
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Periodos contables</h1>
  <button className="bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-700 transition" onClick={() => { setEditPeriodo(null); setShowModal(true); }}>Crear Periodo</button>
      {loading ? <div>Cargando...</div> : error ? <div className="text-red-500">{error}</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm" data-testid="table-periodos">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Nombre</th>
                <th className="border px-2 py-1">Año</th>
                <th className="border px-2 py-1">Mes</th>
                <th className="border px-2 py-1">Fecha inicio</th>
                <th className="border px-2 py-1">Fecha fin</th>
                <th className="border px-2 py-1">Estado</th>
                <th className="border px-2 py-1">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {periodosOrdenados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="border px-2 py-6 text-center text-muted-foreground">No se encontraron periodos</td>
                </tr>
              ) : (
                periodosOrdenados.map(periodo => (
                  <tr key={periodo.id}>
                    <td className="border px-2 py-1">{periodo.nombre}</td>
                    <td className="border px-2 py-1">{periodo.ano}</td>
                    <td className="border px-2 py-1">{periodo.mes}</td>
                    <td className="border px-2 py-1">{periodo.fecha_inicio}</td>
                    <td className="border px-2 py-1">{periodo.fecha_fin}</td>
                    <td className="border px-2 py-1">{periodo.estado_periodo}</td>
                    <td className="border px-2 py-1">
                      <div className="flex gap-2">
                        <button className="text-yellow-600" onClick={() => { setEditPeriodo(periodo); setShowModal(true); }} title="Editar">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600" onClick={() => handleDelete(periodo.id)} title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <Modal onClose={() => { setShowModal(false); setEditPeriodo(null); }}>
          <PeriodoFormModal editPeriodo={editPeriodo} onSubmit={handleSubmit} />
        </Modal>
      )}

    </div>
  );
};

export default PeriodosPage;
