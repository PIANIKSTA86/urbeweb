// ...existing code...


import React, { useState, useEffect, useMemo } from "react";
import { PUCTreeTable, CuentaNode } from "@/components/contabilidad/PUCTreeTable";
import ModalTransaccion from "@/components/contabilidad/ModalTransaccion";
import { Tercero } from "@/components/contabilidad/BuscadorTerceros";
import { Edit, Trash2, List, CalendarDays, Percent, BarChart2, BookOpen, Settings } from "lucide-react";
import TiposTransaccionConfig from "@/components/contabilidad/TiposTransaccionConfig";
import PrefijosConfig from "@/components/contabilidad/PrefijosConfig";
import CentrosCostoConfig from "@/components/ui/CentrosCostoConfig";
import PeriodosPage from "./periodos";
import Modal from "@/components/ui/modal";
import { ModalCrearCuentaPUC } from "@/components/contabilidad/ModalCrearCuentaPUC";

import { SidebarNew } from "@/components/layout/sidebar-new";
import { TopNavigation } from "@/components/layout/top-navigation";

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
  // Estado para tabs de configuración
  const [configTab, setConfigTab] = useState('tipos');
  // PUC
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const [puc, setPuc] = useState<PlanCuenta[]>([]);
  const [loadingPuc, setLoadingPuc] = useState(false);
  const [errorPuc, setErrorPuc] = useState("");
  // Filtros aplicados
  const [filterCodigo, setFilterCodigo] = useState("");
  const [filterNombre, setFilterNombre] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterNivel, setFilterNivel] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  // Inputs temporales
  const [inputCodigo, setInputCodigo] = useState("");
  const [inputNombre, setInputNombre] = useState("");
  const [inputNivel, setInputNivel] = useState("");
  // Sincronizar inputs temporales con filtros al cambiar de tab o limpiar
  useEffect(() => {
    setInputCodigo(filterCodigo);
    setInputNombre(filterNombre);
    setInputNivel(filterNivel);
  }, [filterCodigo, filterNombre, filterNivel, activeTab]);
  const [editCuenta, setEditCuenta] = useState<PlanCuenta | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteCuenta, setDeleteCuenta] = useState<PlanCuenta | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Estado para árbol jerárquico
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [searchTerm, setSearchTerm] = useState("");
  // Para resaltar nodos encontrados
  const [highlight, setHighlight] = useState<Set<string>>(new Set());
  // Función para transformar array plano en árbol
  const buildCuentaTree = (cuentas: PlanCuenta[]): CuentaNode[] => {
    const map = new Map<string, CuentaNode>();
    cuentas.forEach(c => {
      map.set(c.codigo, { ...c, children: [] });
    });
    // Solo nivel 1 como raíz
    const roots: CuentaNode[] = cuentas
      .filter(c => c.nivel === 1)
      .map(c => map.get(c.codigo)!)
      .sort((a, b) => parseInt(a.codigo) - parseInt(b.codigo));
    // Asignar hijos
    map.forEach((cuenta, codigo) => {
      if (cuenta.padre_codigo && map.has(cuenta.padre_codigo)) {
        map.get(cuenta.padre_codigo)!.children!.push(cuenta);
      }
    });
    // Ordenar hijos por código numérico
    const sortChildren = (nodos: CuentaNode[], visited = new Set<string>()) => {
      nodos.sort((a, b) => parseInt(a.codigo) - parseInt(b.codigo));
      nodos.forEach(n => {
        if (n.children && n.children.length > 0 && !visited.has(n.codigo)) {
          visited.add(n.codigo);
          sortChildren(n.children, visited);
        }
      });
    };
    sortChildren(roots);
    return roots;
  };

  // Filtros combinables y búsqueda
  const cuentasFiltradas = useMemo(() => {
    return puc.filter((cuenta: any) =>
      (!filterCodigo || cuenta.codigo.includes(filterCodigo)) &&
      (!filterNombre || cuenta.nombre.toLowerCase().includes(filterNombre.toLowerCase())) &&
      (!filterTipo || cuenta.tipo === filterTipo) &&
      (!filterNivel || cuenta.nivel === parseInt(filterNivel)) &&
      (!filterEstado || cuenta.estado === parseInt(filterEstado))
    );
  }, [puc, filterCodigo, filterNombre, filterTipo, filterNivel, filterEstado]);

  // Búsqueda instantánea global (código/nombre)
  useEffect(() => {
    if (!searchTerm) {
      setHighlight(new Set());
      return;
    }
    const found = new Set<string>();
    cuentasFiltradas.forEach(cuenta => {
      if (
        cuenta.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cuenta.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        found.add(cuenta.codigo);
        // Expandir todos los padres
        let padre = cuenta.padre_codigo;
        while (padre) {
          found.add(padre);
          const p = cuentasFiltradas.find((c: any) => c.codigo === padre);
          padre = p?.padre_codigo;
        }
      }
    });
    setHighlight(found);
    setExpanded(prev => {
      const newSet = new Set(prev);
      found.forEach(cod => newSet.add(cod));
      return newSet;
    });
  }, [searchTerm, cuentasFiltradas]);

  // Persistencia de expansión (opcional: localStorage)
  useEffect(() => {
    const saved = localStorage.getItem("puc_expanded");
    if (saved) setExpanded(new Set(JSON.parse(saved)));
  }, []);
  useEffect(() => {
    localStorage.setItem("puc_expanded", JSON.stringify(Array.from(expanded)));
  }, [expanded]);
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
  const [filterFechaInicio, setFilterFechaInicio] = useState("");
  const [filterFechaFin, setFilterFechaFin] = useState("");
  const [fechasDisponibles, setFechasDisponibles] = useState<string[]>([]);
  const [movFilterTipoDocumento, setMovFilterTipoDocumento] = useState("");
  const [tiposDocumento, setTiposDocumento] = useState<any[]>([]);
  const [movFilterEstado, setMovFilterEstado] = useState("");
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [filterPeriodo, setFilterPeriodo] = useState("");

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

  // Cargar datos dinámicos para filtros
  useEffect(() => {
    if (activeTab === "movimientos") {
      // Fechas disponibles
      fetch("/api/contabilidad/transacciones/fechas")
        .then(res => res.ok ? res.json() : [])
        .then(data => setFechasDisponibles(Array.isArray(data) ? data : []));
      // Tipos de documento
      fetch("/api/contabilidad/tipos-transaccion")
        .then(res => res.ok ? res.json() : [])
        .then(data => setTiposDocumento(Array.isArray(data) ? data : []));
      // Periodos contables
      fetch("/api/contabilidad/periodos")
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          setPeriodos(Array.isArray(data) ? data : []);
          // Seleccionar por defecto el periodo más cercano a la fecha actual
          const hoy = new Date();
          const hoyStr = hoy.toISOString().slice(0, 10);
          const activos = (Array.isArray(data) ? data : []).filter((p: any) => p.estado === 'abierto' || p.estado === 'activo');
          let periodoCercano = null;
          if (activos.length > 0) {
            periodoCercano = activos.find((p: any) => {
              const inicio = p.fecha_inicio ? new Date(p.fecha_inicio).toISOString().slice(0, 10) : null;
              const fin = p.fecha_fin ? new Date(p.fecha_fin).toISOString().slice(0, 10) : (p.fecha_cierre ? new Date(p.fecha_cierre).toISOString().slice(0, 10) : null);
              return inicio && fin && hoyStr >= inicio && hoyStr <= fin;
            });
            // Si no hay periodo que contenga la fecha actual, seleccionar el más reciente activo
            if (!periodoCercano) {
              activos.sort((a: any, b: any) => (b.anio || b.ano) - (a.anio || a.ano) || b.mes - a.mes);
              periodoCercano = activos[0];
            }
            if (periodoCercano) {
              setFilterPeriodo(periodoCercano.id);
            }
          }
        });
    }
  }, [activeTab]);

  // Cuando cambia la fecha, seleccionar el periodo correspondiente
  useEffect(() => {
    if (filterFechaInicio && periodos.length > 0) {
      const fecha = new Date(filterFechaInicio);
      const periodoEncontrado = periodos.find((p: any) => {
        const inicio = new Date(p.fechaInicio || p.fecha_inicio);
        const cierre = new Date(p.fechaCierre || p.fecha_cierre);
        return fecha >= inicio && fecha <= cierre;
      });
      if (periodoEncontrado) {
        setFilterPeriodo(periodoEncontrado.id);
      }
    }
  }, [filterFechaInicio, periodos]);

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
  }, [activeTab]);

  // Nueva función para buscar movimientos solo al presionar Buscar
  const buscarMovimientos = () => {
    setLoadingMov(true);
    const params = new URLSearchParams({
      page: movPage.toString(),
      pageSize: movPageSize.toString(),
  ...(filterFechaInicio ? { fechaInicio: filterFechaInicio } : {}),
  ...(filterFechaFin ? { fechaFin: filterFechaFin } : {}),
      ...(movFilterTipoDocumento ? { tipoDocumento: movFilterTipoDocumento } : {}),
      ...(movFilterEstado ? { estado: movFilterEstado } : {}),
      ...(filterPeriodo ? { periodo_id: filterPeriodo } : {}),
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
  };

    return (
      <div className="flex h-screen">
        <SidebarNew />
        <div className="flex-1 flex flex-col">
          <TopNavigation title="Contabilidad" />
          <main className="flex-1 p-8 overflow-auto">
        {/*<h1 className="text-2xl font-bold mb-4">Contabilidad</h1>*/}
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
              {/* Selector de rango de fechas con etiquetas */}
              <label className="flex flex-col text-xs font-semibold text-gray-700">
                Fecha inicio
                <input
                  type="date"
                  value={filterFechaInicio}
                  onChange={e => { setFilterFechaInicio(e.target.value); setMovPage(1); }}
                  className="border p-2 rounded min-w-[140px]"
                  placeholder="Fecha inicio"
                  max={filterFechaFin || undefined}
                  min={fechasDisponibles.length > 0 ? fechasDisponibles[0] : undefined}
                />
              </label>
              <span className="mx-1 self-end pb-2">a</span>
              <label className="flex flex-col text-xs font-semibold text-gray-700">
                Fecha fin
                <input
                  type="date"
                  value={filterFechaFin}
                  onChange={e => { setFilterFechaFin(e.target.value); setMovPage(1); }}
                  className="border p-2 rounded min-w-[140px]"
                  placeholder="Fecha fin"
                  min={filterFechaInicio || (fechasDisponibles.length > 0 ? fechasDisponibles[0] : undefined)}
                  max={fechasDisponibles.length > 0 ? fechasDisponibles[fechasDisponibles.length - 1] : undefined}
                />
              </label>
              {/* Filtro por periodo contable con etiqueta */}
              <label className="flex flex-col text-xs font-semibold text-gray-700">
                Periodo contable
                <select value={filterPeriodo} onChange={e => { setFilterPeriodo(e.target.value); setMovPage(1); }} className="border p-2 rounded min-w-[160px]">
                  <option value="">Todos los periodos</option>
                  {periodos.map((p: any) => {
                    const mes = String(p.mes).padStart(2, '0');
                    const anio = p.anio || p.ano;
                    let tipo = '';
                    if ((p.tipo || '').toLowerCase().includes('cierre') || (p.estado || '').toLowerCase().includes('cierre')) {
                      tipo = ' (Cierre)';
                    } else if ((p.tipo || '').toLowerCase().includes('ajuste')) {
                      tipo = ' (Ajuste)';
                    }
                    return (
                      <option key={p.id} value={p.id}>
                        {anio}-{mes}{tipo}
                      </option>
                    );
                  })}
                </select>
              </label>
              {/* Filtro por tipo de documento dinámico con etiqueta */}
              <label className="flex flex-col text-xs font-semibold text-gray-700">
                Tipo de documento
                <select value={movFilterTipoDocumento} onChange={e => { setMovFilterTipoDocumento(e.target.value); setMovPage(1); }} className="border p-2 rounded min-w-[160px]">
                  <option value="">Tipo de documento</option>
                  {tiposDocumento.map((t: any) => (
                    <option key={t.id} value={t.nombre}>{t.nombre}</option>
                  ))}
                </select>
              </label>
              {/* Filtro por estado fijo con etiqueta */}
              <label className="flex flex-col text-xs font-semibold text-gray-700">
                Estado
                <select value={movFilterEstado} onChange={e => { setMovFilterEstado(e.target.value); setMovPage(1); }} className="border p-2 rounded min-w-[160px]">
                  <option value="">Estado</option>
                  <option value="anulado">Anulado</option>
                  <option value="borrador">Borrador</option>
                  <option value="contabilizado">Contabilizado</option>
                </select>
              </label>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded" onClick={() => { setMovPage(1); buscarMovimientos(); }}>Buscar</button>
            </div>
            {loadingMov ? (
              <div className="text-gray-500">Cargando movimientos...</div>
            ) : errorMov ? (
              <div className="text-red-500">{errorMov}</div>
            ) : movimientos.length === 0 ? (
              <div className="text-center text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-4 my-4">
                {movFilterTipoDocumento ? (
                  <>
                    No se encontraron transacciones para el tipo de documento seleccionado.
                    <br />
                    <span>Prueba seleccionando otro tipo de documento o ajusta los filtros.</span>
                  </>
                ) : (
                  <>
                    No se encontraron transacciones para los filtros seleccionados.
                    <br />
                    {filterPeriodo && (
                      <span>Para el periodo seleccionado no existen transacciones en la base de datos.</span>
                    )}
                    {!filterPeriodo && (filterFechaInicio || filterFechaFin) && (
                      <span>No existen transacciones para el rango de fechas seleccionado.</span>
                    )}
                  </>
                )}
              </div>
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
                    {/* Debug solo en consola, no en el DOM */}
                    {(() => { console.log('DEBUG movimientos:', movimientos); return null; })()}
                    {movimientos.map((mov: any) => {
                      const totalDebito = mov.detalles?.reduce((sum: number, m: any) => sum + (typeof m.debito === 'number' ? m.debito : Number(m.debito) || 0), 0) || 0;
                      const totalCredito = mov.detalles?.reduce((sum: number, m: any) => sum + (typeof m.credito === 'number' ? m.credito : Number(m.credito) || 0), 0) || 0;
                      // Nombre de tercero: busca el primero con nombre, si no muestra el ID
                      let nombreTercero = "-";
                      if (mov.detalles?.length) {
                        const movTercero = mov.detalles.find((m: any) => m.tercero?.razonSocial || m.tercero_nombre || m.terceroRazonSocial);
                        if (movTercero) {
                          nombreTercero = movTercero.tercero?.razonSocial || movTercero.tercero_nombre || movTercero.terceroRazonSocial || movTercero.tercero_id || "-";
                        } else {
                          // Si ninguno tiene nombre, mostrar el ID del primero
                          nombreTercero = mov.detalles[0].tercero_id || "-";
                        }
                      }
                      return (
                        <tr key={mov.id}>
                          <td className="border px-2 py-1">{mov.tipoTransaccion || "-"}</td>
                          <td className="border px-2 py-1">{mov.fecha ? mov.fecha.slice(0, 10) : '-'}</td>
                          <td className="border px-2 py-1">{mov.numeroComprobante}</td>
                          <td className="border px-2 py-1">{Number(totalDebito).toLocaleString()}</td>
                          <td className="border px-2 py-1">{Number(totalCredito).toLocaleString()}</td>
                          <td className="border px-2 py-1">{nombreTercero}</td>
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
              <input
                value={inputCodigo}
                onChange={e => setInputCodigo(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === 'Tab') setFilterCodigo(inputCodigo);
                }}
                placeholder="Filtrar por código"
                className="border p-2 rounded"
              />
              <input
                value={inputNombre}
                onChange={e => setInputNombre(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === 'Tab') setFilterNombre(inputNombre);
                }}
                placeholder="Filtrar por nombre"
                className="border p-2 rounded"
              />
              <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} className="border p-2 rounded">
                <option value="">Tipo</option>
                <option value="activo">Activo</option>
                <option value="pasivo">Pasivo</option>
                <option value="patrimonio">Patrimonio</option>
                <option value="ingreso">Ingreso</option>
                <option value="gasto">Gasto</option>
                <option value="orden">Orden</option>
              </select>
              <input
                value={inputNivel}
                onChange={e => setInputNivel(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === 'Tab') setFilterNivel(inputNivel);
                }}
                placeholder="Nivel"
                type="number"
                min="1"
                className="border p-2 rounded"
              />
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
                <PUCTreeTable
                  data={buildCuentaTree(cuentasFiltradas)}
                  expanded={expanded}
                  onToggle={codigo => setExpanded(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(codigo)) newSet.delete(codigo); else newSet.add(codigo);
                    return newSet;
                  })}
                  onEdit={cuenta => { setEditCuenta(cuenta); setShowEditModal(true); }}
                  onDelete={cuenta => { setDeleteCuenta(cuenta); setShowDeleteModal(true); }}
                  searchTerm={searchTerm}
                  highlight={highlight}
                />
              </div>
            )}
            {/* Modal crear cuenta (nuevo UX/UI) */}
            {showCreateModal && (
              <ModalCrearCuentaPUC
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={() => {
                  setLoadingPuc(true);
                  fetch("/api/contabilidad/puc")
                    .then((res) => res.json())
                    .then((data) => setPuc(data))
                    .finally(() => setLoadingPuc(false));
                }}
                puc={puc}
              />
            )}
            {/* Modal editar cuenta */}
            {showEditModal && editCuenta && (
              <ModalCrearCuentaPUC
                isOpen={showEditModal}
                onClose={() => { setShowEditModal(false); setEditCuenta(null); }}
                onCreated={() => {
                  setLoadingPuc(true);
                  fetch("/api/contabilidad/puc")
                    .then((res) => res.json())
                    .then((data) => setPuc(data))
                    .finally(() => setLoadingPuc(false));
                  setShowEditModal(false);
                  setEditCuenta(null);
                }}
                puc={puc}
                initialValues={editCuenta}
                isEdit={true}
              />
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
            <div className="mb-6 flex gap-4 border-b pb-2">
              <button className={`px-4 py-2 rounded-t font-semibold ${configTab === 'tipos' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`} onClick={() => setConfigTab('tipos')}>Tipos de Transacción</button>
              <button className={`px-4 py-2 rounded-t font-semibold ${configTab === 'prefijos' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`} onClick={() => setConfigTab('prefijos')}>Prefijos</button>
              <button className={`px-4 py-2 rounded-t font-semibold ${configTab === 'centros' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`} onClick={() => setConfigTab('centros')}>Centros de Costo</button>
            </div>
            {configTab === 'tipos' && <TiposTransaccionConfig />}
            {configTab === 'prefijos' && <PrefijosConfig />}
            {configTab === 'centros' && <CentrosCostoConfig />}
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
                numero: `${data.prefijo}-${data.numeracion}`,
                tipo: data.tipo || "manual",
                fecha: data.fecha ? (typeof data.fecha === 'string' ? data.fecha : data.fecha.toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10),
                descripcion: data.descripcion,
                usuario_id: 3, // Cambia por el usuario real si lo tienes
                estado: data.estado || 'borrador',
                periodo_id: data.periodo_id || undefined,
                movimientos: (data.movimientos || []).map((m: any) => ({
                  cuenta_id: m.cuenta_id,
                  tercero_id: m.tercero_id,
                  documentoCruce: m.documentoCruce,
                  comentario: m.comentario,
                  descripcion: m.descripcion,
                  debito: Number(m.debito),
                  credito: Number(m.credito),
                }))
              };
              await fetch('/api/contabilidad/comprobantes', {
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
            periodos={periodos}
          />
        )}
        </main>
      </div>
    </div>
  );
}

export default Contabilidad;
