const { z } = require('zod');

const vehiculoSchema = z.object({
  placa: z.string().min(3),
  color: z.string().min(2),
  ano: z.number(),
  kilometraje: z.number(),
  estado: z.enum(['disponible', 'vendido', 'mantenimiento']),
  precio_compra: z.number(),
  precio_venta: z.number(),
  id_marca: z.number(),
  id_modelo: z.number(),
  id_proveedor: z.number().nullable().optional()
});

module.exports = {
  vehiculoSchema
};