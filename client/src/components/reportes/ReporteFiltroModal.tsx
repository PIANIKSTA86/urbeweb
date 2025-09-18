import React, { useState } from "react";
import { ReporteDef } from "./reportesData";

interface Props {
  reporte: ReporteDef;
  onClose: () => void;
}

const cuentasEjemplo = [
  { codigo: "110505", nombre: "Caja General" },
  { codigo: "130505", nombre: "Clientes Nacionales" },
  { codigo: "220505", nombre: "Proveedores Nacionales" },
  // ...simular más cuentas si se requiere
];


const tercerosEjemplo = [
  { nit: "900123456", nombre: "Juan Pérez" },
  { nit: "800987654", nombre: "Comercial XYZ S.A.S." },
  { nit: "123456789", nombre: "María López" },
  // ...simular más terceros si se requiere
];

const centrosEjemplo = [
  { codigo: "01", nombre: "Administración" },
  { codigo: "02", nombre: "Mantenimiento" },
  { codigo: "03", nombre: "Servicios Generales" },
  // ...simular más centros si se requiere
];

const ReporteFiltroModal: React.FC<Props> = ({ reporte, onClose }) => {
  const [todosCentros, setTodosCentros] = useState(true);
  const [centro, setCentro] = useState("");
  const [busquedaCentro, setBusquedaCentro] = useState("");
  const centrosFiltrados = centrosEjemplo.filter(c =>
    c.codigo.includes(busquedaCentro) || c.nombre.toLowerCase().includes(busquedaCentro.toLowerCase())
  );
  const [todasCuentas, setTodasCuentas] = useState(true);
  const [cuenta, setCuenta] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const cuentasFiltradas = cuentasEjemplo.filter(c =>
    c.codigo.includes(busqueda) || c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const [todosTerceros, setTodosTerceros] = useState(true);
  const [tercero, setTercero] = useState("");
  const [busquedaTercero, setBusquedaTercero] = useState("");
  const tercerosFiltrados = tercerosEjemplo.filter(t =>
    t.nit.includes(busquedaTercero) || t.nombre.toLowerCase().includes(busquedaTercero.toLowerCase())
  );

  const [periodo, setPeriodo] = useState("anual");
  const [anio, setAnio] = useState("");
  const [periodoContable, setPeriodoContable] = useState("");
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const aniosDisponibles = ["2025", "2024", "2023", "2022"]; // Simulado, conectar a BDD
  const periodosContables = [
    { id: "2025-01", nombre: "Enero 2025" },
    { id: "2025-02", nombre: "Febrero 2025" },
    { id: "2024-12", nombre: "Diciembre 2024" },
    // ...simular más periodos si se requiere
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-2xl relative overflow-y-auto max-h-[90vh]">
        <button className="absolute top-2 right-2 text-gray-500 text-2xl" onClick={onClose}>×</button>
        <h2 className="text-lg font-bold mb-2">{reporte.nombre}</h2>
        <p className="mb-2 text-gray-700 text-sm">{reporte.descripcion}</p>
        {/* Filtros de reportes */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <select className="w-full border rounded px-2 py-1 text-sm">
            <option value="">Todos los niveles</option>
            <option value="1">Nivel 1</option>
            <option value="2">Nivel 2</option>
            <option value="3">Nivel 3</option>
            <option value="4">Nivel 4</option>
            <option value="5">Nivel 5</option>
            <option value="6">Nivel 6</option>
            <option value="7">Nivel 7</option>
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
            placeholder="Buscar o seleccionar cuenta..."
            value={cuenta}
            onChange={e => setCuenta(e.target.value)}
            disabled={todasCuentas}
            onFocus={() => setBusqueda("")}
            onInput={e => setBusqueda(e.currentTarget.value)}
            list="cuentas-list"
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
            placeholder="Buscar o seleccionar tercero (NIT o nombre)..."
            value={tercero}
            onChange={e => setTercero(e.target.value)}
            disabled={todosTerceros}
            onFocus={() => setBusquedaTercero("")}
            onInput={e => setBusquedaTercero(e.currentTarget.value)}
            list="terceros-list"
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
            placeholder="Buscar o seleccionar centro..."
            value={centro}
            onChange={e => setCentro(e.target.value)}
            disabled={todosCentros}
            onFocus={() => setBusquedaCentro("")}
            onInput={e => setBusquedaCentro(e.currentTarget.value)}
            list="centros-list"
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
            <input type="checkbox" className="mr-1" />
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
        {/* Selector formato de salida */}
        <div className="col-span-1">
          <label className="block font-medium mb-1 text-xs">Formato de salida</label>
          <select className="w-full border rounded px-2 py-1 text-sm">
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
          </select>
        </div>
        <div className="col-span-1 md:col-span-2">
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded w-full">Generar reporte</button>
        </div>
      </form>
    </div>
  </div>

  );
};

export default ReporteFiltroModal;
