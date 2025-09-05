import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

// Schema de validación para unidades habitacionales
const unidadSchema = z.object({
  tipoUnidad: z.enum(['apartamento', 'local_comercial', 'oficina', 'deposito', 'parqueadero']),
  codigoUnidad: z.string().min(1, "Código de unidad es requerido"),
  propietarioId: z.string().optional(),
  inquilinoId: z.string().optional(),
  area: z.string().min(1, "Área es requerida"),
  coeficiente: z.string().min(1, "Coeficiente es requerido"),
  cuotaAdministracion: z.string().min(1, "Cuota de administración es requerida"),
  tieneParqueadero: z.boolean().default(false),
  cuotaParqueadero: z.string().default("0"),
  generaIntereses: z.boolean().default(true),
  estadoOcupacion: z.enum(['ocupado', 'desocupado', 'en_mantenimiento']),
});

type UnidadFormData = z.infer<typeof unidadSchema>;

interface UnidadFormProps {
  isOpen: boolean;
  onClose: () => void;
  unidad?: any;
  mode: 'create' | 'edit';
}

export function UnidadForm({ isOpen, onClose, unidad, mode }: UnidadFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<UnidadFormData>({
    resolver: zodResolver(unidadSchema),
    defaultValues: {
      tipoUnidad: 'apartamento',
      codigoUnidad: '',
      propietarioId: '',
      inquilinoId: '',
      area: '',
      coeficiente: '',
      cuotaAdministracion: '',
      tieneParqueadero: false,
      cuotaParqueadero: '0',
      generaIntereses: true,
      estadoOcupacion: 'desocupado',
    },
  });

  // Cargar propietarios para el select
  const { data: propietarios } = useQuery({
    queryKey: ['/api/terceros', '', 'propietario'],
    queryFn: async () => {
      const response = await fetch('/api/terceros?tipo=propietario&limite=100', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) throw new Error('Error al cargar propietarios');
      return response.json();
    },
  });

  // Cargar inquilinos para el select
  const { data: inquilinos } = useQuery({
    queryKey: ['/api/terceros', '', 'inquilino'],
    queryFn: async () => {
      const response = await fetch('/api/terceros?tipo=inquilino&limite=100', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) throw new Error('Error al cargar inquilinos');
      return response.json();
    },
  });

  const tieneParqueadero = form.watch('tieneParqueadero');

  // Llenar el formulario cuando se edita una unidad
  useEffect(() => {
    if (unidad && mode === 'edit') {
      form.reset({
        tipoUnidad: unidad.tipoUnidad || 'apartamento',
        codigoUnidad: unidad.codigoUnidad || '',
        propietarioId: unidad.propietarioId ? String(unidad.propietarioId) : '',
        inquilinoId: unidad.inquilinoId ? String(unidad.inquilinoId) : '',
        area: unidad.area?.toString() || '',
        coeficiente: unidad.coeficiente?.toString() || '',
        cuotaAdministracion: unidad.cuotaAdministracion?.toString() || '',
        tieneParqueadero: unidad.tieneParqueadero || false,
        cuotaParqueadero: unidad.cuotaParqueadero?.toString() || '0',
        generaIntereses: unidad.generaIntereses !== false,
        estadoOcupacion: unidad.estadoOcupacion || 'desocupado',
      });
    }
  }, [unidad, mode, form]);

  const mutation = useMutation({
    mutationFn: async (data: UnidadFormData) => {
      const url = mode === 'create' ? '/api/unidades' : `/api/unidades/${unidad.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      // Convertir strings a números para enviar al backend
      const processedData = {
        ...data,
        area: Number(data.area),
        coeficiente: Number(data.coeficiente),
        cuotaAdministracion: Number(data.cuotaAdministracion),
        cuotaParqueadero: Number(data.cuotaParqueadero),
        propietarioId: data.propietarioId || undefined,
        inquilinoId: data.inquilinoId || undefined,
      };
      
      const response = await apiRequest(method, url, processedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/unidades'] });
      toast({
        title: mode === 'create' ? "Unidad creada" : "Unidad actualizada",
        description: mode === 'create' ? "La unidad ha sido creada exitosamente" : "La unidad ha sido actualizada exitosamente",
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al procesar la solicitud",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UnidadFormData) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const propietariosList = propietarios?.terceros || [];
  const inquilinosList = inquilinos?.terceros || [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-unidad-form">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {mode === 'create' ? 'Crear Nueva Unidad' : 'Editar Unidad'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipoUnidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Unidad *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tipo-unidad">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="apartamento">Apartamento</SelectItem>
                        <SelectItem value="local_comercial">Local Comercial</SelectItem>
                        <SelectItem value="oficina">Oficina</SelectItem>
                        <SelectItem value="deposito">Depósito</SelectItem>
                        <SelectItem value="parqueadero">Parqueadero</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codigoUnidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Unidad *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: 101, LC-01, OF-205"
                        data-testid="input-codigo-unidad"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Propietario e Inquilino */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="propietarioId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Propietario</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-propietario">
                          <SelectValue placeholder="Seleccionar propietario" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propietariosList.map((propietario: any) => (
                          <SelectItem key={propietario.id} value={String(propietario.id)}>
                            {propietario.primerNombre} {propietario.primerApellido} - {propietario.numeroIdentificacion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inquilinoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inquilino</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-inquilino">
                          <SelectValue placeholder="Sin inquilino" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {inquilinosList.map((inquilino: any) => (
                          <SelectItem key={inquilino.id} value={inquilino.id}>
                            {inquilino.primerNombre} {inquilino.primerApellido} - {inquilino.numeroIdentificacion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Información técnica */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área (m²) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ej: 75.50"
                        data-testid="input-area"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coeficiente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coeficiente *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.000001"
                        placeholder="Ej: 0.025000"
                        data-testid="input-coeficiente"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estadoOcupacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado de Ocupación *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-estado-ocupacion">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ocupado">Ocupado</SelectItem>
                        <SelectItem value="desocupado">Desocupado</SelectItem>
                        <SelectItem value="en_mantenimiento">En Mantenimiento</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Información financiera */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cuotaAdministracion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuota de Administración *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ej: 250000"
                        data-testid="input-cuota-administracion"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {tieneParqueadero && (
                <FormField
                  control={form.control}
                  name="cuotaParqueadero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuota de Parqueadero</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ej: 50000"
                          data-testid="input-cuota-parqueadero"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Opciones adicionales */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="tieneParqueadero"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Tiene Parqueadero</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Esta unidad incluye un parqueadero
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-tiene-parqueadero"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="generaIntereses"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Genera Intereses</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Aplicar intereses por mora en los pagos
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-genera-intereses"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                data-testid="button-cancel"
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                data-testid="button-save"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Guardando...' : (mode === 'create' ? 'Crear Unidad' : 'Actualizar Unidad')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}