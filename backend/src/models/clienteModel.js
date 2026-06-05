const pool = require('../config/db');

const obtenerClientes = async () => {
  const result = await pool.query(`
    SELECT *
    FROM cliente
    ORDER BY id_cliente ASC
  `);

  return result.rows;
};

const obtenerClientePorId = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM cliente
    WHERE id_cliente = $1
    `,
    [id]
  );

  return result.rows[0];
};

const crearCliente = async (cliente) => {

  const {
    nombre,
    apellido,
    documento,
    telefono,
    correo,
    direccion
  } = cliente;

  const result = await pool.query(
    `
    INSERT INTO cliente
    (nombre, apellido, documento, telefono, correo, direccion)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [nombre, apellido, documento, telefono, correo, direccion]
  );

  return result.rows[0];
};

const actualizarCliente = async (id, cliente) => {

  const {
    nombre,
    apellido,
    documento,
    telefono,
    correo,
    direccion
  } = cliente;

  const result = await pool.query(
    `
    UPDATE cliente
    SET nombre = $1,
        apellido = $2,
        documento = $3,
        telefono = $4,
        correo = $5,
        direccion = $6
    WHERE id_cliente = $7
    RETURNING *
    `,
    [nombre, apellido, documento, telefono, correo, direccion, id]
  );

  return result.rows[0];
};

const eliminarCliente = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM cliente
    WHERE id_cliente = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente
};