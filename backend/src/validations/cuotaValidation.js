const { z } = require('zod');

const cuotaSchema = z.object({
  numero: z.number(),
  monto: z.number(),
  fecha_vencimiento: z.string(),
  estado: z.enum(['pendiente', 'pagado', 'cancelado']),
  id_venta_vehiculo: z.number(),
  id_plan_financiamiento: z.number()
});

module.exports = {
  cuotaSchema
};