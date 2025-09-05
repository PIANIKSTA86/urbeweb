import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TercerosTableProps {
  searchTerm: string;
  tipoFiltro: string;
  onEdit: (tercero: any) => void;
}

export function TercerosTable({ searchTerm, tipoFiltro, onEdit }: TercerosTableProps) {
  const [page, setPage] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [terceroToDelete, setTerceroToDelete] = useState<any>(null);
  const limit = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/terceros", searchTerm, tipoFiltro === "todos" ? "" : tipoFiltro, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('busqueda', searchTerm);
      if (tipoFiltro && tipoFiltro !== "todos") params.append('tipo', tipoFiltro);
      params.append('limite', limit.toString());
      params.append('offset', (page * limit).toString());
      
      const response = await fetch(`/api/terceros?${params.toString()}`, {
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
    mutationFn: async (terceroId: string) => {
      const response = await apiRequest('DELETE', `/api/terceros/${terceroId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/terceros'] });
      toast({
        title: "Tercero eliminado",
        description: "El tercero ha sido eliminado exitosamente",
      });
      setDeleteDialogOpen(false);
      setTerceroToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al eliminar el tercero",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (tercero: any) => {
    setTerceroToDelete(tercero);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (terceroToDelete) {
      deleteMutation.mutate(terceroToDelete.id);
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'propietario': return 'bg-green-100 text-green-800';
      case 'inquilino': return 'bg-blue-100 text-blue-800';
      case 'proveedor': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (primerNombre: string, primerApellido: string) => {
    return `${primerNombre?.[0] || ''}${primerApellido?.[0] || ''}`.toUpperCase();
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
          <p>Error al cargar los terceros: {error.message}</p>
        </div>
      </Card>
    );
  }

  const terceros = (data as any)?.terceros || [];
  const total = (data as any)?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" data-testid="table-terceros">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Documento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {terceros.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  No se encontraron terceros
                </td>
              </tr>
            ) : (
              terceros.map((tercero: any) => (
                <tr key={tercero.id} data-testid={`row-tercero-${tercero.id}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary-foreground font-semibold text-sm">
                          {getInitials(tercero.primerNombre, tercero.primerApellido)}
                        </span>
                      </div>
                      <div>
                        <div className="text-foreground font-medium">
                          {tercero.primerNombre} {tercero.primerApellido}
                        </div>
                        {tercero.razonSocial && (
                          <div className="text-muted-foreground text-sm">{tercero.razonSocial}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-foreground">
                    <div>
                      <div className="font-medium">{tercero.numeroIdentificacion}</div>
                      <div className="text-sm text-muted-foreground">{tercero.tipoIdentificacion}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getTipoColor(tercero.tipoTercero)}>
                      {tercero.tipoTercero}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-foreground">
                    {tercero.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-foreground">
                    {tercero.telefono || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-primary hover:text-primary/80"
                        data-testid={`button-view-${tercero.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-secondary hover:text-secondary/80"
                        onClick={() => onEdit(tercero)}
                        data-testid={`button-edit-${tercero.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => handleDelete(tercero)}
                        data-testid={`button-delete-${tercero.id}`}
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
            Mostrando {page * limit + 1} a {Math.min((page + 1) * limit, total)} de {total} terceros
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
        <AlertDialogContent data-testid="dialog-delete-tercero">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tercero?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el tercero "{terceroToDelete?.primerNombre} {terceroToDelete?.primerApellido}" 
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