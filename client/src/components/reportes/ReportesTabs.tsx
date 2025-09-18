import React from "react";

interface Props {
  categorias: string[];
  active: string;
  onChange: (cat: string) => void;
}

const ReportesTabs: React.FC<Props> = ({ categorias, active, onChange }) => (
  <div className="flex gap-2 border-b mb-4">
    {categorias.map(cat => (
      <button
        key={cat}
        className={`px-4 py-2 rounded-t font-semibold ${active === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        onClick={() => onChange(cat)}
      >
        {cat}
      </button>
    ))}
  </div>
);

export default ReportesTabs;
