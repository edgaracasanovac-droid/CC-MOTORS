const { z } = require('zod');

const ventaSchema = z.object({
  fecha: z.string(),
  precio_final: z.number(),
  tipo_venta: z.enum(['contado', 'financiado']),
  id_usuario: z.number(),
  id_cliente: z.number(),
  id_vehiculo: z.number(),
  id_plan_financiamiento: z.number().nullable().optional()
});

module.exports = {
  ventaSchema
};