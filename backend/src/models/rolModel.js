const pool = require('../config/db');

const obtenerRoles = async () => {
  const result = await pool.query(`
    SELECT id_rol, nombre
    FROM rol
    ORDER BY id_rol ASC
  `);

  return result.rows;
};

const obtenerRolPorId = async (id) => {
  const result = await pool.query(
    `
    SELECT id_rol, nombre
    FROM rol
    WHERE id_rol = $1
    `,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  obtenerRoles,
  obtenerRolPorId,
};
