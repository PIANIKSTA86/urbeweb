import React, { useRef, useEffect } from "react";

interface BalancePruebaModalProps {
  data: any;
  onClose: () => void;
}

const BalancePruebaModal: React.FC<BalancePruebaModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  // LOG: Tipo y valor de totalGeneral.movDebito y de los primeros 3 row.movDebito
  try {
    // El bloque de renderizado está dentro de una IIFE, así que replicamos la lógica aquí para loguear después de calcular totales
    const cuentasArr = Object.entries(data).map(([codigo, row]: any) => ({ ...row, codigo, hijos: [] }));
    const cuentasMap: Record<string, any> = {};
    cuentasArr.forEach(c => { cuentasMap[c.codigo] = c; });
    const raiz: any[] = [];
    cuentasArr.forEach(c => {
      if (!c.padre_codigo || c.padre_codigo === "" || c.padre_codigo === "0" || typeof c.padre_codigo === "undefined" || !cuentasMap[c.padre_codigo]) {
        raiz.push(c);
      } else {
        cuentasMap[c.padre_codigo].hijos.push(c);
      }
    });
    function sumarCampos(nodo: any) {
      let subtotal = {
        saldoAnterior: nodo.saldoAnterior || 0,
        movDebito: nodo.movDebito || 0,
        movCredito: nodo.movCredito || 0,
        saldoDebito: nodo.saldoDebito || 0,
        saldoCredito: nodo.saldoCredito || 0
      };
      if (nodo.hijos && nodo.hijos.length > 0) {
        nodo.hijos.forEach((h: any) => {
          const sub = sumarCampos(h);
          subtotal.saldoAnterior += sub.saldoAnterior;
          subtotal.movDebito += sub.movDebito;
          subtotal.movCredito += sub.movCredito;
          subtotal.saldoDebito += sub.saldoDebito;
          subtotal.saldoCredito += sub.saldoCredito;
        });
      }
      nodo._subtotal = subtotal;
      return subtotal;
    }
    raiz.forEach(sumarCampos);
    const filas: any[] = [];
    function recorrerConSubtotales(nodos: any[], nivel = 1) {
      nodos.sort((a, b) => a.codigo.localeCompare(b.codigo));
      for (const n of nodos) {
        filas.push({ ...n, esSubtotal: false });
        if (n.hijos && n.hijos.length > 0) {
          recorrerConSubtotales(n.hijos, nivel + 1);
          filas.push({
            codigo: n.codigo + "-subtotal",
            nombre: `Subtotal ${n.nombre}`,
            nivel: n.nivel,
            esSubtotal: true,
            ...n._subtotal
          });
        }
      }
    }
    recorrerConSubtotales(raiz);
    const totalGeneral = raiz.reduce((acc, n) => {
      acc.saldoAnterior += n._subtotal.saldoAnterior;
      acc.movDebito += n._subtotal.movDebito;
      acc.movCredito += n._subtotal.movCredito;
      acc.saldoDebito += n._subtotal.saldoDebito;
      acc.saldoCredito += n._subtotal.saldoCredito;
      return acc;
    }, { saldoAnterior: 0, movDebito: 0, movCredito: 0, saldoDebito: 0, saldoCredito: 0 });
    // eslint-disable-next-line no-console
    console.log('[BalancePruebaModal] totalGeneral.movDebito:', totalGeneral.movDebito, 'type:', typeof totalGeneral.movDebito);
    filas.slice(0, 3).forEach((row, idx) => {
      // eslint-disable-next-line no-console
      console.log(`[BalancePruebaModal] row[${idx}].movDebito:`, row.movDebito, 'type:', typeof row.movDebito);
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[BalancePruebaModal] Error al loguear movDebito:', e);
  }
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
                          <th className="px-2 py-1 border" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 6 }}>Nombre</th>
                          <th className="px-2 py-1 border" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 6 }}>Saldo anterior</th>
                          <th className="px-2 py-1 border" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 6 }}>Mov. Débito</th>
                          <th className="px-2 py-1 border" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 6 }}>Mov. Crédito</th>
                          <th className="px-2 py-1 border" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 6 }}>Saldo Débito</th>
                          <th className="px-2 py-1 border" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 6 }}>Saldo Crédito</th>
                        </tr>
                      </thead>
            <tbody>
              {(() => {
                // Convertir el objeto plano a un array de nodos con referencia a padre
                const cuentasArr = Object.entries(data).map(([codigo, row]: any) => ({ ...row, codigo, hijos: [] }));
                const cuentasMap: Record<string, any> = {};
                cuentasArr.forEach(c => { cuentasMap[c.codigo] = c; });
                // Construir árbol
                const raiz: any[] = [];
                cuentasArr.forEach(c => {
                  // Considerar como raíz si padre_codigo es null, vacío, '0', undefined o no existe en el mapa
                  if (
                    !c.padre_codigo ||
                    c.padre_codigo === "" ||
                    c.padre_codigo === "0" ||
                    typeof c.padre_codigo === "undefined" ||
                    !cuentasMap[c.padre_codigo]
                  ) {
                    raiz.push(c);
                  } else {
                    cuentasMap[c.padre_codigo].hijos.push(c);
                  }
                });

                // Función para sumar los campos de un nodo y sus hijos y marcar visibilidad
                const marcarVisiblesYSumar = (nodo: any) => {
                  let subtotal = {
                    saldoAnterior: nodo.saldoAnterior || 0,
                    movDebito: nodo.movDebito || 0,
                    movCredito: nodo.movCredito || 0,
                    saldoDebito: nodo.saldoDebito || 0,
                    saldoCredito: nodo.saldoCredito || 0
                  };
                  let visible = (subtotal.saldoAnterior !== 0 || subtotal.movDebito !== 0 || subtotal.movCredito !== 0 || subtotal.saldoDebito !== 0 || subtotal.saldoCredito !== 0);
                  if (nodo.hijos && nodo.hijos.length > 0) {
                    let hijoVisible = false;
                    nodo.hijos.forEach((h: any) => {
                      const sub = marcarVisiblesYSumar(h);
                      subtotal.saldoAnterior += sub.saldoAnterior;
                      subtotal.movDebito += sub.movDebito;
                      subtotal.movCredito += sub.movCredito;
                      subtotal.saldoDebito += sub.saldoDebito;
                      subtotal.saldoCredito += sub.saldoCredito;
                      if (h.visible) hijoVisible = true;
                    });
                    visible = visible || hijoVisible;
                  }
                  nodo._subtotal = subtotal;
                  nodo.visible = visible;
                  return subtotal;
                };
                raiz.forEach(marcarVisiblesYSumar);

                // Recorrer árbol y renderizar filas y subtotales solo si visible
                const filas: any[] = [];
                const recorrerConSubtotalesVisibles = (nodos: any[], nivel = 1) => {
                  nodos.sort((a, b) => a.codigo.localeCompare(b.codigo));
                  for (const n of nodos) {
                    if (!n.visible) continue;
                    filas.push({ ...n, esSubtotal: false });
                    if (n.hijos && n.hijos.length > 0) {
                      recorrerConSubtotalesVisibles(n.hijos, nivel + 1);
                      // Fila de subtotal para este grupo
                      filas.push({
                        codigo: n.codigo + "-subtotal",
                        nombre: `Subtotal ${n.nombre}`,
                        nivel: n.nivel,
                        esSubtotal: true,
                        ...n._subtotal
                      });
                    }
                  }
                };
                recorrerConSubtotalesVisibles(raiz);

                // Calcular totales generales
                const totalGeneral = raiz.reduce((acc, n) => {
                  acc.saldoAnterior += Number(n._subtotal.saldoAnterior) || 0;
                  acc.movDebito += Number(n._subtotal.movDebito) || 0;
                  acc.movCredito += Number(n._subtotal.movCredito) || 0;
                  acc.saldoDebito += Number(n._subtotal.saldoDebito) || 0;
                  acc.saldoCredito += Number(n._subtotal.saldoCredito) || 0;
                  return acc;
                }, { saldoAnterior: 0, movDebito: 0, movCredito: 0, saldoDebito: 0, saldoCredito: 0 });

                return [
                  ...filas.map((row: any) => (
                    <tr key={row.codigo} className={row.esSubtotal ? "bg-gray-100 font-bold" : ""}>
                      <td className="px-2 py-1 border">
                        <span style={{ paddingLeft: `${((row.nivel || 1) - 1) * 16}px` }}>{row.codigo.replace('-subtotal', '')}</span>
                      </td>
                      <td className="px-2 py-1 border">{row.nombre}</td>
                      <td className="px-2 py-1 border text-right">{isNaN(Number(row.saldoAnterior)) ? '0' : Number(row.saldoAnterior).toLocaleString()}</td>
                      <td className="px-2 py-1 border text-right">{isNaN(Number(row.movDebito)) ? '0' : Number(row.movDebito).toLocaleString()}</td>
                      <td className="px-2 py-1 border text-right">{isNaN(Number(row.movCredito)) ? '0' : Number(row.movCredito).toLocaleString()}</td>
                      <td className="px-2 py-1 border text-right">{isNaN(Number(row.saldoDebito)) ? '0' : Number(row.saldoDebito).toLocaleString()}</td>
                      <td className="px-2 py-1 border text-right">{isNaN(Number(row.saldoCredito)) ? '0' : Number(row.saldoCredito).toLocaleString()}</td>
                    </tr>
                  )),
                  <tr key="total-general" className="bg-primary/20 font-bold">
                    <td className="px-2 py-1 border" colSpan={2}>TOTAL GENERAL</td>
                    <td className="px-2 py-1 border text-right">{totalGeneral.saldoAnterior.toLocaleString()}</td>
                    <td className="px-2 py-1 border text-right">{totalGeneral.movDebito.toLocaleString()}</td>
                    <td className="px-2 py-1 border text-right">{totalGeneral.movCredito.toLocaleString()}</td>
                    <td className="px-2 py-1 border text-right">{totalGeneral.saldoDebito.toLocaleString()}</td>
                    <td className="px-2 py-1 border text-right">{totalGeneral.saldoCredito.toLocaleString()}</td>
                  </tr>
                ];
              })()}
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
