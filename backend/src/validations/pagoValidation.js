const { z } = require('zod');

const pagoSchema = z.object({
  fecha: z.string(),
  monto: z.number(),
  metodo_pago: z.string(),
  referencia: z.string().optional(),
  id_usuario: z.number(),
  id_venta_vehiculo: z.number().nullable().optional(),
  id_cuota: z.number().nullable().optional()
});

module.exports = {
  pagoSchema
};