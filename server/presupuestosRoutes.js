import express from "express";
import { db } from "./db.ts";
import { presupuestos } from "../shared/schema.ts";
import { eq } from "drizzle-orm";

const router = express.Router();

// Obtener presupuesto por ID
router.get('/:id', async (req, res) => {
  try {
    const [presupuesto] = await db.select().from(presupuestos).where(eq(presupuestos.id, Number(req.params.id)));
    res.json(presupuesto);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener presupuesto", detalles: err.message });
  }
});

// Otros endpoints CRUD pueden agregarse aquí

export default router;
