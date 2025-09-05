// Controlador para el módulo de terceros usando Drizzle ORM y MySQL (ES Modules)
import * as tercerosModel from './models/terceros.js';

export async function getTerceros(req, res) {
  try {
    // Obtener filtros desde query params
    const tipo = req.query.tipo || undefined;
    const busqueda = req.query.busqueda || undefined;
    const limite = req.query.limite ? parseInt(req.query.limite) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;

  // Usar storage principal para obtener terceros con mapeo y total
  const { storage } = await import('./storage.js');
  const resultado = await storage.getTerceros({ tipo, busqueda, limite, offset });
  res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener terceros', detalle: error.message });
  }
}

export async function createTercero(req, res) {
  try {
    const nuevo = await tercerosModel.createTercero(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear tercero', detalle: error.message });
  }
}

export async function updateTercero(req, res) {
  try {
    const id = parseInt(req.params.id);
    const actualizado = await tercerosModel.updateTercero(id, req.body);
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar tercero', detalle: error.message });
  }
}

export async function deleteTercero(req, res) {
  try {
    const id = parseInt(req.params.id);
    await tercerosModel.deleteTercero(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar tercero', detalle: error.message });
  }
}
