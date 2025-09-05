import React, { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import Modal from "@/components/ui/modal";

export interface TipoTransaccion {
  id: number;
  nombre: string;
  descripcion?: string;
}

const TiposTransaccionConfig: React.FC = () => {
  const [tipos, setTipos] = useState<TipoTransaccion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTipo, setEditTipo] = useState<TipoTransaccion | null>(null);

  const fetchTipos = () => {
    setLoading(true);
    fetch("/api/contabilidad/tipos-transaccion")
      .then(res => res.json())
      .then(data => setTipos(data))
      .catch(() => setError("Error al cargar tipos de transacción"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData);
    const method = editTipo ? "PUT" : "POST";
    const url = editTipo ? `/api/contabilidad/tipos-transaccion/${editTipo.id}` : "/api/contabilidad/tipos-transaccion";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      setShowModal(false);
      setEditTipo(null);
      fetchTipos();
    } else {
      alert("Error al guardar el tipo de transacción");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar tipo de transacción?")) return;
    const res = await fetch(`/api/contabilidad/tipos-transaccion/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchTipos();
    } else {
      alert("Error al eliminar");
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-2">Tipos de Transacción</h3>
      <button className="bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-700 transition" onClick={() => { setEditTipo(null); setShowModal(true); }}>Nuevo Tipo</button>
      {loading ? <div>Cargando...</div> : error ? <div className="text-red-500">{error}</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm" data-testid="table-tipos-transaccion">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Nombre</th>
                <th className="border px-2 py-1">Descripción</th>
                <th className="border px-2 py-1">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tipos.length === 0 ? (
                <tr>
                  <td colSpan={3} className="border px-2 py-6 text-center text-muted-foreground">No se encontraron tipos de transacción</td>
                </tr>
              ) : (
                tipos.map(tipo => (
                  <tr key={tipo.id}>
                    <td className="border px-2 py-1">{tipo.nombre}</td>
                    <td className="border px-2 py-1">{tipo.descripcion}</td>
                    <td className="border px-2 py-1">
                      <div className="flex gap-2">
                        <button className="text-yellow-600" onClick={() => { setEditTipo(tipo); setShowModal(true); }} title="Editar">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600" onClick={() => handleDelete(tipo.id)} title="Eliminar">
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
        <Modal onClose={() => { setShowModal(false); setEditTipo(null); }}>
          <form className="p-6 space-y-4" onSubmit={handleSubmit}>
            <h3 className="font-semibold mb-4 text-lg">{editTipo ? "Editar tipo de transacción" : "Nuevo tipo de transacción"}</h3>
            <div>
              <label className="block font-medium mb-1">Nombre</label>
              <input name="nombre" type="text" defaultValue={editTipo?.nombre ?? ""} required placeholder="Nombre del tipo" className="border p-2 rounded w-full focus:ring focus:ring-blue-200" maxLength={100} />
            </div>
            <div>
              <label className="block font-medium mb-1">Descripción</label>
              <textarea name="descripcion" defaultValue={editTipo?.descripcion ?? ""} placeholder="Descripción" className="border p-2 rounded w-full focus:ring focus:ring-blue-200" maxLength={255} />
            </div>
            <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded w-full font-semibold hover:bg-blue-700 transition">{editTipo ? "Guardar cambios" : "Crear tipo"}</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TiposTransaccionConfig;
