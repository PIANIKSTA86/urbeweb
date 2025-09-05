import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { municipiosColombia } from "./municipios-colombia";

// Schema de validación para terceros
const terceroSchema = z.object({
  tipoPersona: z.enum(['natural', 'juridica']),
  tipoTercero: z.enum(['propietario', 'inquilino', 'proveedor']),
  tipoContribuyente: z.enum(['responsable_iva', 'no_responsable_iva', 'gran_contribuyente']),
  tipoIdentificacion: z.enum(['cedula', 'nit', 'pasaporte', 'cedula_extranjeria']),
  numeroIdentificacion: z.string().min(1, "Número de identificación es requerido"),
  primerNombre: z.string().optional(),
  segundoNombre: z.string().optional(),
  primerApellido: z.string().optional(),
  segundoApellido: z.string().optional(),
  razonSocial: z.string().optional(),
  direccion: z.string().min(1, "Dirección es requerida"),
  pais: z.string().default('Colombia'),
  departamento: z.string().min(1, "Departamento es requerido"),
  municipio: z.string().min(1, "Municipio es requerido"),
  telefono: z.string().optional(),
  movil: z.string().optional(),
  email: z.string().email("Email válido requerido").optional().or(z.literal("")),
}).refine((data) => {
  // Si es persona natural, debe tener nombres y apellidos
  if (data.tipoPersona === 'natural') {
    return data.primerNombre && data.primerApellido;
  }
  // Si es persona jurídica, debe tener razón social
  if (data.tipoPersona === 'juridica') {
    return data.razonSocial;
  }
  return true;
}, {
  message: "Información personal incompleta",
  path: ["primerNombre"]
});

type TerceroFormData = z.infer<typeof terceroSchema>;

interface TerceroFormProps {
  isOpen: boolean;
  onClose: () => void;
  tercero?: any;
  mode: 'create' | 'edit';
}

export function TerceroForm({ isOpen, onClose, tercero, mode }: TerceroFormProps) {
  // Lista oficial de departamentos de Colombia (DANE)
  const departamentosColombia = [
    "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá", "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "San Andrés y Providencia", "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada"
  ];

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<TerceroFormData>({
    resolver: zodResolver(terceroSchema),
    defaultValues: {
      tipoPersona: 'natural',
      tipoTercero: 'propietario',
      tipoContribuyente: 'no_responsable_iva',
      tipoIdentificacion: 'cedula',
      numeroIdentificacion: '',
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      razonSocial: '',
      direccion: '',
      pais: 'Colombia',
      departamento: '',
      municipio: '',
      telefono: '',
      movil: '',
      email: '',
    },
  });
  // Estado para el país seleccionado
  const paisSeleccionado = form.watch('pais');

  const departamentoSeleccionado = form.watch('departamento');
  const tipoPersona = form.watch('tipoPersona');

  // Llenar el formulario cuando se edita un tercero
  useEffect(() => {
    if (tercero && mode === 'edit') {
      form.reset({
        tipoPersona: tercero.tipoPersona || 'natural',
        tipoTercero: tercero.tipoTercero || 'propietario',
        tipoContribuyente: tercero.tipoContribuyente || 'no_responsable_iva',
        tipoIdentificacion: tercero.tipoIdentificacion || 'cedula',
        numeroIdentificacion: tercero.numeroIdentificacion || '',
        primerNombre: tercero.primerNombre || '',
        segundoNombre: tercero.segundoNombre || '',
        primerApellido: tercero.primerApellido || '',
        segundoApellido: tercero.segundoApellido || '',
        razonSocial: tercero.razonSocial || '',
        direccion: tercero.direccion || '',
        pais: tercero.pais || 'Colombia',
        departamento: tercero.departamento || '',
        municipio: tercero.municipio || '',
        telefono: tercero.telefono || '',
        movil: tercero.movil || '',
        email: tercero.email || '',
      });
    }
  }, [tercero, mode, form]);

  const mutation = useMutation({
    mutationFn: async (data: TerceroFormData) => {
      const url = mode === 'create' ? '/api/terceros' : `/api/terceros/${tercero.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      // Enviar municipioCodigoDane (el valor seleccionado en municipio)
      const payload = {
        ...data,
        municipioCodigoDane: data.municipio,
      };
      const response = await apiRequest(method, url, payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/terceros'] });
      toast({
        title: mode === 'create' ? "Tercero creado" : "Tercero actualizado",
        description: mode === 'create' ? "El tercero ha sido creado exitosamente" : "El tercero ha sido actualizado exitosamente",
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

  const onSubmit = (data: TerceroFormData) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-tercero-form">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {mode === 'create' ? 'Crear Nuevo Tercero' : 'Editar Tercero'}
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
                name="tipoPersona"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Persona *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tipo-persona">
                          <SelectValue placeholder="Seleccionar tipo de persona" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="natural">Persona Natural</SelectItem>
                        <SelectItem value="juridica">Persona Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipoTercero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Tercero *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tipo-tercero-form">
                          <SelectValue placeholder="Seleccionar tipo de tercero" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="propietario">Propietario</SelectItem>
                        <SelectItem value="inquilino">Inquilino</SelectItem>
                        <SelectItem value="proveedor">Proveedor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Identificación */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="tipoIdentificacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Identificación *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tipo-identificacion">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cedula">Cédula</SelectItem>
                        <SelectItem value="nit">NIT</SelectItem>
                        <SelectItem value="pasaporte">Pasaporte</SelectItem>
                        <SelectItem value="cedula_extranjeria">Cédula de Extranjería</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numeroIdentificacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Identificación *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Número de documento"
                        data-testid="input-numero-identificacion"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipoContribuyente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Contribuyente *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tipo-contribuyente">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="responsable_iva">Responsable IVA</SelectItem>
                        <SelectItem value="no_responsable_iva">No Responsable IVA</SelectItem>
                        <SelectItem value="gran_contribuyente">Gran Contribuyente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Información personal */}
            {tipoPersona === 'natural' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primerNombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primer Nombre *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Primer nombre"
                          data-testid="input-primer-nombre"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="segundoNombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segundo Nombre</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Segundo nombre"
                          data-testid="input-segundo-nombre"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primerApellido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primer Apellido *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Primer apellido"
                          data-testid="input-primer-apellido"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="segundoApellido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segundo Apellido</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Segundo apellido"
                          data-testid="input-segundo-apellido"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <FormField
                control={form.control}
                name="razonSocial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razón Social *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Razón social de la empresa"
                        data-testid="input-razon-social"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="pais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País *</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger data-testid="select-pais">
                          <SelectValue placeholder="Seleccionar país" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* América */}
                          <SelectItem value="Colombia">Colombia</SelectItem>
                          <SelectItem value="Argentina">Argentina</SelectItem>
                          <SelectItem value="Brasil">Brasil</SelectItem>
                          <SelectItem value="Chile">Chile</SelectItem>
                          <SelectItem value="México">México</SelectItem>
                          <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                          <SelectItem value="Canadá">Canadá</SelectItem>
                          <SelectItem value="Perú">Perú</SelectItem>
                          <SelectItem value="Ecuador">Ecuador</SelectItem>
                          <SelectItem value="Uruguay">Uruguay</SelectItem>
                          <SelectItem value="Venezuela">Venezuela</SelectItem>
                          {/* Europa */}
                          <SelectItem value="España">España</SelectItem>
                          <SelectItem value="Francia">Francia</SelectItem>
                          <SelectItem value="Alemania">Alemania</SelectItem>
                          <SelectItem value="Italia">Italia</SelectItem>
                          <SelectItem value="Reino Unido">Reino Unido</SelectItem>
                          <SelectItem value="Portugal">Portugal</SelectItem>
                          <SelectItem value="Países Bajos">Países Bajos</SelectItem>
                          <SelectItem value="Suiza">Suiza</SelectItem>
                          <SelectItem value="Suecia">Suecia</SelectItem>
                          <SelectItem value="Noruega">Noruega</SelectItem>
                          {/* Asia */}
                          <SelectItem value="China">China</SelectItem>
                          <SelectItem value="Japón">Japón</SelectItem>
                          <SelectItem value="India">India</SelectItem>
                          <SelectItem value="Corea del Sur">Corea del Sur</SelectItem>
                          <SelectItem value="Singapur">Singapur</SelectItem>
                          <SelectItem value="Turquía">Turquía</SelectItem>
                          <SelectItem value="Emiratos Árabes Unidos">Emiratos Árabes Unidos</SelectItem>
                          <SelectItem value="Israel">Israel</SelectItem>
                          {/* Otro */}
                          <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento *</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={paisSeleccionado !== "Colombia"}
                      >
                        <SelectTrigger data-testid="select-departamento">
                          <SelectValue placeholder="Seleccionar departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {departamentosColombia.map(dep => (
                            <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="municipio"
                render={({ field }) => {
                  // Find selected municipio object
                  const municipioObj = (municipiosColombia[departamentoSeleccionado] || []).find(mun => mun.codigo === field.value);
                  return (
                    <FormItem>
                      <FormLabel>Municipio *</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={paisSeleccionado !== "Colombia" || !departamentoSeleccionado}
                        >
                          <SelectTrigger data-testid="select-municipio">
                            <SelectValue placeholder="Seleccionar municipio" />
                          </SelectTrigger>
                          <SelectContent>
                            {(municipiosColombia[departamentoSeleccionado] || []).map(mun => (
                              <SelectItem key={mun.codigo} value={mun.codigo}>
                                {mun.nombre} ({mun.codigo})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      {/* Read-only field showing selected municipio name and code */}
                      {municipioObj && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <strong>Municipio seleccionado:</strong> {municipioObj.nombre} <br />
                          <strong>Código DANE:</strong> {municipioObj.codigo}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Dirección completa"
                      data-testid="input-direccion"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Teléfono fijo"
                        data-testid="input-telefono"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="movil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Móvil</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Teléfono móvil"
                        data-testid="input-movil"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
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
                {mutation.isPending ? 'Guardando...' : (mode === 'create' ? 'Crear Tercero' : 'Actualizar Tercero')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}