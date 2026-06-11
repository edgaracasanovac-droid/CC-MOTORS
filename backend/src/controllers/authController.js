const authService = require('../services/authService');


const {
  loginSchema,
  recoverPasswordSchema,
  profileUpdateSchema,
  registerSchema,
  resetPasswordSchema
} = require('../validations/authValidation');

const login = async (req, res) => {

  try {

    const validacion = loginSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const { correo, contrasena } = req.body;

    const resultado = await authService.login(
      correo,
      contrasena
    );

    res.json(resultado);

  } catch (error) {
    res.status(401).json({
      mensaje: error.message
    });
  }
};

const perfil = async (req, res) => {

  try {

    res.json({
      mensaje: 'Perfil del usuario',
      usuario: req.usuario
    });

  } catch (error) {

    res.status(500).json({
      mensaje: error.message
    });

  }
};

const recuperarContrasena = async (req, res) => {
  try {
    const validacion = recoverPasswordSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const correo = req.body.correo || req.body.email;

    const resultado = await authService.recuperarContrasena(correo);

    res.json(resultado);

  } catch (error) {
    console.error('Error en recuperarContrasena:', error);
    res.status(500).json({
      mensaje: 'Error al recuperar contraseña',
      error: error.message
    });
  }
};

const profile = async (req, res) => {
  try {
    const perfil = await authService.obtenerPerfil(req.usuario.id_usuario);

    res.json({
      mensaje: 'Perfil obtenido correctamente',
      perfil
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener perfil',
      error: error.message
    });
  }
};

const profileUpdate = async (req, res) => {
  try {
    const validacion = profileUpdateSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const perfil = await authService.actualizarPerfil(
      req.usuario.id_usuario,
      req.body
    );

    res.json({
      mensaje: 'Perfil actualizado correctamente',
      perfil
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar perfil',
      error: error.message
    });
  }
};



const register = async (req, res) => {
  try {
    const validacion = registerSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const usuario = await authService.register(req.body);

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario
    });

  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

const restablecerContrasena = async (req, res) => {
  try {
    const validacion = resetPasswordSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const { token, nueva_contrasena } = req.body;

    const resultado = await authService.restablecerContrasena(
      token,
      nueva_contrasena
    );

    res.json(resultado);

  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};


module.exports = {
  login,
  perfil,
  recuperarContrasena,
  restablecerContrasena,
  profile,
  profileUpdate,
  register
};
