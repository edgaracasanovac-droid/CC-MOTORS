const { z } = require('zod');

const loginSchema = z.object({
  correo: z.string().email(),
  contrasena: z.string().min(6)
});

const recoverPasswordSchema = z.object({
  correo: z.string().email().optional(),
  email: z.string().email().optional()
}).refine((data) => data.correo || data.email, {
  message: 'Se requiere correo o email'
});

const profileUpdateSchema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  correo: z.string().email()
});

module.exports = {
  loginSchema,
  recoverPasswordSchema,
  profileUpdateSchema
};