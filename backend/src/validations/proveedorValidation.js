const { z } = require('zod');

const proveedorSchema = z.object({
  nombre: z.string().min(2),
  identificacion_fiscal: z.string().optional(),
  telefono: z.string(),
  telefono_alternativo: z.string().optional(),
  correo: z.string().email(),
  correo_alternativo: z.string().optional(),
  direccion: z.string(),
  condiciones_pago: z.string().optional(),
  estado: z.enum(['activo', 'inactivo']).optional()
});

module.exports = {
  proveedorSchema
};