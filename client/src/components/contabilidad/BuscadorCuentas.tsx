/* global document, setTimeout */
import React, { useState, useRef } from "react";
import { useBuscarCuentas, Cuenta } from "./useBuscarCuentas";

export interface BuscadorCuentasProps {
  value: Cuenta | null;
  onSelect: (cuenta: Cuenta | null) => void;
  placeholder?: string;
  onCrearCuenta?: (codigo: string) => void;
}

export const BuscadorCuentas: React.FC<BuscadorCuentasProps> = (props) => {
  const {
    value,
    onSelect,
    placeholder = "Buscar cuenta por código o nombre",
    onCrearCuenta
  } = props;
  const [input, setInput] = useState(value ? `${value.codigo} - ${value.nombre}` : "");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState<number>(-1);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { data, loading, noResults } = useBuscarCuentas(search);
  const [error, setError] = useState<string>("");

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  React.useEffect(() => {
    if (value) setInput(`${value.codigo} - ${value.nombre}`);
  }, [value]);

  return (
    <div ref={ref} className="relative" style={{ minWidth: 320, width: '100%' }}>
      <input
        className="border rounded px-2 py-1"
        style={{ minWidth: 320, width: '100%' }}
        value={input}
        placeholder={placeholder}
        onChange={e => {
          setInput(e.target.value);
          setSearch(e.target.value);
          setOpen(true);
          setHighlighted(-1);
          onSelect(null);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
        onKeyDown={e => {
          if (e.key === 'Enter') {
            // Si hay un ítem resaltado, selecciona normalmente
            if (open && data.length > 0 && highlighted >= 0 && highlighted < data.length) {
        const selectedCuenta = data[highlighted];
        if (selectedCuenta.nivel !== 5) {
          setError("Solo se pueden seleccionar cuentas de nivel 5.");
          return;
        }
        setInput(`${selectedCuenta.codigo} - ${selectedCuenta.nombre}`);
        setOpen(false);
        setError("");
        onSelect(selectedCuenta);
        return;
            }
            // Si no hay coincidencia exacta y el input es código válido, dispara creación
            const codigoInput = input.trim();
            const existe = data.some(c => c.codigo === codigoInput);
            if (!existe && codigoInput.length > 0 && codigoInput.length <= 8 && codigoInput.length % 2 === 0 && /^\d+$/.test(codigoInput)) {
              if (onCrearCuenta) onCrearCuenta(codigoInput);
              return;
            }
          }
          if (!open || data.length === 0) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlighted(h => Math.min(h + 1, data.length - 1));
            setTimeout(() => {
              if (listRef.current) {
                const el = listRef.current.querySelectorAll('div[data-idx]')[highlighted + 1];
                if (el) el.scrollIntoView({ block: 'nearest' });
              }
            }, 0);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlighted(h => Math.max(h - 1, 0));
            setTimeout(() => {
              if (listRef.current) {
                const el = listRef.current.querySelectorAll('div[data-idx]')[highlighted - 1];
                if (el) el.scrollIntoView({ block: 'nearest' });
              }
            }, 0);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
      />
      {error && (
        <div className="text-red-500 text-xs px-2 py-1">{error}</div>
      )}
      {open && (
        <div ref={listRef} className="absolute z-20 bg-white border rounded shadow max-h-60 overflow-auto" style={{ minWidth: 320, width: '100%' }}>
          {loading && <div className="px-2 py-1 text-gray-500">Buscando...</div>}
          {!loading && noResults && <div className="px-2 py-1 text-gray-500">Sin resultados</div>}
          {!loading && data.map((cuenta, idx) => (
            <div
              key={cuenta.id}
              data-idx={idx}
              className={`px-2 py-1 cursor-pointer text-sm ${highlighted === idx ? 'bg-blue-100' : 'hover:bg-blue-100'}`}
              onMouseDown={() => {
                if (cuenta.nivel !== 5) {
                  setError("Solo se pueden seleccionar cuentas de nivel 5.");
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}