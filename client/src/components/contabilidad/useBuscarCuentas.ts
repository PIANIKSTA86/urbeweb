import { useState, useEffect, useRef } from "react";

export interface Cuenta {
  id: number;
  codigo: string;
  nombre: string;
  nivel: number;
}

export function useBuscarCuentas(query: string) {
  const [data, setData] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

    useEffect(() => {
      if (!query) {
        setData([]);
        setNoResults(false);
        return;
      }
      setLoading(true);
      const controller = new AbortController();
      fetch(`/api/contabilidad/puc?search=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then(res => res.json())
        .then((res: Cuenta[]) => {
          // Ensure 'tipo' is present for each account
          setData(res.slice(0, 20));
          setNoResults(res.length === 0);
        })
        .catch(() => setNoResults(true))
        .finally(() => setLoading(false));
      return () => controller.abort();
    }, [query]);

  return { data, loading, noResults };
}
