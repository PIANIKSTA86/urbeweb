import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BuscadorCuentasPadre } from "./BuscadorCuentasPadre";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ModalCrearCuentaPUCProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function ModalCrearCuentaPUC({ isOpen, onClose, onCreated }: ModalCrearCuentaPUCProps) {
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm();
  const [padreCuenta, setPadreCuenta] = useState<any>(null);

  const onSubmit = async (data: any) => {
    // Si hay padreCuenta, usar su código como padre_codigo
    if (padreCuenta) {
      data.padre_codigo = padreCuenta.codigo;
    }
    // Determinar el tipo según el primer dígito del código
    const codigo = String(data.codigo).trim();
    const primerDigito = codigo.charAt(0);
    let tipo = "";
    switch (primerDigito) {
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
    try {
      const res = await fetch('/api/contabilidad/puc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        if (onCreated) onCreated();
        reset();
        onClose();
      } else {
        alert('Error al crear la cuenta');
      }
    } catch {
      alert('Error de conexión');
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
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium mb-1">Descripción</label>
            <Textarea {...register('descripcion')} placeholder="Descripción" />
          </div>
          <div>
            <label className="block font-medium mb-1">Estado *</label>
            <Select defaultValue="1" {...register('estado', { required: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Activo</SelectItem>
                <SelectItem value="0">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block font-medium mb-1">¿Es Débito? *</label>
            <Select {...register('es_debito', { required: true })}>
              <SelectTrigger>
                <SelectValue placeholder="¿Es Débito?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Sí</SelectItem>
                <SelectItem value="0">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block font-medium mb-1">Registra tercero *</label>
            <Select {...register('registra_tercero', { required: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Registra tercero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Sí</SelectItem>
                <SelectItem value="0">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block font-medium mb-1">Documento de cruce *</label>
            <Select {...register('registra_documento', { required: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Documento de cruce" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Sí</SelectItem>
                <SelectItem value="0">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear cuenta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
