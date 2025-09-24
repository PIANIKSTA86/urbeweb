import express from "express";
import * as reportesController from "./reportesController.js";

const router = express.Router();

// Balance de prueba
router.get("/balance-prueba", reportesController.getBalancePrueba);
router.post("/balance-prueba", reportesController.getBalancePrueba);

// Estado de resultados
router.get("/estado-resultados", reportesController.getEstadoResultados);

export default router;
