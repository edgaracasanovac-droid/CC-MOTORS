const { z } = require('zod');

const cotizacionSchema = z.object({
  fecha: z.string(),
  precio_estimado: z.number(),
  vigencia: z.string(),
  id_vehiculo: z.number(),
  id_cliente: z.number()
});

module.exports = {
  cotizacionSchema
};