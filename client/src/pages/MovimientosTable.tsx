import React from 'react';
import { useTable, useBlockLayout, useResizeColumns } from 'react-table';
import './resizable-table.css';
import { Edit, Trash2 } from 'lucide-react';

/**
 * @param {{ data: any[], onEdit: (mov: any) => void, onDelete: (id: any) => void }} props
 */
const MovimientosTable = ({ data, onEdit, onDelete }: { data: any[]; onEdit: (mov: any) => void; onDelete: (id: any) => void }) => {
  const columns = React.useMemo(() => [
    {
      Header: 'Tipo de documento',
      accessor: 'tipoTransaccion',
      width: 120,
    },
    {
      Header: 'Fecha',
  accessor: (d: any) => d.fecha ? d.fecha.slice(0, 10) : '-',
      id: 'fecha',
      width: 100,
    },
    {
      Header: 'No. documento',
      accessor: 'numeroComprobante',
      width: 120,
    },
    {
      Header: 'Débito',
  accessor: (d: any) => (d.detalles?.reduce((sum: any, m: any) => sum + (typeof m.debito === 'number' ? m.debito : Number(m.debito) || 0), 0) || 0).toLocaleString(),
      id: 'debito',
      width: 100,
    },
    {
      Header: 'Crédito',
  accessor: (d: any) => (d.detalles?.reduce((sum: any, m: any) => sum + (typeof m.credito === 'number' ? m.credito : Number(m.credito) || 0), 0) || 0).toLocaleString(),
      id: 'credito',
      width: 100,
    },
    {
      Header: 'Nombre de tercero',
      accessor: (d: any) => {
        let nombreTercero = "-";
        if (d.detalles?.length) {
          const movTercero = d.detalles.find((m: any) => m.tercero?.razonSocial || m.tercero_nombre || m.terceroRazonSocial);
          if (movTercero) {
            nombreTercero = movTercero.tercero?.razonSocial || movTercero.tercero_nombre || movTercero.terceroRazonSocial || movTercero.tercero_id || "-";
          } else {
            nombreTercero = d.detalles[0].tercero_id || "-";
          }
        }
        return nombreTercero;
      },
      id: 'tercero',
      width: 160,
    },
    {
      Header: 'Descripción',
      accessor: 'concepto',
      width: 180,
    },
    {
      Header: 'Estado',
      accessor: 'estado',
      width: 100,
    },
    {
      Header: 'Acciones',
      id: 'acciones',
      width: 120,
  Cell: ({ row }: { row: any }) => (
        <div className="flex gap-2">
          <button className="text-yellow-600" title="Editar" onClick={() => onEdit(row.original)}>
            <Edit className="h-4 w-4" />
          </button>
          <button className="text-red-600" title="Eliminar" onClick={() => onDelete(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ], [onEdit, onDelete]);

  const defaultColumn = React.useMemo(
    () => ({ minWidth: 50, width: 120, maxWidth: 600 }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
    },
    useBlockLayout,
    useResizeColumns
  );

  return (
    <div className="overflow-auto max-h-[400px]">
      <table {...getTableProps()} className="min-w-full border text-sm resizable-table">
        <thead>
          {headerGroups.map((headerGroup: any) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column: any) => (
                <th {...column.getHeaderProps()} style={column.getHeaderProps().style}>
                  {column.render('Header')}
                  {column.canResize && (
                    <div {...column.getResizerProps()} className="resizer" />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row: any) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell: any) => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MovimientosTable;
