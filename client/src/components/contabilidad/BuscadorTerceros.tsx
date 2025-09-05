import React, { useState, useRef } from "react";

export interface Tercero {
  id: number;
  numeroIdentificacion: string;
  razonSocial: string;
}

export function useBuscarTerceros(query: string) {
  const [data, setData] = useState<Tercero[]>([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  React.useEffect(() => {
    if (!query) {
      setData([]);
      setNoResults(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    fetch(`/api/terceros?busqueda=${encodeURIComponent(query)}&limite=20`, { signal: controller.signal, headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } })
      .then(res => res.json())
      .then((res: any) => {
        setData(res.terceros?.slice(0, 20) || []);
        setNoResults(!res.terceros || res.terceros.length === 0);
      })
      .catch(() => setNoResults(true))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [query]);

  return { data, loading, noResults };
}

interface BuscadorTercerosProps {
  value: Tercero | null;
  onSelect: (tercero: Tercero | null) => void;
  placeholder?: string;
}

export const BuscadorTerceros: React.FC<BuscadorTercerosProps> = ({
  value,
  onSelect,
  placeholder = "Buscar tercero por nombre o identificación"
}) => {
  const [input, setInput] = useState(value ? `${value.numeroIdentificacion} - ${value.razonSocial}` : "");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState<number>(-1);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { data, loading, noResults } = useBuscarTerceros(search);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  React.useEffect(() => {
    if (value) setInput(`${value.numeroIdentificacion} - ${value.razonSocial}`);
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
          if (!open || data.length === 0) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlighted(h => Math.min(h + 1, data.length - 1));
            setTimeout(() => {
              if (listRef.current) {
                const el = listRef.current.querySelectorAll('div[data-idx]')[highlighted + 1];
                if (el) (el as HTMLElement).scrollIntoView({ block: 'nearest' });
              }
            }, 0);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlighted(h => Math.max(h - 1, 0));
            setTimeout(() => {
              if (listRef.current) {
                const el = listRef.current.querySelectorAll('div[data-idx]')[highlighted - 1];
                if (el) (el as HTMLElement).scrollIntoView({ block: 'nearest' });
              }
            }, 0);
          } else if (e.key === 'Enter') {
            if (highlighted >= 0 && highlighted < data.length) {
              const tercero = data[highlighted];
              setInput(`${tercero.numeroIdentificacion} - ${tercero.razonSocial}`);
              setOpen(false);
              onSelect(tercero);
            }
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
      />
      {open && (
        <div ref={listRef} className="absolute z-20 bg-white border rounded shadow max-h-60 overflow-auto" style={{ minWidth: 320, width: '100%' }}>
          {loading && <div className="px-2 py-1 text-gray-500">Buscando...</div>}
          {!loading && noResults && <div className="px-2 py-1 text-gray-500">Sin resultados</div>}
          {!loading && data.map((tercero, idx) => (
            <div
              key={tercero.id}
              data-idx={idx}
              className={`px-2 py-1 cursor-pointer text-sm ${highlighted === idx ? 'bg-blue-100' : 'hover:bg-blue-100'}`}
              onMouseDown={() => {
                setInput(`${tercero.numeroIdentificacion} - ${tercero.razonSocial}`);
                setOpen(false);
                onSelect(tercero);
              }}
              onMouseEnter={() => setHighlighted(idx)}
            >
              <span className="font-mono text-xs text-gray-700">{tercero.numeroIdentificacion}</span> - {tercero.razonSocial}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
