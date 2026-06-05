const { z } = require('zod');

const usuarioSchema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  correo: z.string().email(),
  contrasena: z.string().min(6),
  id_rol: z.number()
});

const usuarioUpdateSchema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  correo: z.string().email(),
  contrasena: z.string().min(6),
  estado: z.enum(['activo', 'inactivo', 'bloqueado']),
  id_rol: z.number()
});

module.exports = {
  usuarioSchema,
  usuarioUpdateSchema
};