const pool = require('../config/db');

const obtenerVehiculos = async () => {
  const result = await pool.query(`
    SELECT 
      v.id_vehiculo,
      v.placa,
      v.color,
      v.ano,
      v.kilometraje,
      v.estado,
      v.precio_compra,
      v.precio_venta,
      v.id_marca,
      v.id_modelo,
      v.id_proveedor,
      ma.nombre AS nombre_marca,
      mo.nombre AS nombre_modelo,
      p.nombre AS nombre_proveedor
    FROM vehiculo v
    INNER JOIN marca ma ON v.id_marca = ma.id_marca
    INNER JOIN modelo mo ON v.id_modelo = mo.id_modelo
    LEFT JOIN proveedor p ON v.id_proveedor = p.id_proveedor
    ORDER BY v.id_vehiculo ASC
  `);

  return result.rows;
};

const obtenerVehiculoPorId = async (id) => {
  const result = await pool.query(
    `
    SELECT 
      v.id_vehiculo,
      v.placa,
      v.color,
      v.ano,
      v.kilometraje,
      v.estado,
      v.precio_compra,
      v.precio_venta,
      v.id_marca,
      v.id_modelo,
      v.id_proveedor,
      ma.nombre AS nombre_marca,
      mo.nombre AS nombre_modelo,
      p.nombre AS nombre_proveedor
    FROM vehiculo v
    INNER JOIN marca ma ON v.id_marca = ma.id_marca
    INNER JOIN modelo mo ON v.id_modelo = mo.id_modelo
    LEFT JOIN proveedor p ON v.id_proveedor = p.id_proveedor
    WHERE v.id_vehiculo = $1
    `,
    [id]
  );

  return result.rows[0];
};

const crearVehiculo = async (vehiculo) => {
  const {
    placa,
    color,
    ano,
    kilometraje,
    estado,
    precio_compra,
    precio_venta,
    id_marca,
    id_modelo,
    id_proveedor
  } = vehiculo;

  const result = await pool.query(
    `
    INSERT INTO vehiculo
    (placa, color, ano, kilometraje, estado, precio_compra, precio_venta, id_marca, id_modelo, id_proveedor)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
    `,
    [
      placa,
      color,
      ano,
      kilometraje,
      estado,
      precio_compra,
      precio_venta,
      id_marca,
      id_modelo,
      id_proveedor || null
    ]
  );

  return result.rows[0];
};

const actualizarVehiculo = async (id, vehiculo) => {
  const {
    placa,
    color,
    ano,
    kilometraje,
    estado,
    precio_compra,
    precio_venta,
    id_marca,
    id_modelo,
    id_proveedor
  } = vehiculo;

  const result = await pool.query(
    `
    UPDATE vehiculo
    SET placa = $1,
        color = $2,
        ano = $3,
        kilometraje = $4,
        estado = $5,
        precio_compra = $6,
        precio_venta = $7,
        id_marca = $8,
        id_modelo = $9,
        id_proveedor = $10
    WHERE id_vehiculo = $11
    RETURNING *
    `,
    [
      placa,
      color,
      ano,
      kilometraje,
      estado,
      precio_compra,
      precio_venta,
      id_marca,
      id_modelo,
      id_proveedor || null,
      id
    ]
  );

  return result.rows[0];
};

const eliminarVehiculo = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM vehiculo
    WHERE id_vehiculo = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  obtenerVehiculos,
  obtenerVehiculoPorId,
  crearVehiculo,
  actualizarVehiculo,
  eliminarVehiculo
};