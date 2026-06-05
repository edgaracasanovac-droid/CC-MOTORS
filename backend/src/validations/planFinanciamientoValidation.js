const { z } = require('zod');

const planSchema = z.object({
  nombre: z.string().min(2),
  tasa_interes: z.number(),
  numero_cuotas: z.number()
});

module.exports = {
  planSchema
};