import React, { useRef, useEffect } from "react";

interface BalancePruebaModalProps {
  data: { movimientos: any[]; planCuentas: any[] };
  onClose: () => void;
}

// Función para construir el árbol jerárquico del plan de cuentas
function construirArbolCuentas(planCuentas: any[]) {
  const cuentasPorCodigo: Record<string, any> = {};
  planCuentas.forEach(c => {
    cuentasPorCodigo[c.codigo] = { ...c, hijos: [] };
  });
  const raiz: any[] = [];
  planCuentas.forEach(c => {
    if (c.padre_codigo && cuentasPorCodigo[c.padre_codigo]) {
      cuentasPorCodigo[c.padre_codigo].hijos.push(cuentasPorCodigo[c.codigo]);
    } else {
      raiz.push(cuentasPorCodigo[c.codigo]);
    }
  });
  return raiz;
}

const BalancePruebaModal: React.FC<BalancePruebaModalProps & { nivel?: number }> = ({ data, onClose, nivel }) => {
  if (!data || !Array.isArray(data.movimientos) || !Array.isArray(data.planCuentas)) {
    console.warn('[BalancePruebaModal] No se recibió el formato esperado:', data);
    return <div className="p-4">No se recibieron datos para mostrar el balance de prueba.</div>;
  }

  // Logs de depuración
  console.log('[BalancePruebaModal] Movimientos recibidos:', data.movimientos);
  console.log('[BalancePruebaModal] PlanCuentas recibidas:', data.planCuentas);

  // Construir árbol jerárquico
  const arbolCuentas = construirArbolCuentas(data.planCuentas);
  console.log('[BalancePruebaModal] Árbol de cuentas construido:', arbolCuentas);

  // Mapear saldos de movimientos a cuentas
  const saldosPorCodigo: Record<string, any> = {};
  data.movimientos.forEach((row: any) => {
    saldosPorCodigo[row.codigo_nivel] = {
      saldoAnterior: Number(row.saldo_anterior) || 0,
      movDebito: Number(row.mov_debito) || 0,
      movCredito: Number(row.mov_credito) || 0,
      saldoFinal: Number(row.saldo_final) || 0,
      tercero: row.tercero_identificacion || '',
      nombre: row.tercero_nombre ? row.tercero_nombre : row.nombre_nivel,
      tipo_reporte: row.tipo_reporte,
    };
  });



  // Construir conjunto de códigos relevantes: cuentas con saldo y sus superiores
  const codigosConSaldo = Object.keys(saldosPorCodigo);
  const codigosRelevantes = new Set<string>();
  const cuentasPorCodigo: Record<string, any> = {};
  data.planCuentas.forEach(c => { cuentasPorCodigo[c.codigo] = c; });

  // Para cada cuenta con saldo, agregar sus padres recursivamente
  function agregarPadres(codigo: string) {
    if (!codigo || codigosRelevantes.has(codigo)) return;
    codigosRelevantes.add(codigo);
    const cuenta = cuentasPorCodigo[codigo];
    if (cuenta && cuenta.padre_codigo) agregarPadres(cuenta.padre_codigo);
  }
  codigosConSaldo.forEach(agregarPadres);

  // Filtrar el árbol para mostrar solo cuentas relevantes


  // Función para calcular subtotales sumando los saldos de todas las cuentas relevantes bajo cada cuenta padre
  function calcularSubtotalSubarbol(cuenta: any): { saldoAnterior: number, movDebito: number, movCredito: number, saldoFinal: number } {
    let subtotal = { saldoAnterior: 0, movDebito: 0, movCredito: 0, saldoFinal: 0 };
    function sumarSubarbol(c: any) {
      if (codigosRelevantes.has(c.codigo)) {
        const s = saldosPorCodigo[c.codigo] || {};
        subtotal.saldoAnterior += Number(s.saldoAnterior) || 0;
        subtotal.movDebito += Number(s.movDebito) || 0;
        subtotal.movCredito += Number(s.movCredito) || 0;
        subtotal.saldoFinal += Number(s.saldoFinal) || 0;
      }
      if (c.hijos && c.hijos.length > 0) {
        c.hijos.forEach((h: any) => {
          sumarSubarbol(h);
        });
      }
    }
    sumarSubarbol(cuenta);
    return subtotal;
  }

  // Renderizar filas con subtotales y totales
  function renderFilasConSubtotales(cuentas: any[], nivel: number = 1): any[] {
    return cuentas.flatMap(cuenta => {
      if (!codigosRelevantes.has(cuenta.codigo)) return [];
      const saldo = saldosPorCodigo[cuenta.codigo] || {};
      // Renderizar hijos primero
      const hijosFilas = cuenta.hijos && cuenta.hijos.length > 0 ? renderFilasConSubtotales(cuenta.hijos, nivel + 1) : [];
      // Calcular subtotal solo con hijos directos (no incluir subtotales)
      const hijosDirectos = cuenta.hijos && cuenta.hijos.length > 0
        ? cuenta.hijos.filter((h: any) => codigosRelevantes.has(h.codigo))
        : [];
      const hijosDirectosFilas = hijosDirectos.map((h: any) => {
        const s = saldosPorCodigo[h.codigo] || {};
        return {
          saldoAnterior: s.saldoAnterior || 0,
          movDebito: s.movDebito || 0,
          movCredito: s.movCredito || 0,
          saldoFinal: s.saldoFinal || 0,
          esSubtotal: false
        };
      });
      const fila = {
        codigo: cuenta.codigo,
        nombre: saldo.nombre || cuenta.nombre,
        tercero: saldo.tercero || '',
        nivel: cuenta.nivel || nivel,
        saldoAnterior: saldo.saldoAnterior || 0,
        movDebito: saldo.movDebito || 0,
        movCredito: saldo.movCredito || 0,
        saldoFinal: saldo.saldoFinal || 0,
        esSubtotal: false,
        esTotal: false,
      };
      // Si tiene hijos, calcular subtotal sumando todas las cuentas hoja
      let subtotalRow = null;
      if (cuenta.hijos && cuenta.hijos.length > 0) {
        const subtotal = calcularSubtotalSubarbol(cuenta);
        subtotalRow = {
          codigo: cuenta.codigo + "-subtotal",
          nombre: `Subtotal ${fila.nombre}`,
          tercero: '',
          nivel: nivel,
          saldoAnterior: subtotal.saldoAnterior,
          movDebito: subtotal.movDebito,
          movCredito: subtotal.movCredito,
          saldoFinal: subtotal.saldoFinal,
          esSubtotal: true,
          esTotal: false,
        };
      }
      return [fila, ...hijosFilas, ...(subtotalRow ? [subtotalRow] : [])];
    });
  }

  const filas = renderFilasConSubtotales(arbolCuentas);

  if (filas.length === 0) {
    console.warn('[BalancePruebaModal] El array de filas está vacío.');
    return <div className="p-4">No hay datos para mostrar en el periodo y cuentas seleccionados.</div>;
  }

  // Calcular totales generales
  const totalGeneral = filas.reduce((acc, n) => {
    acc.saldoAnterior += Number(n.saldoAnterior) || 0;
    acc.movDebito += Number(n.movDebito) || 0;
    acc.movCredito += Number(n.movCredito) || 0;
    acc.saldoFinal += Number(n.saldoFinal) || 0;
    return acc;
  }, { saldoAnterior: 0, movDebito: 0, movCredito: 0, saldoFinal: 0 });
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
  <div className="bg-white rounded shadow-lg p-6 w-full max-w-6xl relative overflow-y-auto max-h-[90vh]" style={{ minWidth: 900 }}>
        <button className="absolute top-2 right-2 text-gray-500 text-2xl" onClick={onClose}>×</button>
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', paddingBottom: 8 }}>
          <h2 className="text-lg font-bold">Balance de Prueba</h2>
        </div>
        <div className="relative" style={{ height: '60vh', display: 'flex', flexDirection: 'column' }}>
          {/* refs para sincronizar scroll horizontal */}
          {(() => {
            const tableScrollRef = useRef<HTMLDivElement>(null);
            const xScrollRef = useRef<HTMLDivElement>(null);
            useEffect(() => {
              const tableDiv = tableScrollRef.current;
              const xDiv = xScrollRef.current;
              if (!tableDiv || !xDiv) return;
              // Sincronizar scroll horizontal
              const onTableScroll = () => { xDiv.scrollLeft = tableDiv.scrollLeft; };
              const onXScroll = () => { tableDiv.scrollLeft = xDiv.scrollLeft; };
              tableDiv.addEventListener('scroll', onTableScroll);
              xDiv.addEventListener('scroll', onXScroll);
              return () => {
                tableDiv.removeEventListener('scroll', onTableScroll);
                xDiv.removeEventListener('scroll', onXScroll);
              };
            }, []);
            return (
              <>
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                  <div ref={tableScrollRef} style={{ minWidth: '100%', overflowX: 'hidden', height: '100%' }}>
                    <table className="min-w-full text-xs border">
                      <thead style={{ position: 'sticky', top: 0, zIndex: 5, background: 'white' }}>
                        <tr className="bg-gray-100">
                          <th className="px-2 py-1 border" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 6 }}>Cuenta</th>
                          <th className="px-2 py-1 border" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 6 }}>Identificación</th>
                          <th className="px-2 py-1 border" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 6 }}>Tercero</th>
                          <th className="px-2 py-1 border" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 6 }}>Saldo anterior</th>
                          <th className="px-2 py-1 border" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 6 }}>Mov. Débito</th>
                          <th className="px-2 py-1 border" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 6 }}>Mov. Crédito</th>
                          <th className="px-2 py-1 border" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 6 }}>Saldo Final</th>
                        </tr>
                      </thead>
            <tbody>
              {filas.map((row: any) => (
                row.esSubtotal && row.nivel === 1 ? (
                  <tr key={row.codigo} className="bg-green-100 font-bold">
                    <td className="px-2 py-1 border" style={{ paddingLeft: `${((row.nivel || 1) - 1) * 16}px` }}></td>
                    <td className="px-2 py-1 border">Subtotal</td>
                    <td className="px-2 py-1 border">{row.nombre}</td>
                    <td className="px-2 py-1 border text-right">{row.saldoAnterior.toLocaleString()}</td>
                    <td className="px-2 py-1 border text-right">{row.movDebito.toLocaleString()}</td>
                    <td className="px-2 py-1 border text-right">{row.movCredito.toLocaleString()}</td>
                    <td className="px-2 py-1 border text-right">{row.saldoFinal.toLocaleString()}</td>
                  </tr>
                ) : row.esSubtotal ? (
                  <tr key={row.codigo} className="bg-blue-100 font-bold">
                    <td className="px-2 py-1 border" style={{ paddingLeft: `${((row.nivel || 1) - 1) * 16}px` }}></td>
                    <td className="px-2 py-1 border">Subtotal</td>
                    <td className="px-2 py-1 border">{row.nombre}</td>
                    <td className="px-2 py-1 border text-right">{row.saldoAnterior.toLocaleString()}</td>
                    <td className="px-2 py-1 border text-right">{row.movDebito.toLocaleString()}</td>
                    <td className="px-2 py-1 border text-right">{row.movCredito.toLocaleString()}</td>
                    <td className="px-2 py-1 border text-right">{row.saldoFinal.toLocaleString()}</td>
                  </tr>
                ) : (
                  <tr key={row.codigo}>
                    <td className="px-2 py-1 border" style={{ paddingLeft: `${((row.nivel || 1) - 1) * 16}px` }}>{row.codigo}</td>
                    <td className="px-2 py-1 border">{row.tercero}</td>
                    <td className="px-2 py-1 border">{row.nombre}</td>
                    <td className="px-2 py-1 border text-right">{row.saldoAnterior.toLocaleString()}</td>
                    <td className="px-2 py-1 border text-right">{row.movDebito.toLocaleString()}</td>
                    <td className="px-2 py-1 border text-right">{row.movCredito.toLocaleString()}</td>
                    <td className="px-2 py-1 border text-right">{row.saldoFinal.toLocaleString()}</td>
                  </tr>
                )
              ))}
              <tr key="total-general" className="bg-primary/20 font-bold">
                <td className="px-2 py-1 border" colSpan={2}>TOTAL GENERAL</td>
                <td className="px-2 py-1 border"></td>
                <td className="px-2 py-1 border text-right">{totalGeneral.saldoAnterior.toLocaleString()}</td>
                <td className="px-2 py-1 border text-right">{totalGeneral.movDebito.toLocaleString()}</td>
                <td className="px-2 py-1 border text-right">{totalGeneral.movCredito.toLocaleString()}</td>
                <td className="px-2 py-1 border text-right">{totalGeneral.saldoFinal.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
            </div>
          </div>
                {/* Scrollbar horizontal siempre visible y sincronizado */}
                <div ref={xScrollRef} style={{ overflowX: 'auto', overflowY: 'hidden', height: 16 }}>
                  <div style={{ width: '100%', height: 1, minWidth: 900 }} />
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default BalancePruebaModal;
