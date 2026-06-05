const usuarioService = require('../services/usuarioService');
const {
  usuarioSchema,
  usuarioUpdateSchema
} = require('../validations/usuarioValidation');

const getUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioService.listarUsuarios();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

const getUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await usuarioService.buscarUsuarioPorId(id);

    if (!usuario) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    res.json(usuario);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener usuario',
      error: error.message
    });
  }
};

const postUsuario = async (req, res) => {
  try {
    const validacion = usuarioSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const usuario = await usuarioService.registrarUsuario(req.body);

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al registrar usuario',
      error: error.message
    });
  }
};

const putUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const validacion = usuarioUpdateSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const usuario = await usuarioService.editarUsuario(id, req.body);

    if (!usuario) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    res.json({
      mensaje: 'Usuario actualizado correctamente',
      usuario
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await usuarioService.borrarUsuario(id);

    if (!usuario) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    res.json({
      mensaje: 'Usuario eliminado correctamente',
      usuario
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar usuario',
      error: error.message
    });
  }
};

module.exports = {
  getUsuarios,
  getUsuarioPorId,
  postUsuario,
  putUsuario,
  deleteUsuario
};