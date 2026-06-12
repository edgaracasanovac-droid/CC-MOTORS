const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const usuarioModel = require('../models/usuarioModel');

const login = async (correo, contrasena) => {
  const usuario = await usuarioModel.obtenerUsuarioPorCorreo(correo);

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  const passwordCorrecta = await bcrypt.compare(
    contrasena,
    usuario.contrasena
  );

  if (!passwordCorrecta) {
    throw new Error('Contraseña incorrecta');
  }

  const token = jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      correo: usuario.correo,
    },
    process.env.JWT_SECRET || 'secret_key',
    {
      expiresIn: '2h',
    }
  );

  return {
    mensaje: 'Login exitoso',
    token,
    usuario: {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
    },
  };
};

const recuperarContrasena = async (correo) => {
  const mensajeGenerico = {
    mensaje:
      'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
  };

  const usuario = await usuarioModel.obtenerUsuarioPorCorreo(correo);

  if (!usuario) {
    return mensajeGenerico;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const resetTokenExpira = new Date(Date.now() + 15 * 60 * 1000);

  await usuarioModel.guardarResetToken(
    correo,
    token,
    resetTokenExpira
  );

  const frontendUrl =
    process.env.FRONTEND_URL || 'http://localhost:4322';

  const enlace = `${frontendUrl}/restablecer-contrasena?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER || process.env.SMTP_USER,
      pass: process.env.EMAIL_PASS || process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"CC Motors" <${process.env.EMAIL_USER || process.env.SMTP_USER}>`,
    to: correo,
    subject: 'Restablecer contraseña - CC Motors',
    text: `
Hola,

Recibimos una solicitud para restablecer la contraseña de tu cuenta en CC Motors.

Haz clic en el siguiente enlace para crear una nueva contraseña:

${enlace}

Este enlace expirará en 15 minutos.

Si no solicitaste este cambio, puedes ignorar este mensaje.
    `,
  });

  return mensajeGenerico;
};

const obtenerPerfil = async (idUsuario) => {
  const perfil = await usuarioModel.obtenerPerfilPorId(idUsuario);

  if (!perfil) {
    throw new Error('Usuario no encontrado');
  }

  return perfil;
};

const actualizarPerfil = async (idUsuario, datos) => {
  const perfil = await usuarioModel.actualizarPerfilPorId(idUsuario, datos);

  if (!perfil) {
    throw new Error('Usuario no encontrado');
  }

  return perfil;
};

const register = async (datos) => {
  const usuarioExistente = await usuarioModel.obtenerUsuarioPorCorreo(
    datos.correo
  );

  if (usuarioExistente) {
    throw new Error('El correo ya está registrado');
  }

  const contrasenaEncriptada = await bcrypt.hash(datos.contrasena, 10);

  const nuevoUsuario = await usuarioModel.crearUsuario({
    nombre: datos.nombre,
    apellido: datos.apellido,
    correo: datos.correo,
    contrasena: contrasenaEncriptada,
    id_rol: 2,
  });

  return nuevoUsuario;
};

const restablecerContrasena = async (token, nuevaContrasena) => {
  const usuario = await usuarioModel.obtenerUsuarioPorResetToken(token);

  if (!usuario) {
    throw new Error('Token inválido o vencido');
  }

  const nuevaContrasenaEncriptada = await bcrypt.hash(nuevaContrasena, 10);

  await usuarioModel.actualizarContrasenaPorId(
    usuario.id_usuario,
    nuevaContrasenaEncriptada
  );

  return {
    mensaje: 'Contraseña restablecida correctamente',
  };
};

module.exports = {
  login,
  recuperarContrasena,
  obtenerPerfil,
  actualizarPerfil,
  register,
  restablecerContrasena,
};