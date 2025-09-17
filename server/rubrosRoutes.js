import express from "express";
import { db } from "./db.ts";
import { rubros } from "../shared/schema.ts";
import { eq } from "drizzle-orm";

const router = express.Router();

// Obtener rubros por presupuesto_id
router.get('/presupuesto/:presupuesto_id', async (req, res) => {
  try {
    const rubrosList = await db.select().from(rubros).where(eq(rubros.presupuesto_id, Number(req.params.presupuesto_id)));
    res.json(rubrosList);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener rubros", detalles: err.message });
  }
});

// Actualizar rubro
router.post('/:id', async (req, res) => {
  const { presupuestado, ejecutado } = req.body;
  try {
    await db.update(rubros)
      .set({ presupuestado, ejecutado })
      .where(eq(rubros.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar rubro", detalles: err.message });
  }
});

export default router;
