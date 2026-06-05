const { z } = require('zod');

const clienteSchema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  documento: z.string().min(5),
  telefono: z.string().min(5),
  correo: z.string().email(),
  direccion: z.string().min(5)
});

module.exports = {
  clienteSchema
};