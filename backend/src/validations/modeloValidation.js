const { z } = require('zod');

const modeloSchema = z.object({
  nombre: z.string().min(2),
  id_marca: z.number(),
  descripcion: z.string().optional(),
  ano_lanzamiento: z.number().optional(),
  ano_descontinuacion: z.number().optional(),
  tipo_combustible: z.enum(['gasolina', 'diesel', 'electrico', 'hibrido', 'gas']).optional(),
  cilindrada: z.number().optional(),
  transmision: z.enum(['manual', 'automatico', 'cvt']).optional(),
  numero_puertas: z.number().optional(),
  capacidad_pasajeros: z.number().optional(),
  tipo_carroceria: z.enum(['sedan', 'hatchback', 'suv', 'pickup', 'coupe', 'convertible']).optional(),
  estado: z.enum(['activo', 'inactivo']).optional()
});

module.exports = {
  modeloSchema
};