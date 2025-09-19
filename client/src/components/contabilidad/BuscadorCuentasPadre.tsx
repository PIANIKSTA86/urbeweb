/* global setTimeout */
import { useBuscarCuentas, Cuenta } from "./useBuscarCuentas";
import React from "react";

export interface BuscadorCuentasPadreProps {
  value: Cuenta | null;
  onSelect: (cuenta: Cuenta | null) => void;
  placeholder?: string;
}

export const BuscadorCuentasPadre: React.FC<BuscadorCuentasPadreProps> = ({ value, onSelect, placeholder }) => {
  const [input, setInput] = React.useState(value ? `${value.codigo} - ${value.nombre}` : "");
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [highlighted, setHighlighted] = React.useState<number>(-1);
  const [error, setError] = React.useState<string>("");
  const ref = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const { data, loading, noResults } = useBuscarCuentas(search);

  // Mostrar todas las cuentas, pero solo permitir seleccionar nivel 1 a 4
  const cuentasFiltradas = data;

  React.useEffect(() => {
    setInput(value ? `${value.codigo} - ${value.nombre}` : "");
  }, [value]);

  return (
    <div className="relative" ref={ref}>
      <input
        className="w-full border rounded px-2 py-1"
        value={input}
        placeholder={placeholder}
        onChange={e => {
          setInput(e.target.value);
          setSearch(e.target.value);
          setOpen(true);
          setError("");
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {error && (
        <div className="text-red-500 text-xs px-2 py-1">{error}</div>
      )}
      {open && (
        <div ref={listRef} className="absolute z-20 bg-white border rounded shadow max-h-60 overflow-auto" style={{ minWidth: 320, width: '100%' }}>
          {loading && <div className="px-2 py-1 text-gray-500">Buscando...</div>}
          {!loading && noResults && <div className="px-2 py-1 text-gray-500">Sin resultados</div>}
          {!loading && cuentasFiltradas.map((cuenta, idx) => (
            <div
              key={cuenta.id}
              data-idx={idx}
              className={`px-2 py-1 cursor-pointer text-sm ${highlighted === idx ? 'bg-blue-100' : 'hover:bg-blue-100'}`}
              onMouseDown={() => {
                if (cuenta.nivel < 1 || cuenta.nivel > 4) {
                  setError("Solo se pueden seleccionar cuentas de nivel 1 a 4 como padre.");
                  return;
                }
                setInput(`${cuenta.codigo} - ${cuenta.nombre}`);
                setOpen(false);
                setError("");
                onSelect(cuenta);
              }}
              onMouseEnter={() => setHighlighted(idx)}
            >
              <span className="font-mono text-xs text-gray-700">{cuenta.codigo}</span> - {cuenta.nombre}
              {cuenta.nivel === 5 && (
                <span className="ml-2 text-xs text-red-400">(nivel 5)</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
