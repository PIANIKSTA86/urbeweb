// ...existing code...


import React, { useState, useEffect } from "react";
import ModalTransaccion from "@/components/contabilidad/ModalTransaccion";
import { Tercero } from "@/components/contabilidad/BuscadorTerceros";
import { Edit, Trash2, List, CalendarDays, Percent, BarChart2, BookOpen, Settings } from "lucide-react";
import TiposTransaccionConfig from "@/components/contabilidad/TiposTransaccionConfig";
import PrefijosConfig from "@/components/contabilidad/PrefijosConfig";
import PeriodosPage from "./periodos";
import Modal from "@/components/ui/modal";
import { SidebarNew } from "@/components/layout/sidebar-new";

interface PlanCuenta {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  nivel: number;
  padre_codigo?: string;
  descripcion?: string;
  estado: number;
  es_debito: number;
  registra_tercero: number;
}

const tabs = [
  { label: "Movimientos", key: "movimientos", icon: List },
  { label: "Periodos", key: "periodos", icon: CalendarDays },
  { label: "Impuestos", key: "impuestos", icon: Percent },
  { label: "Reportes", key: "reportes", icon: BarChart2 },
  { label: "PUC", key: "puc", icon: BookOpen },
  { label: "Configuración", key: "config", icon: Settings },
];

const Contabilidad: React.FC = () => {
  // PUC
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const [puc, setPuc] = useState<PlanCuenta[]>([]);
  const [loadingPuc, setLoadingPuc] = useState(false);
  const [errorPuc, setErrorPuc] = useState("");
  const [filterCodigo, setFilterCodigo] = useState("");
  const [filterNombre, setFilterNombre] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterNivel, setFilterNivel] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [editCuenta, setEditCuenta] = useState<PlanCuenta | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteCuenta, setDeleteCuenta] = useState<PlanCuenta | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [terceroSeleccionado, setTerceroSeleccionado] = useState<Tercero | null>(null);

  // Movimientos
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [loadingMov, setLoadingMov] = useState(false);
  const [errorMov, setErrorMov] = useState("");
  const [movPage, setMovPage] = useState(1);
  const [movPageSize, setMovPageSize] = useState(10);
  const [movTotal, setMovTotal] = useState(0);
  const [filterFecha, setFilterFecha] = useState("");
  const [filterDescripcion, setFilterDescripcion] = useState("");
  const [movFilterTipoDocumento, setMovFilterTipoDocumento] = useState("");
  const [movFilterEstado, setMovFilterEstado] = useState("");

  // Handlers para crear, editar y eliminar transacciones
  const [showTransModal, setShowTransModal] = useState(false);
  const [transForm, setTransForm] = useState<any>({ fecha: '', descripcion: '', documento: '', tipoTransaccion: '', usuarioId: '', cuentas: [] });
  const [editTransId, setEditTransId] = useState<string | null>(null);

  const handleCreateTrans = () => {
    setTransForm({ fecha: '', descripcion: '', documento: '', tipoTransaccion: '', usuarioId: '', cuentas: [] });
    setEditTransId(null);
    setShowTransModal(true);
  };

  const handleEditTrans = (mov: any) => {
    setTransForm({ ...mov, cuentas: mov.movimientos });
    setEditTransId(mov.id);
    setShowTransModal(true);
  };

  const handleDeleteTrans = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta transacción?')) {
      fetch(`/api/contabilidad/transacciones/${id}`, { method: 'DELETE' })
        .then(() => window.location.reload());
    }
  };

  const handleSubmitTrans = (e: React.FormEvent) => {
    e.preventDefault();
    const method = editTransId ? 'PUT' : 'POST';
    const url = editTransId ? `/api/contabilidad/transacciones/${editTransId}` : '/api/contabilidad/transacciones';
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transForm)
    })
      .then(res => res.json())
      .then(() => {
        setShowTransModal(false);
        window.location.reload();
      });
  };

  useEffect(() => {
    if (activeTab === "puc") {
      setLoadingPuc(true);
      fetch("/api/contabilidad/puc")
        .then((res) => {
          if (!res.ok) throw new Error("Error al obtener el plan de cuentas");
          return res.json();
        })
        .then((data) => {
          setPuc(data);
          setErrorPuc("");
        })
        .catch((err) => setErrorPuc(err.message))
        .finally(() => setLoadingPuc(false));
    }
    if (activeTab === "movimientos") {
      setLoadingMov(true);
      const params = new URLSearchParams({
        page: movPage.toString(),
        pageSize: movPageSize.toString(),
        ...(filterFecha ? { fecha: filterFecha } : {}),
        ...(filterDescripcion ? { descripcion: filterDescripcion } : {}),
        ...(movFilterTipoDocumento ? { tipoDocumento: movFilterTipoDocumento } : {}),
        ...(movFilterEstado ? { estado: movFilterEstado } : {}),
      });
      fetch(`/api/contabilidad/transacciones?${params}`)
        .then((res) => {
          if (!res.ok) throw new Error("Error al obtener movimientos");
          return res.json();
        })
        .then((data) => {
          setMovimientos(data.data);
          setMovTotal(data.total);
          setErrorMov("");
        })
        .catch((err) => setErrorMov(err.message))
        .finally(() => setLoadingMov(false));
    }
  }, [activeTab, movPage, movPageSize, filterFecha, filterDescripcion, movFilterTipoDocumento, movFilterEstado]);

  return (
    <div className="flex">
      <SidebarNew />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Contabilidad</h1>
        <div className="mb-6 flex gap-4 border-b pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`px-4 py-2 rounded-t font-semibold flex items-center gap-2 ${activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
        {activeTab === "movimientos" && (
          <section>
            <h2 className="text-xl font-bold mb-2">Movimientos</h2>
            <button className="bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-700 transition" onClick={handleCreateTrans}>Crear Transacción</button>
            <div className="mb-4 flex gap-2 items-center">
              <input value={filterFecha} onChange={e => { setFilterFecha(e.target.value); setMovPage(1); }} placeholder="Filtrar por fecha (YYYY-MM-DD)" className="border p-2 rounded" />
              <input value={filterDescripcion} onChange={e => { setFilterDescripcion(e.target.value); setMovPage(1); }} placeholder="Filtrar por descripción" className="border p-2 rounded" />
              <select value={movFilterTipoDocumento} onChange={e => { setMovFilterTipoDocumento(e.target.value); setMovPage(1); }} className="border p-2 rounded">
                <option value="">Tipo de documento</option>
                <option value="Factura">Factura</option>
                <option value="Recibo">Recibo</option>
                <option value="Nota">Nota</option>
                <option value="Otro">Otro</option>
              </select>
              <select value={movFilterEstado} onChange={e => { setMovFilterEstado(e.target.value); setMovPage(1); }} className="border p-2 rounded">
                <option value="">Estado</option>
                <option value="registrada">Registrada</option>
                <option value="anulada">Anulada</option>
                <option value="contabilizado">Contabilizado</option>
              </select>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded" onClick={() => { setMovPage(1); }}>Buscar</button>
            </div>
            {loadingMov ? (
              <div className="text-gray-500">Cargando movimientos...</div>
            ) : errorMov ? (
              <div className="text-red-500">{errorMov}</div>
            ) : (
              <div className="overflow-auto max-h-[400px]">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">Tipo de documento</th>
                      <th className="border px-2 py-1">Fecha</th>
                      <th className="border px-2 py-1">No. documento</th>
                      <th className="border px-2 py-1">Débito</th>
                      <th className="border px-2 py-1">Crédito</th>
                      <th className="border px-2 py-1">Nombre de tercero</th>
                      <th className="border px-2 py-1">Descripción</th>
                      <th className="border px-2 py-1">Estado</th>
                      <th className="border px-2 py-1">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.map((mov: any) => {
                      const totalDebito = mov.movimientos?.reduce((sum: number, m: any) => sum + Number(m.valorDebito || 0), 0) || 0;
                      const totalCredito = mov.movimientos?.reduce((sum: number, m: any) => sum + Number(m.valorCredito || 0), 0) || 0;
                      return (
                        <tr key={mov.id}>
                          <td className="border px-2 py-1">{mov.tipoTransaccion || "-"}</td>
                          <td className="border px-2 py-1">{mov.fecha}</td>
                          <td className="border px-2 py-1">{mov.numeroComprobante}</td>
                          <td className="border px-2 py-1">{totalDebito.toLocaleString()}</td>
                          <td className="border px-2 py-1">{totalCredito.toLocaleString()}</td>
                          <td className="border px-2 py-1">{mov.movimientos?.[0]?.terceroId || "-"}</td>
                          <td className="border px-2 py-1">{mov.concepto}</td>
                          <td className="border px-2 py-1">{mov.estado || "-"}</td>
                          <td className="border px-2 py-1">
                            <div className="flex gap-2">
                              <button className="text-yellow-600" title="Editar" onClick={() => handleEditTrans(mov)}>
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="text-red-600" title="Eliminar" onClick={() => handleDeleteTrans(mov.id)}>
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
        {activeTab === "periodos" && (
          <section>
            <PeriodosPage />
          </section>
        )}
        {activeTab === "impuestos" && (
          <section>
            {/* ...existing code for Impuestos... */}
          </section>
        )}
        {activeTab === "reportes" && (
          <section>
            {/* ...existing code for Reportes... */}
          </section>
        )}
        {activeTab === "puc" && (
          <section>
            <h2 className="text-xl font-bold mb-2">Plan Único de Cuentas (PUC)</h2>
            <div className="mb-4 flex gap-2">
              <button className="bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-700 transition" onClick={() => setShowCreateModal(true)}>Crear cuenta</button>
              <button className="bg-primary text-white px-4 py-2 rounded mb-4 hover:bg-blue-700 transition" onClick={() => setShowImportModal(true)}>Importar PUC</button>
            </div>
            <div className="mb-4 flex gap-2 items-center">
              <input value={filterCodigo} onChange={e => setFilterCodigo(e.target.value)} placeholder="Filtrar por código" className="border p-2 rounded" />
              <input value={filterNombre} onChange={e => setFilterNombre(e.target.value)} placeholder="Filtrar por nombre" className="border p-2 rounded" />
              <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} className="border p-2 rounded">
                <option value="">Tipo</option>
                <option value="activo">Activo</option>
                <option value="pasivo">Pasivo</option>
                <option value="patrimonio">Patrimonio</option>
                <option value="ingreso">Ingreso</option>
                <option value="gasto">Gasto</option>
                <option value="orden">Orden</option>
              </select>
              <input value={filterNivel} onChange={e => setFilterNivel(e.target.value)} placeholder="Nivel" type="number" min="1" className="border p-2 rounded" />
              <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className="border p-2 rounded">
                <option value="">Estado</option>
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
            </div>
            {loadingPuc ? (
              <div className="text-gray-500">Cargando plan de cuentas...</div>
            ) : errorPuc ? (
              <div className="text-red-500">{errorPuc}</div>
            ) : (
              <div className="overflow-auto max-h-[400px]">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">Código</th>
                      <th className="border px-2 py-1">Nombre</th>
                      <th className="border px-2 py-1">Tipo</th>
                      <th className="border px-2 py-1">Nivel</th>
                      <th className="border px-2 py-1">Padre Código</th>
                      <th className="border px-2 py-1">Descripción</th>
                      <th className="border px-2 py-1">Estado</th>
                      <th className="border px-2 py-1">Débito</th>
                      <th className="border px-2 py-1">Registra Tercero</th>
                      <th className="border px-2 py-1">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {puc.filter((cuenta: any) =>
                      (!filterCodigo || cuenta.codigo.includes(filterCodigo)) &&
                      (!filterNombre || cuenta.nombre.toLowerCase().includes(filterNombre.toLowerCase())) &&
                      (!filterTipo || cuenta.tipo === filterTipo) &&
                      (!filterNivel || cuenta.nivel === parseInt(filterNivel)) &&
                      (!filterEstado || cuenta.estado === parseInt(filterEstado))
                    ).map((cuenta: any) => (
                      <tr key={cuenta.codigo}>
                        <td className="border px-2 py-1">{cuenta.codigo}</td>
                        <td className="border px-2 py-1">{cuenta.nombre}</td>
                        <td className="border px-2 py-1">{cuenta.tipo}</td>
                        <td className="border px-2 py-1">{cuenta.nivel}</td>
                        <td className="border px-2 py-1">{cuenta.padre_codigo}</td>
                        <td className="border px-2 py-1">{cuenta.descripcion}</td>
                        <td className="border px-2 py-1">{cuenta.estado === 1 ? "Activo" : "Inactivo"}</td>
                        <td className="border px-2 py-1">{cuenta.es_debito === 1 ? "Sí" : "No"}</td>
                        <td className="border px-2 py-1">{cuenta.registra_tercero === 1 ? "Sí" : "No"}</td>
                        <td className="border px-2 py-1">
                          <button className="text-blue-600 mr-2" onClick={() => { setEditCuenta(cuenta); setShowEditModal(true); }}>Editar</button>
                          <button className="text-red-600" onClick={() => { setDeleteCuenta(cuenta); setShowDeleteModal(true); }}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Modal crear cuenta */}
            {showCreateModal && (
              <Modal onClose={() => setShowCreateModal(false)}>
                <form
                  className="p-6"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const res = await fetch("/api/contabilidad/puc", {
                      method: "POST",
                      body: JSON.stringify(Object.fromEntries(formData)),
                      headers: { "Content-Type": "application/json" },
                    });
                    if (res.ok) {
                      alert("Cuenta creada correctamente");
                      setShowCreateModal(false);
                      setLoadingPuc(true);
                      fetch("/api/contabilidad/puc")
                        .then((res) => res.json())
                        .then((data) => setPuc(data))
                        .finally(() => setLoadingPuc(false));
                    } else {
                      alert("Error al crear la cuenta");
                    }
                  }}
                >
                  <h3 className="font-semibold mb-4 text-lg">Crear cuenta individual</h3>
                  <input name="codigo" placeholder="Código" required className="border p-2 rounded mb-2 w-full" />
                  <input name="nombre" placeholder="Nombre" required className="border p-2 rounded mb-2 w-full" />
                  <select name="tipo" required className="border p-2 rounded mb-2 w-full">
                    <option value="">Tipo</option>
                    <option value="activo">Activo</option>
                    <option value="pasivo">Pasivo</option>
                    <option value="patrimonio">Patrimonio</option>
                    <option value="ingreso">Ingreso</option>
                    <option value="gasto">Gasto</option>
                    <option value="orden">Orden</option>
                  </select>
                  <input name="nivel" type="number" min="1" max="10" placeholder="Nivel" required className="border p-2 rounded mb-2 w-full" />
                  <input name="padre_codigo" placeholder="Padre Código" className="border p-2 rounded mb-2 w-full" />
                  <textarea name="descripcion" placeholder="Descripción" className="border p-2 rounded mb-2 w-full" />
                  <select name="estado" className="border p-2 rounded mb-2 w-full">
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                  <select name="es_debito" className="border p-2 rounded mb-2 w-full">
                    <option value="">¿Es Débito?</option>
                    <option value="1">Sí</option>
                    <option value="0">No</option>
                  </select>
                  <select name="registra_tercero" className="border p-2 rounded mb-4 w-full">
                    <option value="0">No registra tercero</option>
                    <option value="1">Registra tercero</option>
                  </select>
                  <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded w-full">Crear Cuenta</button>
                </form>
              </Modal>
            )}
            {/* Modal importar PUC */}
            {showImportModal && (
              <Modal onClose={() => setShowImportModal(false)}>
                <form
                  className="p-6 flex flex-col justify-center"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const res = await fetch("/api/contabilidad/puc/import", {
                      method: "POST",
                      body: formData,
                    });
                    if (res.ok) {
                      alert("Plan de cuentas importado correctamente");
                      setShowImportModal(false);
                      setLoadingPuc(true);
                      fetch("/api/contabilidad/puc")
                        .then((res) => res.json())
                        .then((data) => setPuc(data))
                        .finally(() => setLoadingPuc(false));
                    } else {
                      alert("Error al importar el plan de cuentas");
                    }
                  }}
                >
                  <h3 className="font-semibold mb-4 text-lg">Importar plan de cuentas (CSV)</h3>
                  <input type="file" name="file" accept=".csv" required className="border p-2 rounded mb-4" />
                  <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded w-full">Importar CSV</button>
                </form>
              </Modal>
            )}
          </section>
        )}
        {activeTab === "config" && (
          <section>
            <h2 className="text-xl font-bold mb-2">Configuración</h2>
            <TiposTransaccionConfig />
            <PrefijosConfig />
          </section>
        )}
        {/* ModalTransaccion para crear transacción contable */}
        {showTransModal && (
          <ModalTransaccion
            open={showTransModal}
            onClose={() => setShowTransModal(false)}
            onSave={async (data: any) => {
              // Adaptar datos para backend
              const nuevaTransaccion = {
                documento: `${data.prefijo}-${data.numeracion}`,
                descripcion: data.descripcion,
                fecha: new Date().toISOString().slice(0, 10),
                usuario_id: 3, // Cambia por el usuario real si lo tienes
                tipo: "manual", // Puedes adaptar según tu lógica
                tercero_id: data.tercero?.id || null,
                cuentas: data.movimientos.map(m => ({
                  cuenta_id: m.cuenta,
                  tercero_id: m.tercero,
                  descripcion: m.comentario,
                  debito: Number(m.debito),
                  credito: Number(m.credito),
                }))
              };
              await fetch('/api/contabilidad/transacciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevaTransaccion)
              });
              setShowTransModal(false);
              // Actualizar lista de movimientos
              setMovPage(1);
              setActiveTab("movimientos");
            }}
            tercero={terceroSeleccionado}
            onTerceroChange={setTerceroSeleccionado}
          />
        )}
      </main>
    </div>
  );
}

export default Contabilidad;
