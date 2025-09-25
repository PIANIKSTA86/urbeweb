/* global fetch, localStorage */
import React, { useState } from "react";
import BalancePruebaModal from "./BalancePruebaModal";
import { ReporteDef } from "./reportesData";

interface Props {
  reporte: ReporteDef;
  onClose: () => void;
}


// Hook para buscar cuentas en el backend
function useCuentasPUC(busqueda: string) {
  const [cuentas, setCuentas] = React.useState<{ codigo: string; nombre: string }[]>([]);
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    let ignore = false;
    async function fetchCuentas() {
      setLoading(true);
      try {
        const url = busqueda && busqueda.trim() !== "" ? `/api/contabilidad/puc?search=${encodeURIComponent(busqueda)}` : "/api/contabilidad/puc";
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error al consultar cuentas");
        const data = await res.json();
        if (!ignore) setCuentas(data.map((c: any) => ({ codigo: c.codigo, nombre: c.nombre })));
      } catch {
        if (!ignore) setCuentas([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchCuentas();
    return () => { ignore = true; };
  }, [busqueda]);
  return { cuentas, loading };
}



// Hook para buscar terceros en el backend, enviando token si existe
function useTerceros(busqueda: string) {
  const [terceros, setTerceros] = React.useState<{ nit: string; nombre: string }[]>([]);
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    let ignore = false;
    async function fetchTerceros() {
      setLoading(true);
      try {
        const url = busqueda && busqueda.trim() !== "" ? `/api/terceros?busqueda=${encodeURIComponent(busqueda)}` : "/api/terceros?limite=20";
        const token = localStorage.getItem("auth_token");
        const res = await fetch(url, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Error al consultar terceros");
        const data = await res.json();
  // data puede ser { terceros: [...] } o array plano
  let lista = Array.isArray(data) ? data : (data.terceros || data.data || []);
  if (!ignore) setTerceros(lista.map((t: any) => ({ nit: t.nit || t.numeroIdentificacion || t.id, nombre: t.razonSocial || (t.primerNombre ? `${t.primerNombre} ${t.primerApellido || ''}`.trim() : t.numeroIdentificacion) })));
      } catch {
        if (!ignore) setTerceros([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchTerceros();
    return () => { ignore = true; };
  }, [busqueda]);
  return { terceros, loading };
}


// Hook para buscar centros de costo en el backend
function useCentrosCosto(busqueda: string) {
  const [centros, setCentros] = React.useState<{ codigo: string; nombre: string }[]>([]);
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    let ignore = false;
    async function fetchCentros() {
      setLoading(true);
      try {
        // No hay búsqueda en backend, filtrar en frontend
        const res = await fetch("/api/contabilidad/centros-costo");
        if (!res.ok) throw new Error("Error al consultar centros de costo");
        const data = await res.json();
        let lista = Array.isArray(data) ? data : (data.data || []);
        if (!ignore) setCentros(lista.map((c: any) => ({ codigo: c.codigo || c.id, nombre: c.nombre })));
      } catch {
        if (!ignore) setCentros([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchCentros();
    return () => { ignore = true; };
  }, []);
  // Filtrar en frontend
  const centrosFiltrados = centros.filter(c =>
    String(c.codigo || "").includes(busqueda) || String(c.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
  );
  return { centros: centrosFiltrados, loading };
}

const ReporteFiltroModal: React.FC<Props> = ({ reporte, onClose }) => {
  const [mostrarTerceros, setMostrarTerceros] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [formato, setFormato] = useState("pantalla");

  const [todosCentros, setTodosCentros] = useState(true);
  const [nivel, setNivel] = useState(0);
  const [centro, setCentro] = useState("");
  const [busquedaCentro, setBusquedaCentro] = useState("");
  const { centros: centrosFiltrados, loading: loadingCentros } = useCentrosCosto(busquedaCentro);

  const [todasCuentas, setTodasCuentas] = useState(true);
  const [cuenta, setCuenta] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const { cuentas: cuentasFiltradas, loading: loadingCuentas } = useCuentasPUC(busqueda);


  const [todosTerceros, setTodosTerceros] = useState(true);
  const [tercero, setTercero] = useState("");
  const [busquedaTercero, setBusquedaTercero] = useState("");
  const { terceros, loading: loadingTerceros } = useTerceros(busquedaTercero);
  const tercerosFiltrados = terceros.filter(t =>
    String(t.nit || "").includes(busquedaTercero) || String(t.nombre || "").toLowerCase().includes(busquedaTercero.toLowerCase())
  );

  const [periodo, setPeriodo] = useState("anual");
  const [anio, setAnio] = useState("");
  const [periodoContable, setPeriodoContable] = useState("");
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");

  // Hook para obtener años únicos de periodos contables
  function useAniosPeriodos() {
    const [anios, setAnios] = React.useState<string[]>([]);
    React.useEffect(() => {
      fetch("/api/contabilidad/periodos")
        .then(res => res.json())
        .then((data) => {
          // data puede ser array de periodos con campo 'ano'
          const aniosUnicos = Array.from(new Set((Array.isArray(data) ? data : []).map((p: any) => String(p.ano)))).sort((a, b) => b.localeCompare(a));
          setAnios(aniosUnicos);
        })
        .catch(() => setAnios([]));
    }, []);
    return anios;
  }

  const aniosDisponibles = useAniosPeriodos();

  // Hook para obtener periodos contables desde la API
  function usePeriodosContables() {
    const [periodos, setPeriodos] = React.useState<{ id: string; nombre: string }[]>([]);
    React.useEffect(() => {
      fetch("/api/contabilidad/periodos")
        .then(res => res.json())
        .then((data) => {
          // data puede ser array de periodos con campos 'id', 'nombre', 'mes', 'ano'
          const periodosOrdenados = (Array.isArray(data) ? data : [])
            .map((p: any) => ({
              id: p.id,
              nombre: p.nombre || `${p.mes?.toString().padStart(2, "0") || ""}/${p.ano || ""}`
            }))
            .sort((a, b) => b.nombre.localeCompare(a.nombre));
          setPeriodos(periodosOrdenados);
        })
        .catch(() => setPeriodos([]));
    }, []);
    return periodos;
  }

  const periodosContables = usePeriodosContables();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResultado(null);
    setShowResult(false);
    try {
      // Construir body con los parámetros esperados por el backend
      let fecha_inicio = "";
      let fecha_fin = "";
      if (periodo === "anual" && anio) {
        fecha_inicio = `${anio}-01-01`;
        fecha_fin = `${anio}-12-31`;
      } else if (periodo === "periodo" && periodoContable) {
        // Si tienes la fecha en el periodo, úsala; si no, puedes pedirla al backend
        // Aquí solo se envía el id del periodo, el backend debe resolver fechas
        // Para pruebas, puedes dejar vacío y el backend lo maneja
      } else if (periodo === "rango" && fechaInicial && fechaFinal) {
        fecha_inicio = fechaInicial;
        fecha_fin = fechaFinal;
      }
      const body = {
        fecha_inicio,
        fecha_fin,
        cuenta_filtro: !todasCuentas && cuenta ? cuenta.split(" - ")[0] : null,
        nivel: nivel || 1,
        mostrar_terceros: mostrarTerceros ? 1 : 0,
        tercero_id: !todosTerceros && tercero ? tercero.split(" - ")[0] : null,
        centro_costo_id: !todosCentros && centro ? centro.split(" - ")[0] : null,
        formato
      };
      if (reporte.key === "balance-prueba" && (formato === "excel" || formato === "pdf")) {
        const res = await fetch(`/api/reportes/balance-prueba`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error("Error al exportar el balance de prueba");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = formato === "excel" ? "balance_prueba.xlsx" : "balance_prueba.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setLoading(false);
        return;
      } else if (reporte.key === "balance-prueba" && formato === "pantalla") {
        const res = await fetch(`/api/reportes/balance-prueba`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error("Error al consultar el balance de prueba");
        const data = await res.json();
        setResultado(data);
        setShowResult(true);
      } else {
        setError("Solo disponible para Balance de Prueba");
      }
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded shadow-lg p-6 w-full max-w-2xl relative overflow-y-auto max-h-[90vh]">
          <button className="absolute top-2 right-2 text-gray-500 text-2xl" onClick={onClose}>×</button>
          <h2 className="text-lg font-bold mb-2">{reporte.nombre}</h2>
          <p className="mb-2 text-gray-700 text-sm">{reporte.descripcion}</p>
          {/* Filtros de reportes */}
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        {/* Tipo de reporte */}
        <div className="col-span-1">
          <label className="block font-medium mb-1 text-xs">Tipo de reporte</label>
          <select className="w-full border rounded px-2 py-1 text-sm">
            <option value="cuentas">Por cuentas</option>
            <option value="terceros">Por terceros</option>
            <option value="unidad">Por unidad</option>
          </select>
        </div>
        {/* Nivel de cuentas */}
        <div className="col-span-1">
          <label className="block font-medium mb-1 text-xs">Nivel de cuentas</label>
          <select className="w-full border rounded px-2 py-1 text-sm" value={nivel} onChange={e => setNivel(Number(e.target.value))}>
            <option value={0}>Todos los niveles</option>
            <option value={1}>Nivel 1</option>
            <option value={2}>Nivel 2</option>
            <option value={3}>Nivel 3</option>
            <option value={4}>Nivel 4</option>
            <option value={5}>Nivel 5</option>
          </select>
        </div>
        {/* Selector cuentas contables */}
        <div className="col-span-1 flex flex-col">
          <label className="flex items-center text-xs mb-1">
            <input
              type="checkbox"
              className="mr-2"
              checked={todasCuentas}
              onChange={e => setTodasCuentas(e.target.checked)}
            />
            Todas las cuentas contables
          </label>
          <input
            type="text"
            className="w-full border rounded px-2 py-1 text-sm"
            placeholder={loadingCuentas ? "Cargando cuentas..." : "Buscar o seleccionar cuenta..."}
            value={cuenta}
            onChange={e => setCuenta(e.target.value)}
            disabled={todasCuentas}
            onFocus={() => setBusqueda("")}
            onInput={e => setBusqueda(e.currentTarget.value)}
            list="cuentas-list"
            autoComplete="off"
          />
          {!todasCuentas && (
            <datalist id="cuentas-list">
              {cuentasFiltradas.map(c => (
                <option key={c.codigo} value={`${c.codigo} - ${c.nombre}`} />
              ))}
            </datalist>
          )}
        </div>
        {/* Selector terceros */}
        <div className="col-span-1 flex flex-col">
          <label className="flex items-center text-xs mb-1">
            <input
              type="checkbox"
              className="mr-2"
              checked={todosTerceros}
              onChange={e => setTodosTerceros(e.target.checked)}
            />
            Todos los terceros
          </label>
          <input
            type="text"
            className="w-full border rounded px-2 py-1 text-sm"
            placeholder={loadingTerceros ? "Cargando terceros..." : "Buscar o seleccionar tercero (NIT o nombre)..."}
            value={tercero}
            onChange={e => setTercero(e.target.value)}
            disabled={todosTerceros}
            onFocus={() => setBusquedaTercero("")}
            onInput={e => setBusquedaTercero(e.currentTarget.value)}
            list="terceros-list"
            autoComplete="off"
          />
          {!todosTerceros && (
            <datalist id="terceros-list">
              {tercerosFiltrados.map(t => (
                <option key={t.nit} value={`${t.nit} - ${t.nombre}`} />
              ))}
            </datalist>
          )}
        </div>
        {/* Selector centro de costo */}
        <div className="col-span-1 flex flex-col">
          <label className="flex items-center text-xs mb-1">
            <input
              type="checkbox"
              className="mr-2"
              checked={todosCentros}
              onChange={e => setTodosCentros(e.target.checked)}
            />
            Todos los centros de costo
          </label>
          <input
            type="text"
            className="w-full border rounded px-2 py-1 text-sm"
            placeholder={loadingCentros ? "Cargando centros..." : "Buscar o seleccionar centro..."}
            value={centro}
            onChange={e => setCentro(e.target.value)}
            disabled={todosCentros}
            onFocus={() => setBusquedaCentro("")}
            onInput={e => setBusquedaCentro(e.currentTarget.value)}
            list="centros-list"
            autoComplete="off"
          />
          {!todosCentros && (
            <datalist id="centros-list">
              {centrosFiltrados.map(c => (
                <option key={c.codigo} value={`${c.codigo} - ${c.nombre}`} />
              ))}
            </datalist>
          )}
        </div>
        {/* Checks agrupados */}
        <div className="col-span-1 flex flex-col space-y-2">
          <label className="flex items-center text-xs">
            <input type="checkbox" className="mr-1" />
            Incluir código cuentas
          </label>
          <label className="flex items-center text-xs">
            <input
              type="checkbox"
              className="mr-1"
              checked={mostrarTerceros}
              onChange={e => setMostrarTerceros(e.target.checked)}
            />
            Incluir terceros
          </label>
        </div>
        {/* Selector periodo de fecha */}
        <div className="col-span-1 flex flex-col">
          <label className="block font-medium mb-1 text-xs">Periodo de consulta</label>
          <select
            className="w-full border rounded px-2 py-1 text-sm mb-1"
            value={periodo}
            onChange={e => setPeriodo(e.target.value)}
          >
            <option value="anual">Anual</option>
            <option value="periodo">Por periodo contable</option>
            <option value="rango">Por rango de fecha</option>
          </select>
          {periodo === "anual" && (
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={anio}
              onChange={e => setAnio(e.target.value)}
            >
              <option value="">Seleccione año</option>
              {aniosDisponibles.length === 0 && <option disabled>Cargando años...</option>}
              {aniosDisponibles.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          )}
          {periodo === "periodo" && (
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={periodoContable}
              onChange={e => setPeriodoContable(e.target.value)}
            >
              <option value="">Seleccione periodo contable</option>
              {periodosContables.length === 0 && <option disabled>Cargando periodos...</option>}
              {periodosContables.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          )}
          {periodo === "rango" && (
            <div className="flex flex-row gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs">Fecha inicial</label>
                <input
                  type="date"
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={fechaInicial}
                  onChange={e => setFechaInicial(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs">Fecha final</label>
                <input
                  type="date"
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={fechaFinal}
                  onChange={e => setFechaFinal(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
        {/* Selector formato de visualizacion */}
        <div className="col-span-1">
          <label className="block font-medium mb-1 text-xs">Formato de visualizacion</label>
          <select className="w-full border rounded px-2 py-1 text-sm" value={formato} onChange={e => setFormato(e.target.value)}>
            <option value="pantalla">Pantalla</option>
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
          </select>
        </div>
        <div className="col-span-1 md:col-span-2">
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded w-full" disabled={loading}>
            {loading ? "Generando..." : "Generar reporte"}
          </button>
        </div>
        {error && <div className="col-span-2 text-red-600 text-xs mt-2">{error}</div>}
      </form>
        </div>
      </div>
      {showResult && resultado && reporte.key === "balance-prueba" && (
  <BalancePruebaModal data={resultado} onClose={() => setShowResult(false)} nivel={nivel} />
      )}
    </>
  );
};

export default ReporteFiltroModal;
