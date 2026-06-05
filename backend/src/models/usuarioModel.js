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
  const {
    nombre,
    apellido,
    correo,
    contrasena,
    estado,
    id_rol
  } = usuario;

  const result = await pool.query(
    `
    UPDATE usuario
    SET nombre = $1,
        apellido = $2,
        correo = $3,
        contrasena = $4,
        estado = $5,
        id_rol = $6
    WHERE id_usuario = $7
    RETURNING id_usuario, nombre, apellido, correo, estado, id_rol
    `,
    [nombre, apellido, correo, contrasena, estado, id_rol, id]
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

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  obtenerUsuarioPorCorreo,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  actualizarContrasenaPorCorreo,
  obtenerPerfilPorId,
  actualizarPerfilPorId
};