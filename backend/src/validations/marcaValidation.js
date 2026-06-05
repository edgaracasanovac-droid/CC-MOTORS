const { z } = require('zod');

const marcaSchema = z.object({
  nombre: z.string().min(2),
  descripcion: z.string().optional(),
  pais_origen: z.string().optional(),
  sitio_web: z.string().optional(),
  estado: z.enum(['activo', 'inactivo']).optional()
});

module.exports = {
  marcaSchema
};