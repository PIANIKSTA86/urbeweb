// Controlador para periodos contables
const db = require('./db');
const { periodos } = require('./models/periodos');

module.exports = {
  async getAll(req, res) {
    try {
      const result = await db.select().from(periodos);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener periodos' });
    }
  },
  async create(req, res) {
    try {
      const { anio, mes, estado, fecha_apertura, fecha_cierre } = req.body;
      const [inserted] = await db.insert(periodos).values({ anio, mes, estado, fecha_apertura, fecha_cierre });
      res.json(inserted);
    } catch (err) {
      res.status(500).json({ error: 'Error al crear periodo' });
    }
  },
  async update(req, res) {
    try {
      const { id } = req.params;
      const { anio, mes, estado, fecha_apertura, fecha_cierre } = req.body;
      await db.update(periodos).set({ anio, mes, estado, fecha_apertura, fecha_cierre }).where(periodos.id.eq(id));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar periodo' });
    }
  },
  async remove(req, res) {
    try {
      const { id } = req.params;
      await db.delete(periodos).where(periodos.id.eq(id));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Error al eliminar periodo' });
    }
  },
};
