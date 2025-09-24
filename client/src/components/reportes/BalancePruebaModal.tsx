import React, { useRef, useEffect } from "react";

interface BalancePruebaModalProps {
  data: any;
  onClose: () => void;
}

const BalancePruebaModal: React.FC<BalancePruebaModalProps & { nivel?: number }> = ({ data, onClose, nivel }) => {
  if (!data || !Array.isArray(data)) {
    console.warn('[BalancePruebaModal] No se recibió un array de datos:', data);
    return <div className="p-4">No se recibieron datos para mostrar el balance de prueba.</div>;
  }

  // Log de los datos recibidos
  console.log('[BalancePruebaModal] Datos recibidos:', data);

  // Adaptar los datos recibidos del backend (array de filas)
  const filas = data.map((row: any, idx: number) => {
    console.log(`[BalancePruebaModal] Fila ${idx}:`, row);
    return {
      codigo: row.codigo_nivel,
      nombre: row.tercero_nombre ? row.tercero_nombre : row.nombre_nivel,
      tercero: row.tercero_identificacion || '',
      nivel: row.nivel || 1,
      saldoAnterior: Number(row.saldo_anterior) || 0,
      movDebito: Number(row.mov_debito) || 0,
      movCredito: Number(row.mov_credito) || 0,
      saldoFinal: Number(row.saldo_final) || 0,
    };
  });

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
                <tr key={row.codigo}>
                  <td className="px-2 py-1 border" style={{ paddingLeft: `${((row.nivel || 1) - 1) * 16}px` }}>{row.codigo}</td>
                  <td className="px-2 py-1 border">{row.tercero}</td>
                  <td className="px-2 py-1 border">{row.nombre}</td>
                  <td className="px-2 py-1 border text-right">{row.saldoAnterior.toLocaleString()}</td>
                  <td className="px-2 py-1 border text-right">{row.movDebito.toLocaleString()}</td>
                  <td className="px-2 py-1 border text-right">{row.movCredito.toLocaleString()}</td>
                  <td className="px-2 py-1 border text-right">{row.saldoFinal.toLocaleString()}</td>
                </tr>
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
