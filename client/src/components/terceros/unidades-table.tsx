/* global fetch, localStorage */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UnidadesTableProps {
  searchTerm: string;
  propietarioId?: string;
  onEdit: (unidad: any) => void;
}

export function UnidadesTable({ searchTerm, propietarioId, onEdit }: UnidadesTableProps) {
  const [page, setPage] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unidadToDelete, setUnidadToDelete] = useState<any>(null);
  const limit = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/unidades", searchTerm, propietarioId, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('busqueda', searchTerm);
      if (propietarioId) params.append('propietarioId', propietarioId);
      params.append('limite', limit.toString());
      params.append('offset', (page * limit).toString());
      
          const response = await fetch(`/api/unidades?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (unidadId: string) => {
      const response = await apiRequest('DELETE', `/api/unidades/${unidadId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/unidades'] });
      toast({
        title: "Unidad eliminada",
        description: "La unidad ha sido eliminada exitosamente",
      });
      setDeleteDialogOpen(false);
      setUnidadToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al eliminar la unidad",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (unidad: any) => {
    setUnidadToDelete(unidad);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (unidadToDelete) {
      deleteMutation.mutate(unidadToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="p-6 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="overflow-hidden">
        <div className="p-6 text-center text-destructive">
          <p>Error al cargar las unidades: {error.message}</p>
        </div>
      </Card>
    );
  }

  const unidades = (data as any)?.unidades || [];
  const total = (data as any)?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'apartamento': return 'bg-blue-100 text-blue-800';
      case 'local_comercial': return 'bg-purple-100 text-purple-800';
      case 'oficina': return 'bg-green-100 text-green-800';
      case 'deposito': return 'bg-gray-100 text-gray-800';
      case 'parqueadero': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ocupado': return 'bg-green-100 text-green-800';
      case 'desocupado': return 'bg-red-100 text-red-800';
      case 'en_mantenimiento': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" data-testid="table-unidades">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Unidad
              </th>
              <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Propietario
              </th>
              <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Área
              </th>
              <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Cuota Admin.
              </th>
              <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {unidades.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  No se encontraron unidades
                </td>
              </tr>
            ) : (
              unidades.map((unidad: any) => (
                <tr key={unidad.id} data-testid={`row-unidad-${unidad.id}`}>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div>
                      <div className="text-foreground font-medium">
                        {unidad.codigoUnidad}
                      </div>
                      <div className="text-sm">
                        <Badge className={getTipoColor(unidad.tipoUnidad)}>
                          {unidad.tipoUnidad}
                        </Badge>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-foreground">
                    {unidad.propietario ? (
                      <div>
                        <div className="font-medium">
                          {unidad.propietario.primerNombre} {unidad.propietario.primerApellido}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {unidad.propietario.numeroIdentificacion}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Sin propietario</span>
                    )}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-foreground">
                    {unidad.area} m²
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-foreground">
                    {formatCurrency(unidad.cuotaAdministracion)}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <Badge className={getEstadoColor(unidad.estadoOcupacion)}>
                      {unidad.estadoOcupacion}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-primary hover:text-primary/80"
                        data-testid={`button-view-${unidad.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-secondary hover:text-secondary/80"
                        onClick={() => onEdit(unidad)}
                        data-testid={`button-edit-${unidad.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => handleDelete(unidad)}
                        data-testid={`button-delete-${unidad.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Paginación */}
      <div className="bg-muted/30 px-6 py-3 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {page * limit + 1} a {Math.min((page + 1) * limit, total)} de {total} unidades
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              data-testid="button-prev-page"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            
            <div className="flex space-x-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNumber = i;
                return (
                  <Button
                    key={i}
                    variant={page === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNumber)}
                    data-testid={`button-page-${pageNumber + 1}`}
                  >
                    {pageNumber + 1}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              data-testid="button-next-page"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-unidad">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar unidad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la unidad "{unidadToDelete?.codigoUnidad}" 
              del sistema. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}