import { useState, useEffect } from "react";
import { Trash, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Calendar } from "../ui/calendar";
// import { Trash } from "lucide-react"; // duplicado
// import { Calendar } from "@/components/ui/calendar"; // duplicado
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

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

import { BuscadorCuentas } from "./BuscadorCuentas";
import { Cuenta } from "./useBuscarCuentas";

interface Movimiento {
  cuenta: Cuenta | null;
  tercero: string;
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
  }) => void;
}

export default function ModalTransaccion({ open, onClose, onSave }: ModalTransaccionProps) {
  const [tiposTransaccion, setTiposTransaccion] = useState<TipoTransaccion[]>([]);
  const [tipoTransaccion, setTipoTransaccion] = useState<string>("");
  const [prefijos, setPrefijos] = useState<Prefijo[]>([]);
  const [prefijo, setPrefijo] = useState<string>("");
  const [numeracion, setNumeracion] = useState<number | string>("");
  const [autoNumeracion, setAutoNumeracion] = useState<boolean>(true);
  const [numeracionError, setNumeracionError] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [movimientos, setMovimientos] = useState<Movimiento[]>([
    { cuenta: null, tercero: "", documentoCruce: "", debito: 0, credito: 0, comentario: "" },
  ]);
  const [fecha, setFecha] = useState<Date | undefined>(undefined);

  // Cargar tipos de transacción y prefijos al abrir el modal
  useEffect(() => {
    if (open) {
      fetch("/api/contabilidad/tipos-transaccion")
        .then(res => res.json())
        .then(data => setTiposTransaccion(data));
      fetch("/api/contabilidad/prefijos")
        .then(res => res.json())
        .then(data => setPrefijos(data));
    }
  }, [open]);

  // Filtrar prefijos según tipo seleccionado
  const prefijosFiltrados = prefijos.filter((p: Prefijo) => String(p.tipo_transaccion_id) === tipoTransaccion);

  // Actualizar prefijo y numeración al cambiar tipo de transacción
  useEffect(() => {
    if (prefijosFiltrados.length > 0) {
      setPrefijo(prefijosFiltrados[0].prefijo);
      setNumeracion(prefijosFiltrados[0].numeracion_actual);
    } else {
      setPrefijo("");
      setNumeracion("");
    }
  }, [tipoTransaccion, prefijos]);

  // Simula validación de duplicados
  const validarNumeracion = (valor: number | string) => {
    const duplicados = ["CI-120", "CI-122"];
    if (duplicados.includes(`${prefijo}-${valor}`)) {
      setNumeracionError("Este número ya existe");
    } else {
      setNumeracionError("");
    }
  };

  const handleChangeNumeracion = (valor: number | string) => {
    setNumeracion(valor);
    validarNumeracion(valor);
  };

  const handleAddRow = () => {
    setMovimientos([...movimientos, { cuenta: "", tercero: "", documentoCruce: "", debito: 0, credito: 0, comentario: "" }]);
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
    onSave({ tipoTransaccion: Number(tipoTransaccion), prefijo, numeracion, descripcion, movimientos });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
  <DialogContent className="max-w-5xl" style={{ minWidth: 700 }}>
        <DialogHeader>
          <DialogTitle>Nueva Transacción</DialogTitle>
        </DialogHeader>
        <div>
          {/* Encabezado */}
          <div className="flex gap-4 mb-4 items-end flex-wrap">
            <div className="flex flex-col">
              <label>Tipo de transacción</label>
              <Select value={tipoTransaccion} onValueChange={setTipoTransaccion}>
                <SelectTrigger>{tiposTransaccion.find(t => String(t.id) === tipoTransaccion)?.nombre || "Selecciona"}</SelectTrigger>
                <SelectContent>
                  {tiposTransaccion.map(t => (
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
                  {prefijosFiltrados.map(p => (
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
            <div className="flex-1 min-w-[200px] flex flex-col">
              <label>Descripción</label>
              <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="w-full" />
            </div>
          </div>
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Cuenta</th>
                  <th className="p-2 border">Tercero</th>
                  <th className="p-2 border">Doc. Cruce</th>
                  <th className="p-2 border">Comentario</th>
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
                    <td className="border p-1">
                      <Input value={m.tercero} onChange={(e) => handleMovimientoChange(i, "tercero", e.target.value)} />
                    </td>
                    <td className="border p-1">
                      <Input value={m.documentoCruce} onChange={(e) => handleMovimientoChange(i, "documentoCruce", e.target.value)} />
                    </td>
                    <td className="border p-1">
                      <Input value={m.comentario} onChange={(e) => handleMovimientoChange(i, "comentario", e.target.value)} />
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
          {/* Acciones */}
          <div className="flex justify-end gap-2 mt-6">
            <Button className="bg-red-600 text-white px-4 py-2 rounded mb-4 hover:bg-red-700 transition" onClick={onClose}>Cancelar</Button>
            <Button className="bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-700 transition" onClick={handleSave} disabled={!balanceado || !!numeracionError}>Guardar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
