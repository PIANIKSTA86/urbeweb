import { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2, Plus } from "lucide-react";
import Modal from "@/components/ui/modal";

export interface PartidaPresupuestal {
  id: number;
  nombre: string;
  tipo?: string;
  monto_aprobado: number;
  saldo: number;
  estado: number;
  created_at?: string;
  updated_at?: string;
}

export default function PartidasPresupuestalesConfig() {
  const [partidas, setPartidas] = useState<PartidaPresupuestal[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<PartidaPresupuestal>>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchPartidas = async () => {
    setLoading(true);
    try {
  const res = await axios.get("/api/rubros");
      // Soporta respuesta como array directo o { data: array }
      if (Array.isArray(res.data)) {
        setPartidas(res.data);
      } else if (Array.isArray(res.data.data)) {
        setPartidas(res.data.data);
      } else {
        setPartidas([]);
      }
    } catch (e) {
      setError("Error al cargar partidas presupuestales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartidas();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
  await axios.put(`/api/rubros/${editId}`, form);
      } else {
  await axios.post("/api/rubros", form);
      }
      setForm({});
      setEditId(null);
      fetchPartidas();
      setShowModal(false);
    } catch (e) {
      setError("Error al guardar partida presupuestal");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (partida: PartidaPresupuestal) => {
    setForm({ ...partida });
    setEditId(partida.id);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar esta partida presupuestal?")) return;
    setLoading(true);
    try {
      await axios.delete(`/api/contabilidad/partidas-presupuestales/${id}`);
      fetchPartidas();
    } catch (e) {
      setError("Error al eliminar partida presupuestal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h3 className="text-lg font-bold mb-2">Partidas Presupuestales Anuales</h3>
      <button className="bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-700 transition flex items-center gap-2" onClick={() => { setForm({}); setEditId(null); setShowModal(true); }}>
        <Plus className="w-4 h-4" /> Nueva Partida
      </button>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm" data-testid="table-partidas-presupuestales">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Nombre</th>
              <th className="border px-2 py-1">Tipo</th>
              <th className="border px-2 py-1">Monto Aprobado</th>
              <th className="border px-2 py-1">Saldo</th>
              <th className="border px-2 py-1">Estado</th>
              <th className="border px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {partidas.length === 0 ? (
              <tr>
                <td colSpan={6} className="border px-2 py-6 text-center text-muted-foreground">No se encontraron partidas</td>
              </tr>
            ) : (
              partidas.map((p) => (
                <tr key={p.id}>
                  <td className="border px-2 py-1">{p.nombre}</td>
                  <td className="border px-2 py-1">{p.tipo}</td>
                  <td className="border px-2 py-1">{p.monto_aprobado}</td>
                  <td className="border px-2 py-1">{p.saldo}</td>
                  <td className="border px-2 py-1">{p.estado === 1 ? "Activo" : "Inactivo"}</td>
                  <td className="border px-2 py-1">
                    <div className="flex gap-2">
                      <button className="text-yellow-600" onClick={() => handleEdit(p)} title="Editar">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600" onClick={() => handleDelete(p.id)} title="Eliminar">
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
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h3 className="font-semibold mb-4 text-lg">{editId ? "Editar partida" : "Nueva partida presupuestal"}</h3>
            <div>
              <label className="block font-medium mb-1">Nombre</label>
              <input
                name="nombre"
                value={form.nombre || ""}
                onChange={handleChange}
                placeholder="Nombre"
                className="border p-2 rounded w-full focus:ring focus:ring-blue-200"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Tipo</label>
              <input
                name="tipo"
                value={form.tipo || ""}
                onChange={handleChange}
                placeholder="Tipo (anual, mensual, etc.)"
                className="border p-2 rounded w-full focus:ring focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Monto Aprobado</label>
              <input
                name="monto_aprobado"
                type="number"
                value={form.monto_aprobado || 0}
                onChange={handleChange}
                placeholder="Monto aprobado"
                className="border p-2 rounded w-full focus:ring focus:ring-blue-200"
                min={0}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Saldo</label>
              <input
                name="saldo"
                type="number"
                value={form.saldo || 0}
                onChange={handleChange}
                placeholder="Saldo"
                className="border p-2 rounded w-full focus:ring focus:ring-blue-200"
                min={0}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Estado</label>
              <select name="estado" value={form.estado ?? 1} onChange={handleChange} className="border p-2 rounded w-full">
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
            <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded w-full font-semibold hover:bg-blue-700 transition">{editId ? "Actualizar" : "Agregar"}</button>
            <button type="button" onClick={() => setShowModal(false)} className="text-gray-500 w-full mt-2">Cancelar</button>
          </form>
        </Modal>
      )}
    </section>
  );
}
