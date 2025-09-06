import { useState, useEffect } from "react";
import { Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ModalCrearCuentaPUC } from "./ModalCrearCuentaPUC";
import { BuscadorTerceros } from "./BuscadorTerceros";
import { BuscadorCuentas } from "./BuscadorCuentas";
import Modal from "@/components/ui/modal";
import { TerceroForm } from "../terceros/tercero-form";

// Temporary placeholder types (replace with correct imports if available)
type Cuenta = any;
type Tercero = any;

interface TipoTransaccion {
  id: number;
  nombre: string;
  descripcion?: string;
}
interface Prefijo {
  id: number;
  tipo_transaccion_id: number;
  prefijo: string;
  numeracion_actual: number;
  descripcion?: string;
}
interface Movimiento {
  cuenta: Cuenta | null;
  tercero: Tercero | null;
  documentoCruce: string;
  debito: number;
  credito: number;
  comentario: string;
}
interface ModalTransaccionProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    tipoTransaccion: number;
    prefijo: string;
    numeracion: number | string;
    descripcion: string;
    movimientos: Movimiento[];
    tercero?: Tercero | null;
  }) => void;
  tercero?: Tercero | null;
  onTerceroChange?: (tercero: Tercero | null) => void;
}

export default function ModalTransaccion({ open, onClose, onSave, tercero, onTerceroChange }: ModalTransaccionProps) {
  const [terceroLocal, setTerceroLocal] = useState<Tercero | null>(tercero || null);
  const [unicoTercero, setUnicoTercero] = useState<boolean>(true);
  const [showCrearCuenta, setShowCrearCuenta] = useState<boolean>(false);
  const [puc, setPuc] = useState<Cuenta[]>([]);
  const [showCrearTercero, setShowCrearTercero] = useState<boolean>(false);
  useEffect(() => {
    setTerceroLocal(tercero || null);
  }, [tercero]);
  const [tiposTransaccion, setTiposTransaccion] = useState<TipoTransaccion[]>([]);
  const [tipoTransaccion, setTipoTransaccion] = useState<string>("");
  const [prefijos, setPrefijos] = useState<Prefijo[]>([]);
  const [prefijo, setPrefijo] = useState<string>("");
  const [numeracion, setNumeracion] = useState<string>("");
  const [autoNumeracion, setAutoNumeracion] = useState<boolean>(true);
  const [numeracionError, setNumeracionError] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [movimientos, setMovimientos] = useState<Movimiento[]>([
    { cuenta: null, tercero: null, documentoCruce: "", debito: 0, credito: 0, comentario: "" },
  ]);
  const [fecha, setFecha] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (open) {
      fetch("/api/contabilidad/tipos-transaccion")
        .then(res => res.json())
        .then(data => setTiposTransaccion(data));
      fetch("/api/contabilidad/prefijos")
        .then(res => res.json())
        .then(data => setPrefijos(data));
      fetch("/api/contabilidad/puc")
        .then(res => res.json())
        .then(data => setPuc(Array.isArray(data) ? data : []));
    }
  }, [open]);

  const prefijosFiltrados = prefijos.filter((p) => String(p.tipo_transaccion_id) === tipoTransaccion);

  useEffect(() => {
    if (prefijosFiltrados.length > 0) {
      setPrefijo(prefijosFiltrados[0].prefijo);
      setNumeracion(String(prefijosFiltrados[0].numeracion_actual));
    } else {
      setPrefijo("");
      setNumeracion("");
    }
  }, [tipoTransaccion, prefijos]);

  const validarNumeracion = (valor: string) => {
    const duplicados = ["CI-120", "CI-122"];
    if (duplicados.includes(`${prefijo}-${valor}`)) {
      setNumeracionError("Este número ya existe");
    } else {
      setNumeracionError("");
    }
  };

  const handleChangeNumeracion = (valor: string) => {
    setNumeracion(valor);
    validarNumeracion(valor);
  };

  const handleAddRow = () => {
    setMovimientos([...movimientos, { cuenta: null, tercero: null, documentoCruce: "", debito: 0, credito: 0, comentario: "" }]);
  };

  const handleMovimientoChange = (index: number, campo: keyof Movimiento, valor: any) => {
    setMovimientos(prev => prev.map((mov, i) =>
      i === index ? { ...mov, [campo]: valor } : mov
    ));
  };

  const totalDebito = movimientos.reduce((acc, m) => acc + Number(m.debito), 0);
  const totalCredito = movimientos.reduce((acc, m) => acc + Number(m.credito), 0);
  const balanceado = totalDebito === totalCredito;

  const handleSave = () => {
    if (!balanceado || numeracionError) return;
    onSave({ tipoTransaccion: Number(tipoTransaccion), prefijo, numeracion, descripcion, movimientos, tercero: terceroLocal });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-full" style={{ minWidth: 350, maxWidth: '98vw', overflowX: 'auto' }}>
        <DialogHeader>
          <DialogTitle>Nueva Transacción</DialogTitle>
        </DialogHeader>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          {/* Primera sección: datos principales */}
          <div className="flex gap-4 mb-4 items-end flex-wrap">
            <div className="flex flex-col">
              <label>Tipo de transacción</label>
              <Select value={tipoTransaccion} onValueChange={setTipoTransaccion}>
                <SelectTrigger>{tiposTransaccion.find((t) => String(t.id) === tipoTransaccion)?.nombre || "Selecciona"}</SelectTrigger>
                <SelectContent>
                  {tiposTransaccion.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col">
              <label>Prefijo</label>
              <Select value={prefijo} onValueChange={setPrefijo}>
                <SelectTrigger>{prefijo || "Selecciona"}</SelectTrigger>
                <SelectContent>
                  {prefijosFiltrados.map((p) => (
                    <SelectItem key={p.id} value={p.prefijo}>{p.prefijo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col">
              <label>Número</label>
              <Input
                type="number"
                value={numeracion}
                onChange={(e) => handleChangeNumeracion(e.target.value)}
                disabled={autoNumeracion}
                className="w-24"
              />
              {numeracionError && <p className="text-red-500 text-sm">{numeracionError}</p>}
            </div>
            <div className="flex flex-col justify-end">
              <label className="invisible">Check</label>
              <div className="flex items-center h-10">
                <Checkbox
                  checked={autoNumeracion}
                  onCheckedChange={(v) => setAutoNumeracion(!!v)}
                />
                <span className="ml-2 text-sm">Numeración automática</span>
              </div>
            </div>
            <div className="flex flex-col">
              <label>Fecha transacción</label>
              <Input
                type="date"
                className="w-[200px]"
                value={fecha ? fecha.toISOString().substring(0, 10) : ""}
                onChange={e => setFecha(e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
            <div className="flex flex-col min-w-[320px]">
              <label className="flex items-center gap-2">
                Tercero
                <input
                  type="checkbox"
                  checked={unicoTercero}
                  onChange={e => setUnicoTercero(e.target.checked)}
                  className="ml-2"
                />
                <span className="text-xs">Un único tercero para toda la transacción</span>
              </label>
              <BuscadorTerceros
                value={terceroLocal}
                onSelect={(t: Tercero | null) => {
                  setTerceroLocal(t);
                  onTerceroChange && onTerceroChange(t);
                }}
                placeholder="Buscar tercero por nombre o identificación"
                disabled={!unicoTercero}
              />
            </div>
          </div>
          {/* Segunda sección: botones y descripción */}
          <div className="flex gap-4 mb-4 items-end flex-wrap">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCrearCuenta(true)}>Nueva cuenta</Button>
              <Button variant="outline" onClick={() => setShowCrearTercero(true)}>Nuevo tercero</Button>
            </div>
            <div className="flex-1 flex flex-col">
              <label>Descripción</label>
              <textarea
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                className="w-full min-h-[60px] max-h-[120px] border rounded px-2 py-1 resize-vertical"
                style={{ fontSize: '1rem' }}
              />
            </div>
          </div>
          {/* Tercera sección: tabla de registros */}
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Cuenta</th>
                  { !unicoTercero && <th className="p-2 border">Tercero</th> }
                  <th className="p-2 border">Doc. Cruce</th>
                  <th className="p-2 border">Débito</th>
                  <th className="p-2 border">Crédito</th>
                  <th className="p-2 border">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m, i) => (
                  <tr key={i}>
                    <td className="border p-1">
                      <BuscadorCuentas
                        value={m.cuenta}
                        onSelect={cuenta => handleMovimientoChange(i, "cuenta", cuenta)}
                      />
                    </td>
                    { !unicoTercero && (
                      <td className="border p-1">
                        <BuscadorTerceros
                          value={m.tercero}
                          onSelect={tercero => handleMovimientoChange(i, "tercero", tercero)}
                          placeholder="Buscar tercero por nombre o identificación"
                        />
                      </td>
                    )}
                    <td className="border p-1">
                      <Input value={m.documentoCruce} onChange={(e) => handleMovimientoChange(i, "documentoCruce", e.target.value)} />
                    </td>
                    <td className="border p-1">
                      <Input type="number" value={m.debito} onChange={(e) => handleMovimientoChange(i, "debito", e.target.value)} />
                    </td>
                    <td className="border p-1">
                      <Input type="number" value={m.credito} onChange={(e) => handleMovimientoChange(i, "credito", e.target.value)} />
                    </td>
                    <td className="border p-1 text-center">
                      <Button variant="ghost" size="icon" onClick={() => setMovimientos(movs => movs.filter((_, idx) => idx !== i))} disabled={movimientos.length === 1}>
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button variant="outline" onClick={handleAddRow} className="mt-2">+ Agregar fila</Button>
          </div>
          {/* Totales */}
          <div className="flex justify-end gap-4 mt-4 text-sm">
            <span>Total Débito: {totalDebito}</span>
            <span>Total Crédito: {totalCredito}</span>
            {!balanceado && <span className="text-red-500">⚠ No balanceado</span>}
          </div>
          {/* Cuarta sección: acciones finales */}
          <div className="flex flex-wrap gap-2 justify-end items-end mt-6">
            <Button variant="outline" className="mb-2">Guardar borrador</Button>
            <Button className="bg-green-600 text-white px-4 py-2 rounded mb-2 hover:bg-green-700 transition">Aprobar / Contabilizar</Button>
            <Button variant="destructive" className="mb-2">Anular</Button>
            <Button variant="outline" className="mb-2">Imprimir / Exportar</Button>
            <Button variant="outline" className="mb-2">Auditoría</Button>
            <Button className="bg-red-600 text-white px-4 py-2 rounded mb-2 hover:bg-red-700 transition" onClick={onClose}>Cancelar</Button>
          </div>
          {/* Modal para crear cuenta PUC (overlay sobre el modal de transacción) */}
          {showCrearCuenta && (
            <ModalCrearCuentaPUC
              isOpen={showCrearCuenta}
              onClose={() => setShowCrearCuenta(false)}
              puc={puc}
              onCreated={() => {
                setShowCrearCuenta(false);
                // Refrescar cuentas PUC tras crear una nueva
                fetch("/api/contabilidad/puc")
                  .then(res => res.json())
                  .then(data => setPuc(Array.isArray(data) ? data : []));
              }}
            />
          )}
          {/* Modal para crear tercero (ahora usando el mismo Modal para coherencia visual) */}
          {showCrearTercero && (
            <Modal onClose={() => setShowCrearTercero(false)}>
              <TerceroForm isOpen={true} onClose={() => setShowCrearTercero(false)} mode="create" />
            </Modal>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


