const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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
      correo: usuario.correo
    },
    'secret_key',
    {
      expiresIn: '2h'
    }
  );

  return {
    mensaje: 'Login exitoso',
    token,
    usuario: {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      correo: usuario.correo
    }
  };
};

const generarContrasenaTemporal = () => {
  return Math.random().toString(36).slice(-8);
};

const recuperarContrasena = async (correo) => {
  const usuario = await usuarioModel.obtenerUsuarioPorCorreo(correo);

  if (!usuario) {
    return {
      mensaje: 'El correo no se encuentra registrado en el sistema'
    };
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('No se han configurado las credenciales de correo en el servidor');
  }

  const nuevaContrasena = generarContrasenaTemporal();
  const nuevaContrasenaEncriptada = await bcrypt.hash(nuevaContrasena, 10);

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.verify();

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: correo,
      subject: 'Recuperación de contraseña - Concesionaria',
      text: `Hola ${usuario.nombre}, tu nueva contraseña temporal es: ${nuevaContrasena}`
    });
  } catch (error) {
    throw new Error(`No se pudo enviar el correo de recuperación: ${error.message}`);
  }

  await usuarioModel.actualizarContrasenaPorCorreo(
    correo,
    nuevaContrasenaEncriptada
  );

  return {
    mensaje: 'Se envió una nueva contraseña al correo registrado'
  };
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

module.exports = {
  login,
  recuperarContrasena,
  obtenerPerfil,
  actualizarPerfil
};