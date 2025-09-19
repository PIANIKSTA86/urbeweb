/* global alert, window */
import React, { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import Modal from "../ui/modal";
import { TipoTransaccion } from "./TiposTransaccionConfig";

export interface Prefijo {
  id: number;
  tipo_transaccion_id: number;
  prefijo: string;
  numeracion_actual: number;
  descripcion?: string;
}

const PrefijosConfig: React.FC = () => {
  const [prefijos, setPrefijos] = useState<Prefijo[]>([]);
  const [tipos, setTipos] = useState<TipoTransaccion[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editPrefijo, setEditPrefijo] = useState<Prefijo | null>(null);

  const fetchPrefijos = () => {
    setLoading(true);
    fetch("/api/contabilidad/prefijos")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPrefijos(data);
          setError("");
        } else {
          setPrefijos([]);
          setError("Error al cargar prefijos");
        }
      })
      .catch(() => {
        setPrefijos([]);
        setError("Error al cargar prefijos");
      })
      .finally(() => setLoading(false));
  };

  const fetchTipos = () => {
    fetch("/api/contabilidad/tipos-transaccion")
      .then(res => res.json())
      .then(data => setTipos(data));
  };

  useEffect(() => {
    fetchPrefijos();
    fetchTipos();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const raw = Object.fromEntries(formData);
    const body = {
      ...raw,
      tipo_transaccion_id: Number(raw.tipo_transaccion_id),
      numeracion_actual: Number(raw.numeracion_actual),
    };
    const method = editPrefijo ? "PUT" : "POST";
    const url = editPrefijo ? `/api/contabilidad/prefijos/${editPrefijo.id}` : "/api/contabilidad/prefijos";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      setShowModal(false);
      setEditPrefijo(null);
      fetchPrefijos();
    } else {
      alert("Error al guardar el prefijo");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar prefijo?")) return;
    const res = await fetch(`/api/contabilidad/prefijos/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchPrefijos();
    } else {
      alert("Error al eliminar");
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-2">Prefijos y Numeraciones</h3>
      <button className="bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-700 transition" onClick={() => { setEditPrefijo(null); setShowModal(true); }}>Nuevo Prefijo</button>
      {loading ? <div>Cargando...</div> : error ? <div className="text-red-500">{error}</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm" data-testid="table-prefijos">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Tipo de Transacción</th>
                <th className="border px-2 py-1">Prefijo</th>
                <th className="border px-2 py-1">Numeración Actual</th>
                <th className="border px-2 py-1">Descripción</th>
                <th className="border px-2 py-1">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {prefijos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border px-2 py-6 text-center text-muted-foreground">No se encontraron prefijos</td>
                </tr>
              ) : (
                prefijos.map(prefijo => (
                  <tr key={prefijo.id}>
                    <td className="border px-2 py-1">{tipos.find(t => t.id === prefijo.tipo_transaccion_id)?.nombre || prefijo.tipo_transaccion_id}</td>
                    <td className="border px-2 py-1">{prefijo.prefijo}</td>
                    <td className="border px-2 py-1">{prefijo.numeracion_actual}</td>
                    <td className="border px-2 py-1">{prefijo.descripcion}</td>
                    <td className="border px-2 py-1">
                      <div className="flex gap-2">
                        <button className="text-yellow-600" onClick={() => { setEditPrefijo(prefijo); setShowModal(true); }} title="Editar">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600" onClick={() => handleDelete(prefijo.id)} title="Eliminar">
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
        <Modal onClose={() => { setShowModal(false); setEditPrefijo(null); }}>
          <form className="p-6 space-y-4" onSubmit={handleSubmit}>
            <h3 className="font-semibold mb-4 text-lg">{editPrefijo ? "Editar prefijo" : "Nuevo prefijo"}</h3>
            <div>
              <label className="block font-medium mb-1">Tipo de Transacción</label>
              <select name="tipo_transaccion_id" defaultValue={editPrefijo?.tipo_transaccion_id ?? ""} required className="border p-2 rounded w-full">
                <option value="">Seleccione tipo</option>
                {tipos.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Prefijo</label>
              <input name="prefijo" type="text" defaultValue={editPrefijo?.prefijo ?? ""} required placeholder="Prefijo" className="border p-2 rounded w-full focus:ring focus:ring-blue-200" maxLength={20} />
            </div>
            <div>
              <label className="block font-medium mb-1">Numeración Actual</label>
              <input name="numeracion_actual" type="number" defaultValue={editPrefijo?.numeracion_actual ?? 1} required className="border p-2 rounded w-full focus:ring focus:ring-blue-200" min={1} />
            </div>
            <div>
              <label className="block font-medium mb-1">Descripción</label>
              <textarea name="descripcion" defaultValue={editPrefijo?.descripcion ?? ""} placeholder="Descripción" className="border p-2 rounded w-full focus:ring focus:ring-blue-200" maxLength={255} />
            </div>
            <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded w-full font-semibold hover:bg-blue-700 transition">{editPrefijo ? "Guardar cambios" : "Crear prefijo"}</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PrefijosConfig;
