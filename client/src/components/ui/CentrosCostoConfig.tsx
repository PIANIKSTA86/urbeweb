/* global window */
import { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2 } from "lucide-react";

export interface CentroCosto {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: number;
  created_at?: string;
  updated_at?: string;
}

import Modal from "@/components/ui/modal";

export default function CentrosCostoConfig() {
  const [centros, setCentros] = useState<CentroCosto[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<CentroCosto>>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchCentros = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/contabilidad/centros-costo");
      setCentros(res.data);
    } catch (e) {
      setError("Error al cargar centros de costo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCentros();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await axios.put(`/api/contabilidad/centros-costo/${editId}`, form);
      } else {
        await axios.post("/api/contabilidad/centros-costo", form);
      }
      setForm({});
      setEditId(null);
      fetchCentros();
    } catch (e) {
      setError("Error al guardar centro de costo");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (centro: CentroCosto) => {
    setForm({ nombre: centro.nombre, descripcion: centro.descripcion, estado: centro.estado });
    setEditId(centro.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este centro de costo?")) return;
    setLoading(true);
    try {
      await axios.delete(`/api/contabilidad/centros-costo/${id}`);
      fetchCentros();
    } catch (e) {
      setError("Error al eliminar centro de costo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
  <h3 className="text-lg font-bold mb-2">Centros de Costo</h3>
  <button className="bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-700 transition" onClick={() => { setForm({}); setEditId(null); setShowCreateModal(true); }}>Nuevo Centro de Costo</button>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm" data-testid="table-centros-costo">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Nombre</th>
              <th className="border px-2 py-1">Descripción</th>
              <th className="border px-2 py-1">Estado</th>
              <th className="border px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {centros.length === 0 ? (
              <tr>
                <td colSpan={4} className="border px-2 py-6 text-center text-muted-foreground">No se encontraron centros de costo</td>
              </tr>
            ) : (
              centros.map((c) => (
                <tr key={c.id}>
                  <td className="border px-2 py-1">{c.nombre}</td>
                  <td className="border px-2 py-1">{c.descripcion}</td>
                  <td className="border px-2 py-1">{c.estado === 1 ? "Activo" : "Inactivo"}</td>
                  <td className="border px-2 py-1">
                    <div className="flex gap-2">
                      <button className="text-yellow-600" onClick={() => handleEdit(c)} title="Editar">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600" onClick={() => handleDelete(c.id)} title="Eliminar">
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
      {loading && <div className="mt-2">Cargando...</div>}
      {/* Modal para crear centro de costo */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>
          <form onSubmit={e => { handleSubmit(e); setShowCreateModal(false); }} className="p-6 space-y-4">
            <h3 className="font-semibold mb-4 text-lg">Agregar centro de costo</h3>
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
              <label className="block font-medium mb-1">Descripción</label>
              <input
                name="descripcion"
                value={form.descripcion || ""}
                onChange={handleChange}
                placeholder="Descripción"
                className="border p-2 rounded w-full focus:ring focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Estado</label>
              <select name="estado" value={form.estado ?? 1} onChange={handleChange} className="border p-2 rounded w-full">
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
            <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded w-full font-semibold hover:bg-blue-700 transition">Agregar</button>
            <button type="button" onClick={() => setShowCreateModal(false)} className="text-gray-500 w-full mt-2">Cancelar</button>
          </form>
        </Modal>
      )}
      {/* Edición inline: si editId está activo, mostrar el formulario sobre la tabla */}
      {editId && (
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-gray-50 rounded mt-4 border">
          <h3 className="font-semibold mb-4 text-lg">Editar centro de costo</h3>
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
            <label className="block font-medium mb-1">Descripción</label>
            <input
              name="descripcion"
              value={form.descripcion || ""}
              onChange={handleChange}
              placeholder="Descripción"
              className="border p-2 rounded w-full focus:ring focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Estado</label>
            <select name="estado" value={form.estado ?? 1} onChange={handleChange} className="border p-2 rounded w-full">
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </select>
          </div>
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded w-full font-semibold hover:bg-blue-700 transition">Actualizar</button>
          <button type="button" onClick={() => { setForm({}); setEditId(null); }} className="text-gray-500 w-full mt-2">Cancelar</button>
        </form>
      )}
    </section>
  );
}
