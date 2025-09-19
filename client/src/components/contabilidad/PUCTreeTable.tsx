/* global alert */
import React, { useCallback } from "react";
import { Edit, Trash2 } from "lucide-react";

export interface CuentaNode {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  nivel: number;
  padre_codigo?: string;
  descripcion?: string;
  estado: number;
  es_debito: number;
  registra_tercero: number;
  children?: CuentaNode[];
}

interface Props {
  data: CuentaNode[];
  expanded: Set<string>;
  searchTerm?: string;
  highlight?: Set<string>;
}

function highlightText(text: string, term: string) {
  if (!term) return text;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;
  return <>{text.slice(0, idx)}<span className="bg-yellow-200 font-bold">{text.slice(idx, idx + term.length)}</span>{text.slice(idx + term.length)}</>;
}

export const PUCTreeTable: React.FC<Props> = ({ data, expanded, onToggle, onEdit, onDelete, searchTerm = "", highlight = new Set() }) => {
  const renderRows = useCallback((nodes: CuentaNode[], level = 0, visited = new Set<string>()) => {
    return nodes.map(node => {
      if (visited.has(node.codigo)) return null; // Previene ciclos
      const isExpanded = expanded.has(node.codigo);
      const hasChildren = node.children && node.children.length > 0;
      const isHighlighted = highlight.has(node.codigo);
      const newVisited = new Set(visited);
      newVisited.add(node.codigo);
      return (
        <React.Fragment key={node.codigo}>
          <tr className={isHighlighted ? "bg-yellow-100" : ""}>
            <td className="border px-2 py-1">
              <span style={{ paddingLeft: level * 18 }}>
                {hasChildren && (
                  <button
                    className="mr-1 text-xs text-blue-600 hover:underline"
                    onClick={() => onToggle(node.codigo)}
                    title={isExpanded ? "Colapsar" : "Expandir"}
                  >
                    {isExpanded ? "▼" : "▶"}
                  </button>
                )}
                {highlightText(node.codigo, searchTerm)}
              </span>
            </td>
            <td className="border px-2 py-1">{highlightText(node.nombre, searchTerm)}</td>
            <td className="border px-2 py-1 capitalize">{node.tipo}</td>
            <td className="border px-2 py-1">{node.nivel}</td>
            <td className="border px-2 py-1">{node.padre_codigo}</td>
            {/* <td className="border px-2 py-1">{node.descripcion}</td> */}
            {/* <td className="border px-2 py-1">
              <span className={node.estado === 1 ? "text-green-700 font-bold" : "text-gray-400"}>
                {node.estado === 1 ? "Activo" : "Inactivo"}
              </span>
            </td> */}
            <td className="border px-2 py-1">
              {node.es_debito === 1 && <span className="bg-blue-100 text-blue-800 px-2 rounded text-xs">Débito</span>}
            </td>
            <td className="border px-2 py-1">
              {node.registra_tercero === 1 && <span className="bg-purple-100 text-purple-800 px-2 rounded text-xs">Tercero</span>}
            </td>
            <td className="border px-2 py-1">
              <button className="text-blue-600 mr-2" title="Editar" onClick={() => onEdit(node)}>
                <Edit className="inline h-4 w-4" />
              </button>
              <button className="text-red-600" title="Eliminar" onClick={() => onDelete(node)}>
                <Trash2 className="inline h-4 w-4" />
              </button>
            </td>
          </tr>
          {hasChildren && isExpanded && renderRows(node.children!, level + 1, newVisited)}
        </React.Fragment>
      );
    });
  }, [expanded, onToggle, onEdit, onDelete, searchTerm, highlight]);

    
  return (
    <table className="min-w-full border text-sm">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-2 py-1">Código</th>
          <th className="border px-2 py-1">Nombre</th>
          <th className="border px-2 py-1">Tipo</th>
          <th className="border px-2 py-1">Nivel</th>
          <th className="border px-2 py-1">Padre Código</th>
          {/* <th className="border px-2 py-1">Descripción</th> */}
          {/* <th className="border px-2 py-1">Estado</th> */}
          <th className="border px-2 py-1">Débito</th>
          <th className="border px-2 py-1">Registra Tercero</th>
          <th className="border px-2 py-1">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {renderRows(data)}
      </tbody>
    </table>
  );
};
