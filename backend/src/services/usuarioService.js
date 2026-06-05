const bcrypt = require('bcrypt');
const usuarioModel = require('../models/usuarioModel');

const listarUsuarios = async () => {
  return await usuarioModel.obtenerUsuarios();
};

const buscarUsuarioPorId = async (id) => {
  return await usuarioModel.obtenerUsuarioPorId(id);
};

const registrarUsuario = async (usuario) => {
  const passwordHash = await bcrypt.hash(
    usuario.contrasena,
    10
  );

  usuario.contrasena = passwordHash;

  return await usuarioModel.crearUsuario(usuario);
};

const editarUsuario = async (id, usuario) => {
  const passwordHash = await bcrypt.hash(
    usuario.contrasena,
    10
  );

  usuario.contrasena = passwordHash;

  return await usuarioModel.actualizarUsuario(id, usuario);
};

const borrarUsuario = async (id) => {
  return await usuarioModel.eliminarUsuario(id);
};

module.exports = {
  listarUsuarios,
  buscarUsuarioPorId,
  registrarUsuario,
  editarUsuario,
  borrarUsuario
};