const pool = require('../config/db');

const crearProveedor = async (proveedor) => {
  const {
    nombre,
    identificacion_fiscal,
    telefono,
    telefono_alternativo,
    correo,
    correo_alternativo,
    direccion,
    condiciones_pago,
    estado
  } = proveedor;

  const result = await pool.query(
    `
    INSERT INTO proveedor
    (nombre, identificacion_fiscal, telefono, telefono_alternativo, correo, correo_alternativo, direccion, condiciones_pago, estado)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
    `,
    [
      nombre,
      identificacion_fiscal || null,
      telefono,
      telefono_alternativo || null,
      correo,
      correo_alternativo || null,
      direccion,
      condiciones_pago || null,
      estado || 'activo'
    ]
  );

  return result.rows[0];
};

const obtenerProveedores = async () => {
  const result = await pool.query(`
    SELECT * FROM proveedor
    ORDER BY id_proveedor ASC
  `);
  return result.rows;
};

const obtenerProveedorPorId = async (id) => {
  const result = await pool.query(
    `SELECT * FROM proveedor WHERE id_proveedor = $1`,
    [id]
  );
  return result.rows[0];
};

const actualizarProveedor = async (id, proveedor) => {
  const {
    nombre,
    identificacion_fiscal,
    telefono,
    telefono_alternativo,
    correo,
    correo_alternativo,
    direccion,
    condiciones_pago,
    estado
  } = proveedor;

  const result = await pool.query(
    `
    UPDATE proveedor
    SET nombre=$1, identificacion_fiscal=$2, telefono=$3, telefono_alternativo=$4, correo=$5, correo_alternativo=$6, direccion=$7, condiciones_pago=$8, estado=$9
    WHERE id_proveedor=$10
    RETURNING *
    `,
    [
      nombre,
      identificacion_fiscal || null,
      telefono,
      telefono_alternativo || null,
      correo,
      correo_alternativo || null,
      direccion,
      condiciones_pago || null,
      estado || 'activo',
      id
    ]
  );

  return result.rows[0];
};

const eliminarProveedor = async (id) => {
  const result = await pool.query(
    `DELETE FROM proveedor WHERE id_proveedor=$1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  crearProveedor,
  obtenerProveedores,
  obtenerProveedorPorId,
  actualizarProveedor,
  eliminarProveedor
};