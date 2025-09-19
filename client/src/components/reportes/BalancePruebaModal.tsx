import React from "react";

interface BalancePruebaModalProps {
  data: any;
  onClose: () => void;
}

const BalancePruebaModal: React.FC<BalancePruebaModalProps> = ({ data, onClose }) => {
  if (!data) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-3xl relative overflow-y-auto max-h-[90vh]">
        <button className="absolute top-2 right-2 text-gray-500 text-2xl" onClick={onClose}>×</button>
        <h2 className="text-lg font-bold mb-4">Balance de Prueba</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border">Cuenta</th>
                <th className="px-2 py-1 border">Nombre</th>
                <th className="px-2 py-1 border">Saldo anterior</th>
                <th className="px-2 py-1 border">Mov. Débito</th>
                <th className="px-2 py-1 border">Mov. Crédito</th>
                <th className="px-2 py-1 border">Saldo Débito</th>
                <th className="px-2 py-1 border">Saldo Crédito</th>
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

                // Función para sumar los campos de un nodo y sus hijos
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

                // Recorrer árbol y renderizar filas y subtotales
                const filas: any[] = [];
                function recorrerConSubtotales(nodos: any[], nivel = 1) {
                  nodos.sort((a, b) => a.codigo.localeCompare(b.codigo));
                  for (const n of nodos) {
                    filas.push({ ...n, esSubtotal: false });
                    if (n.hijos && n.hijos.length > 0) {
                      recorrerConSubtotales(n.hijos, nivel + 1);
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
                }
                recorrerConSubtotales(raiz);

                // Calcular totales generales
                const totalGeneral = raiz.reduce((acc, n) => {
                  acc.saldoAnterior += n._subtotal.saldoAnterior;
                  acc.movDebito += n._subtotal.movDebito;
                  acc.movCredito += n._subtotal.movCredito;
                  acc.saldoDebito += n._subtotal.saldoDebito;
                  acc.saldoCredito += n._subtotal.saldoCredito;
                  return acc;
                }, { saldoAnterior: 0, movDebito: 0, movCredito: 0, saldoDebito: 0, saldoCredito: 0 });

                return [
                  ...filas.map((row: any) => (
                    <tr key={row.codigo} className={row.esSubtotal ? "bg-gray-100 font-bold" : ""}>
                      <td className="px-2 py-1 border">
                        <span style={{ paddingLeft: `${((row.nivel || 1) - 1) * 16}px` }}>{row.codigo.replace('-subtotal', '')}</span>
                      </td>
                      <td className="px-2 py-1 border">{row.nombre}</td>
                      <td className="px-2 py-1 border text-right">{(row.saldoAnterior ?? 0).toLocaleString()}</td>
                      <td className="px-2 py-1 border text-right">{(row.movDebito ?? 0).toLocaleString()}</td>
                      <td className="px-2 py-1 border text-right">{(row.movCredito ?? 0).toLocaleString()}</td>
                      <td className="px-2 py-1 border text-right">{(row.saldoDebito ?? 0).toLocaleString()}</td>
                      <td className="px-2 py-1 border text-right">{(row.saldoCredito ?? 0).toLocaleString()}</td>
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
    </div>
  );
};

export default BalancePruebaModal;
