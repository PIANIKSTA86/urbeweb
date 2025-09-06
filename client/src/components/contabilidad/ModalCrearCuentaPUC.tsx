import { useForm, Controller } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BuscadorCuentasPadre } from "./BuscadorCuentasPadre";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";

function ModalCrearCuentaPUC({ isOpen, onClose, onCreated, puc }: ModalCrearCuentaPUCProps & { puc: any[] }) {
  const { register, handleSubmit, reset, setValue, control, formState: { isSubmitting } } = useForm();
  const { toast } = useToast();
  const [padreCuenta, setPadreCuenta] = useState<any>(null);
  const [errorCodigo, setErrorCodigo] = useState<string>("");

  const onSubmit = async (data: any) => {
    setErrorCodigo("");
    // Si hay padreCuenta, usar su código como padre_codigo
    if (padreCuenta) {
      data.padre_codigo = padreCuenta.codigo;
    }
    // Validación 1: que el código no exista
    const codigo = String(data.codigo).trim();
    if (puc.some((c: any) => c.codigo === codigo)) {
      setErrorCodigo("El código ya existe en el plan de cuentas.");
      console.warn("[VALIDACIÓN] Código ya existe:", codigo);
      return;
    }
    // Validación 2: si hay padre, el código debe empezar con el código del padre y tener 2 dígitos más
    if (padreCuenta) {
      if (!codigo.startsWith(padreCuenta.codigo)) {
        setErrorCodigo("El código debe comenzar con el código de la cuenta padre.");
        console.warn("[VALIDACIÓN] Código no inicia con padre:", codigo, padreCuenta.codigo);
        return;
      }
      const dif = codigo.length - padreCuenta.codigo.length;
      if (dif !== 2) {
        setErrorCodigo("El código debe tener exactamente 2 dígitos más que el código de la cuenta padre.");
        console.warn("[VALIDACIÓN] Longitud incorrecta:", codigo, padreCuenta.codigo);
        return;
      }
    }
    // Determinar el tipo según el primer dígito del código
    let tipo = "";
    switch (codigo.charAt(0)) {
      case "1": tipo = "activo"; break;
      case "2": tipo = "pasivo"; break;
      case "3": tipo = "patrimonio"; break;
      case "4": tipo = "ingreso"; break;
      case "5": tipo = "gasto"; break;
      case "6": tipo = "costo"; break;
      case "7": tipo = "costo"; break;
      case "8": tipo = "orden"; break;
      case "9": tipo = "orden"; break;
      default: tipo = "";
    }
    // Determinar el nivel según la longitud del código
    let nivel = 1;
    if (codigo.length === 1) nivel = 1;
    else if (codigo.length === 2) nivel = 2;
    else if (codigo.length === 4) nivel = 3;
    else if (codigo.length === 6) nivel = 4;
    else if (codigo.length === 8) nivel = 5;
    const payload = { ...data, tipo, nivel, registra_documento: data.registra_documento };
    console.log("[DEBUG] Enviando payload:", payload);
    try {
      const res = await fetch('/api/contabilidad/puc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log("[DEBUG] Respuesta recibida:", res);
      if (res.ok) {
        if (onCreated) onCreated();
        reset();
        onClose();
        toast({
          title: "Cuenta creada",
          description: "La cuenta fue creada exitosamente.",
          status: "success",
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData?.error || errorData?.mensaje || 'Error al crear la cuenta';
        console.error("[ERROR API]:", errorData);
      }
    } catch (err) {
      console.error("[ERROR RED]:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Cuenta PUC</DialogTitle>
        </DialogHeader>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="md:col-span-2">
            <label className="block font-medium mb-1">Nombre *</label>
            <Input {...register('nombre', { required: true })} type="text" placeholder="Nombre" />
          </div>
          <div>
            <label className="block font-medium mb-1">Padre (opcional, no nivel 5)</label>
            <BuscadorCuentasPadre
              value={padreCuenta}
              onSelect={cuenta => {
                setPadreCuenta(cuenta);
                setValue('padre_codigo', cuenta ? cuenta.codigo : '');
              }}
              placeholder="Buscar cuenta padre por código o nombre"
            />
            {/* Campo oculto para enviar el padre_codigo */}
            <input type="hidden" {...register('padre_codigo')} />
          </div>
          <div>
            <label className="block font-medium mb-1">Código *</label>
            <Input {...register('codigo', { required: true })} type="text" placeholder="Código" />
            {errorCodigo && <div className="text-red-500 text-xs mt-1">{errorCodigo}</div>}
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium mb-1">Descripción</label>
            <Textarea {...register('descripcion')} placeholder="Descripción" />
          </div>
          <div>
            <label className="block font-medium mb-1">Estado *</label>
            <Controller
              name="estado"
              control={control}
              defaultValue="1"
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Activo</SelectItem>
                    <SelectItem value="0">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">¿Es Débito? *</label>
            <Controller
              name="es_debito"
              control={control}
              defaultValue="1"
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="¿Es Débito?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sí</SelectItem>
                    <SelectItem value="0">No</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Registra tercero *</label>
            <Controller
              name="registra_tercero"
              control={control}
              defaultValue="1"
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Registra tercero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sí</SelectItem>
                    <SelectItem value="0">No</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Documento de cruce *</label>
            <Controller
              name="registra_documento"
              control={control}
              defaultValue="1"
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Documento de cruce" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sí</SelectItem>
                    <SelectItem value="0">No</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="md:col-span-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              onClick={() => console.log('[DEBUG] Botón Crear cuenta clickeado')}
            >
              {isSubmitting ? 'Creando...' : 'Crear cuenta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { ModalCrearCuentaPUC };
