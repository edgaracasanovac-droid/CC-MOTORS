const { z } = require('zod');

const usuarioSchema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  correo: z.string().email(),
  contrasena: z.string().min(6),
  id_rol: z.number()
});

const usuarioUpdateSchema = z.object({
  nombre: z.string().min(2).optional(),
  apellido: z.string().min(2).optional(),
  correo: z.string().email().optional(),
  contrasena: z.string().min(6).optional(),
  estado: z.enum(['activo', 'inactivo', 'bloqueado']).optional(),
  id_rol: z.number().optional()
});

module.exports = {
  usuarioSchema,
  usuarioUpdateSchema
};