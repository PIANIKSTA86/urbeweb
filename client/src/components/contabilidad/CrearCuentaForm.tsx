import { useForm } from "react-hook-form";

/* global fetch, alert */
export function CrearCuentaForm({ onClose }: { onClose: () => void }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const onSubmit = async (data: any) => {
    try {
      const res = await fetch('/api/contabilidad/puc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        alert('Cuenta creada correctamente');
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
    <form className="p-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <h3 className="font-semibold mb-4 text-lg">Nueva cuenta</h3>
      <div>
        <label className="block font-medium mb-1">Código</label>
        <input {...register('codigo', { required: true })} type="text" className="border p-2 rounded w-full" />
      </div>
      <div>
        <label className="block font-medium mb-1">Nombre</label>
        <input {...register('nombre', { required: true })} type="text" className="border p-2 rounded w-full" />
      </div>
      <div>
        <label className="block font-medium mb-1">Tipo</label>
        <select {...register('tipo', { required: true })} className="border p-2 rounded w-full">
          <option value="activo">Activo</option>
          <option value="pasivo">Pasivo</option>
          <option value="patrimonio">Patrimonio</option>
          <option value="ingreso">Ingreso</option>
          <option value="gasto">Gasto</option>
          <option value="orden">Orden</option>
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Nivel</label>
        <input {...register('nivel', { required: true })} type="number" min="1" max="10" className="border p-2 rounded w-full" />
      </div>
      <div>
        <label className="block font-medium mb-1">Padre Código</label>
        <input {...register('padre_codigo')} type="text" className="border p-2 rounded w-full" />
      </div>
      <div>
        <label className="block font-medium mb-1">Descripción</label>
        <textarea {...register('descripcion')} className="border p-2 rounded w-full" />
      </div>
      <div>
        <label className="block font-medium mb-1">Estado</label>
        <select {...register('estado', { required: true })} className="border p-2 rounded w-full">
          <option value="1">Activo</option>
          <option value="0">Inactivo</option>
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">¿Es Débito?</label>
        <select {...register('es_debito', { required: true })} className="border p-2 rounded w-full">
          <option value="1">Sí</option>
          <option value="0">No</option>
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Registra tercero</label>
        <select {...register('registra_tercero', { required: true })} className="border p-2 rounded w-full">
          <option value="0">No registra tercero</option>
          <option value="1">Registra tercero</option>
        </select>
      </div>
      <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded w-full font-semibold hover:bg-blue-700 transition" disabled={isSubmitting}>
        {isSubmitting ? 'Creando...' : 'Crear cuenta'}
      </button>
    </form>
  );
}
