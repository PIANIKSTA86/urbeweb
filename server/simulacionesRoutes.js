import express from "express";
import { db } from "./db.ts";
import { simulaciones } from "../shared/schema.ts";

const router = express.Router();

// Crear simulación
router.post('/', async (req, res) => {
  const { presupuesto_id, escenario, variacion } = req.body;
  try {
    await db.insert(simulaciones).values({ presupuesto_id, escenario, variacion });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al crear simulación", detalles: err.message });
  }
});

export default router;
