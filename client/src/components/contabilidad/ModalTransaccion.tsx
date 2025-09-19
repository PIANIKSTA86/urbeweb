

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Trash, FileText, Printer, Shield } from "lucide-react";
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
  // ...otros campos...
}

// --- Componente principal ---
function ModalTransaccion(props: any) {
  const { periodos = [] } = props;
  /* global fetch, localStorage */
  // ...existing code...

  // Llama a handleGuardar con el estado actualmente seleccionado
  const handleAprobarContabilizar = () => {
    handleSave();
  };
  // Tipos mínimos si no existen
  type Prefijo = any;
  type Movimiento = any;

  // Estados faltantes
  const [terceroLocal, setTerceroLocal] = useState<Tercero | null>(null);
  const [puc, setPuc] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCrearCuenta, setShowCrearCuenta] = useState<boolean>(false);
  const [unicoTercero, setUnicoTercero] = useState<boolean>(false);
  const { open, onClose, onSave, tercero, onTerceroChange } = props;
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
  const [periodoId, setPeriodoId] = useState<string | undefined>(undefined);
  // Estado de la transacción (borrador o contabilizado)
  const [estado, setEstado] = useState<'borrador' | 'contabilizado'>('contabilizado');

  // Estados para edición amigable de inputs de débito y crédito
  const [editingCell, setEditingCell] = useState<{row: number, field: 'debito'|'credito'|null} | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  useEffect(() => {
    if (open) {
      fetch("/api/contabilidad/tipos-transaccion")
        .then(res => res.json())
        .then(data => setTiposTransaccion(Array.isArray(data) ? data : []));
      fetch("/api/contabilidad/prefijos")
        .then(res => res.json())
        .then(data => setPrefijos(Array.isArray(data) ? data : []));
      fetch("/api/contabilidad/puc")
        .then(res => res.json())
        .then(data => setPuc(Array.isArray(data) ? data : []));
    }
  }, [open]);


  // Filtrar prefijos según el tipo de transacción seleccionado
  const prefijosFiltrados = prefijos.filter((p) => String(p.tipo_transaccion_id) === tipoTransaccion);

  // Sincroniza prefijo y numeración al cambiar tipo de transacción o lista de prefijos

  useEffect(() => {
    if (prefijosFiltrados.length > 0) {
      setPrefijo(prefijosFiltrados[0].prefijo);
      if (autoNumeracion) {
        // Obtener el siguiente consecutivo real desde el backend
        fetch(`/api/contabilidad/siguiente-numeracion?prefijo=${encodeURIComponent(prefijosFiltrados[0].prefijo)}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.siguiente) {
              setNumeracion(String(data.siguiente));
            } else {
              setNumeracion(String(prefijosFiltrados[0].numeracion_actual));
            }
          })
          .catch(() => setNumeracion(String(prefijosFiltrados[0].numeracion_actual)));
      }
    } else {
      setPrefijo("");
      setNumeracion("");
    }
  }, [tipoTransaccion, prefijos]);

  // Sincroniza numeración al cambiar prefijo si está en modo automático

  useEffect(() => {
    if (autoNumeracion && prefijo) {
      // Obtener el siguiente consecutivo real desde el backend
      fetch(`/api/contabilidad/siguiente-numeracion?prefijo=${encodeURIComponent(prefijo)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.siguiente) {
            setNumeracion(String(data.siguiente));
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefijo]);

  // Si el usuario activa/desactiva el modo automático, sincroniza numeración
  useEffect(() => {
    if (autoNumeracion && prefijo) {
      const pref = prefijosFiltrados.find((p) => p.prefijo === prefijo);
      if (pref) {
        setNumeracion(String(pref.numeracion_actual));
      }
    }
  }, [autoNumeracion]);

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

  // El periodo se determina solo al guardar, no al cambiar la fecha
  // Por lo tanto, periodoId se calcula en handleSave

  // Guardar transacción solo si hay periodo válido
  const handleSave = async () => {
    if (!balanceado || numeracionError) return;
    if (unicoTercero) {
      if (!terceroLocal) {
        setError('Debes seleccionar un tercero para la transacción.');
        return;
      }
    } else {
      // Validar que cada movimiento tenga un tercero
      const movimientosSinTercero = movimientos.filter(mov => !(mov.tercero?.id ?? mov.tercero_id?.id ?? mov.tercero_id));
      if (movimientosSinTercero.length > 0) {
        setError('Todos los movimientos deben tener un tercero seleccionado.');
        return;
      }
    }
    // Determinar periodo activo para la fecha seleccionada
    let periodoIdLocal: string | undefined = undefined;
    if (fecha && periodos.length > 0) {
      // Usar siempre los campos fecha_inicio y fecha_fin, comparar como string YYYY-MM-DD
      const fechaStr = fecha.toISOString().slice(0, 10);
      const periodo = periodos.find((p: any) => {
        const inicioStr = (p.fecha_inicio || '').slice(0, 10);
        const finStr = (p.fecha_fin || p.fecha_cierre || '').slice(0, 10);
        const estado = (p.estado || p.estado_periodo || '').toString().toLowerCase();
        return fechaStr >= inicioStr && fechaStr <= finStr && (estado.includes('abierto') || estado.includes('activo'));
      });
      if (periodo) {
        periodoIdLocal = periodo.id;
      }
    }
    if (!periodoIdLocal) {
      setError('No es posible guardar la transacción: la fecha seleccionada no pertenece a ningún periodo contable activo o abierto. Por favor, revisa la fecha o consulta la configuración de periodos.');
      return;
    }
    // Validar que todos los movimientos tengan cuenta_id
    const movimientosInvalidos = movimientos.filter(mov => !(mov.cuenta?.id ?? mov.cuenta_id));
    if (movimientosInvalidos.length > 0) {
      setError('Todos los movimientos deben tener una cuenta seleccionada.');
      return;
    }
    // Sincronizar numeración con backend antes de guardar
    let numeracionFinal = numeracion;
    if (autoNumeracion && prefijo) {
      try {
        const resNum = await fetch(`/api/contabilidad/siguiente-numeracion?prefijo=${encodeURIComponent(prefijo)}`);
        const dataNum = await resNum.json();
        if (dataNum && dataNum.siguiente) {
          numeracionFinal = String(dataNum.siguiente);
          setNumeracion(numeracionFinal);
        }
      } catch {}
    }
    const numeroDoc = `${prefijo}-${numeracionFinal}`;
    const res = await fetch(`/api/contabilidad/comprobantes/numero/${encodeURIComponent(numeroDoc)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.exists) {
        setError('Ya existe un documento con ese número.');
        return;
      }
    }
    // Si único tercero está activo, asignar el tercero a todos los movimientos
    let movimientosAEnviar = movimientos;
    if (unicoTercero && terceroLocal) {
      movimientosAEnviar = movimientos.map(mov => ({ ...mov, tercero: terceroLocal }));
    }
    // Transformar movimientos: cuenta_id y tercero_id deben ser solo el id, y enviar documentoCruce y comentario
    const movimientosTransformados = movimientosAEnviar.map(mov => ({
      cuenta_id: mov.cuenta?.id ?? mov.cuenta_id ?? null,
      tercero_id: mov.tercero?.id ?? mov.tercero_id?.id ?? null,
      documentoCruce: mov.documentoCruce || '',
      comentario: mov.comentario || '',
      descripcion: mov.descripcion || '',
      debito: mov.debito,
      credito: mov.credito
    }));
    // Buscar el objeto del tipo seleccionado
    const tipoObj = tiposTransaccion.find(t => String(t.id) === String(tipoTransaccion));
    const tipo = tipoObj ? tipoObj.nombre : tipoTransaccion;
  onSave({ tipo, prefijo, numeracion: numeracionFinal, descripcion, movimientos: movimientosTransformados, estado, periodo_id: periodoIdLocal, fecha });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-full" style={{ minWidth: 350, maxWidth: '75vw', overflowX: 'auto' }}>
          <DialogHeader>
            <DialogTitle>Nueva Transacción</DialogTitle>
          </DialogHeader>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            {/* Primera sección: datos principales */}
            <div className="flex gap-4 mb-4 items-end flex-wrap">
              {/* Selector de estado movido a la parte inferior */}
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
                <label className="flex items-center gap-2">
                  Numeracion
                  <Checkbox
                  checked={autoNumeracion}
                  onCheckedChange={(v) => setAutoNumeracion(!!v)}
                  className="ml-2"
                />
                <span className="ml-1 text-sm">Auto</span>
              </label>
              <Input
                type="number"
                value={numeracion}
                onChange={(e) => handleChangeNumeracion(e.target.value)}
                disabled={autoNumeracion}
                className="w-36"
              />
              {numeracionError && <p className="text-red-500 text-sm">{numeracionError}</p>}
            </div>
            <div className="flex flex-col">
              <label>Fecha transacción</label>
              <Input
                type="date"
                className="w-[200px]"
                value={fecha ? fecha.toISOString().substring(0, 10) : ""}
                onChange={e => {
                  // Crear fecha en UTC para evitar desfases
                  if (e.target.value) {
                    const [year, month, day] = e.target.value.split('-');
                    setFecha(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))));
                  } else {
                    setFecha(undefined);
                  }
                }}
                // min y max eliminados para permitir cualquier fecha
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
                <span className="text-xs">Unico para toda la transacción</span>
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
              <Button className="bg-primary text-white px-4 py-2 rounded mb-4 hover:bg-blue-700 transition" onClick={() => setShowCrearCuenta(true)}>Nueva cuenta</Button>
              <Button className="bg-primary text-white px-4 py-2 rounded mb-4 hover:bg-blue-700 transition" onClick={() => setShowCrearTercero(true)}>Nuevo tercero</Button>
            </div>
            <div className="flex-1 flex flex-col">
              <label>Descripción</label>
              <textarea
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                className="w-full min-h-[38px] max-h-[120px] border rounded px-2 py-1 resize-vertical"
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
                      <Input
                        type="text"
                        value={
                          editingCell && editingCell.row === i && editingCell.field === 'debito'
                            ? editingValue
                            : m.debito === null || m.debito === undefined
                              ? ''
                              : Number(m.debito).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        }
                        onFocus={e => {
                          setEditingCell({row: i, field: 'debito'});
                          setEditingValue(
                            m.debito === null || m.debito === undefined
                              ? ''
                              : m.debito.toString().replace('.', ',')
                          );
                        }}
                        onChange={e => {
                          if (editingCell && editingCell.row === i && editingCell.field === 'debito') {
                            setEditingValue(e.target.value);
                          } else {
                            setEditingCell({row: i, field: 'debito'});
                            setEditingValue(e.target.value);
                          }
                        }}
                        onBlur={e => {
                          // Permitir decimales y separador de miles
                          let val = e.target.value.replace(/\./g, '').replace(/,/g, '.');
                          val = val.replace(/[^\d.]/g, '');
                          const parts = val.split('.');
                          if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                          handleMovimientoChange(i, "debito", val === '' ? '' : Number(val));
                          setEditingCell(null);
                          setEditingValue('');
                        }}
                        disabled={!!m.credito && Number(m.credito) !== 0}
                        inputMode="decimal"
                        step="0.01"
                      />
                    </td>
                    <td className="border p-1">
                      <Input
                        type="text"
                        value={
                          editingCell && editingCell.row === i && editingCell.field === 'credito'
                            ? editingValue
                            : m.credito === null || m.credito === undefined
                              ? ''
                              : Number(m.credito).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        }
                        onFocus={e => {
                          setEditingCell({row: i, field: 'credito'});
                          setEditingValue(
                            m.credito === null || m.credito === undefined
                              ? ''
                              : m.credito.toString().replace('.', ',')
                          );
                        }}
                        onChange={e => {
                          if (editingCell && editingCell.row === i && editingCell.field === 'credito') {
                            setEditingValue(e.target.value);
                          } else {
                            setEditingCell({row: i, field: 'credito'});
                            setEditingValue(e.target.value);
                          }
                        }}
                        onBlur={e => {
                          let val = e.target.value.replace(/\./g, '').replace(/,/g, '.');
                          val = val.replace(/[^\d.]/g, '');
                          const parts = val.split('.');
                          if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                          handleMovimientoChange(i, "credito", val === '' ? '' : Number(val));
                          setEditingCell(null);
                          setEditingValue('');
                        }}
                        disabled={!!m.debito && Number(m.debito) !== 0}
                        inputMode="decimal"
                        step="0.01"
                      />
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
          <div className="flex justify-end gap-4 mt-4 text-base">
            <span className="font-medium">Total Débito: {totalDebito.toLocaleString('es-CO')}</span>
            <span className="font-medium">Total Crédito: {totalCredito.toLocaleString('es-CO')}</span>
            {!balanceado && <span className="text-red-500">⚠ No balanceado</span>}
          </div>
          {/* Cuarta sección: acciones finales */}
          <div className="flex flex-wrap gap-2 justify-end items-end mt-6">
            <div className="flex gap-2 flex-1 justify-start items-end">
              <Button variant="outline" className="mb-2 p-3 bg-orange-100 hover:bg-orange-200 border-orange-300" title="Imprimir">
                <Printer className="w-14 h-14 text-orange-500" />
              </Button>
              <Button variant="outline" className="mb-2 p-3 bg-green-100 hover:bg-green-200 border-green-300" title="Exportar PDF">
                <FileText className="w-10 h-10 text-green-600" />
              </Button>
              <Button variant="outline" className="mb-2 p-3 bg-blue-100 hover:bg-blue-200 border-blue-300" title="Auditoría">
                <Shield className="w-10 h-10 text-blue-600" />
              </Button>
            </div>
            {/* Selector de estado movido aquí */}
            <div className="flex flex-col justify-end mr-4">
              <label className="mb-1">Estado</label>
              <select value={estado} onChange={e => setEstado(e.target.value as 'contabilizado' | 'borrador')} className="border p-2 rounded w-[160px] align-middle">
                <option value="contabilizado">Contabilizado</option>
                <option value="borrador">Borrador</option>
                <option value="anulado">Anulado</option>
              </select>
            </div>
            <Button
              className="bg-green-600 text-white px-4 py-2 rounded mb-2 hover:bg-green-700 transition"
              onClick={handleAprobarContabilizar}
              disabled={loading}
            >
                {loading ? 'Guardando...' : 'Aprobar / Contabilizar'}
              </Button>
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

      {/* Modal de notificaciones */}
      <Dialog open={!!error || !!success} onOpenChange={() => { setError(null); setSuccess(null); }}>
        <DialogContent className="max-w-md w-full text-center">
          {error && <div className="text-red-600 font-semibold text-lg">{error}</div>}
          {success && <div className="text-green-600 font-semibold text-lg">{success}</div>}
          <Button className="mt-4" onClick={() => { setError(null); setSuccess(null); }}>Cerrar</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ModalTransaccion;


