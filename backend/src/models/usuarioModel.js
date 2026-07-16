const pool = require('../config/db');

const obtenerUsuarios = async () => {
  const result = await pool.query(`
    SELECT 
      u.id_usuario,
      u.nombre,
      u.apellido,
      u.correo,
      u.estado,
      u.id_rol,
      r.nombre AS rol
    FROM usuario u
    INNER JOIN rol r
      ON u.id_rol = r.id_rol
    ORDER BY u.id_usuario ASC
  `);

  return result.rows;
};

const obtenerUsuarioPorId = async (id) => {
  const result = await pool.query(
    `
    SELECT 
      u.id_usuario,
      u.nombre,
      u.apellido,
      u.correo,
      u.estado,
      u.id_rol,
      r.nombre AS rol
    FROM usuario u
    INNER JOIN rol r
      ON u.id_rol = r.id_rol
    WHERE u.id_usuario = $1
    `,
    [id]
  );

  return result.rows[0];
};

const obtenerUsuarioPorCorreo = async (correo) => {
  const result = await pool.query(
    `
    SELECT *
    FROM usuario
    WHERE correo = $1
    `,
    [correo]
  );

  return result.rows[0];
};

const crearUsuario = async (usuario) => {
  const {
    nombre,
    apellido,
    correo,
    contrasena,
    id_rol
  } = usuario;

 
  const result = await pool.query(
    `
    INSERT INTO usuario
    (nombre, apellido, correo, contrasena, id_rol)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id_usuario, nombre, apellido, correo, estado, id_rol
    `,
    [nombre, apellido, correo, contrasena, id_rol]
  );

  return result.rows[0];
};

const actualizarUsuario = async (id, usuario) => {
  const camposPermitidos = ['nombre', 'apellido', 'correo', 'contrasena', 'estado', 'id_rol'];
  const entries = Object.entries(usuario || {}).filter(([key]) => camposPermitidos.includes(key));

  if (entries.length === 0) {
    return null;
  }

  const sets = [];
  const values = [];

  entries.forEach(([key, value], index) => {
    sets.push(`${key} = $${index + 1}`);
    values.push(value);
  });

  values.push(id);
  const result = await pool.query(
    `
    UPDATE usuario
    SET ${sets.join(', ')}
    WHERE id_usuario = $${values.length}
    RETURNING id_usuario, nombre, apellido, correo, estado, id_rol
    `,
    values
  );

  return result.rows[0];
};

const eliminarUsuario = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM usuario
    WHERE id_usuario = $1
    RETURNING id_usuario, nombre, correo, estado, id_rol
    `,
    [id]
  );

  return result.rows[0];
};

const actualizarContrasenaPorCorreo = async (correo, nuevaContrasena) => {
  const result = await pool.query(
    `
    UPDATE usuario
    SET contrasena = $1
    WHERE correo = $2
    RETURNING id_usuario, nombre, correo, estado
    `,
    [nuevaContrasena, correo]
  );

  return result.rows[0];
};

const obtenerPerfilPorId = async (id) => {
  const result = await pool.query(
    `
    SELECT 
      u.id_usuario AS id,
      u.correo AS email,
      u.nombre,
      u.apellido,
      r.nombre AS rol
    FROM usuario u
    INNER JOIN rol r ON u.id_rol = r.id_rol
    WHERE u.id_usuario = $1
    `,
    [id]
  );

  return result.rows[0];
};

const actualizarPerfilPorId = async (id, datos) => {
  const { nombre, apellido, correo } = datos;

  const result = await pool.query(
    `
    UPDATE usuario
    SET nombre = $1,
        apellido = $2,
        correo = $3
    WHERE id_usuario = $4
    RETURNING id_usuario AS id, correo AS email, nombre, apellido
    `,
    [nombre, apellido, correo, id]
  );

  return result.rows[0];
};

const guardarResetToken = async (correo, resetToken, resetTokenExpira) => {
  const result = await pool.query(
    `
    UPDATE usuario
    SET reset_token = $1,
        reset_token_expira = $2
    WHERE correo = $3
    RETURNING id_usuario, nombre, apellido, correo
    `,
    [resetToken, resetTokenExpira, correo]
  );

  return result.rows[0];
};

const obtenerUsuarioPorResetToken = async (resetToken) => {
  const result = await pool.query(
    `
    SELECT *
    FROM usuario
    WHERE reset_token = $1
    `,
    [resetToken]
  );

  const usuario = result.rows[0];

  if (!usuario) {
    return null;
  }

  const ahora = new Date();
  const expira = new Date(usuario.reset_token_expira);

  if (expira < ahora) {
    return null;
  }

  return usuario;
};

const actualizarContrasenaPorId = async (idUsuario, nuevaContrasena) => {
  const result = await pool.query(
    `
    UPDATE usuario
    SET contrasena = $1,
        reset_token = NULL,
        reset_token_expira = NULL
    WHERE id_usuario = $2
    RETURNING id_usuario, nombre, apellido, correo
    `,
    [nuevaContrasena, idUsuario]
  );

  return result.rows[0];
};


module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  obtenerUsuarioPorCorreo,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  actualizarContrasenaPorCorreo,
  guardarResetToken,
  obtenerUsuarioPorResetToken,
  actualizarContrasenaPorId,
  obtenerPerfilPorId,
  actualizarPerfilPorId
};
