const pool = require('../config/db');

const buscarClientePorCorreo = async (correo) => {
  const result = await pool.query(
    `
    SELECT *
    FROM cliente
    WHERE correo = $1
    `,
    [correo]
  );

  return result.rows[0];
};

const buscarVehiculoPorId = async (idVehiculo) => {
  const result = await pool.query(
    `
    SELECT *
    FROM vehiculo
    WHERE id_vehiculo = $1
    `,
    [idVehiculo]
  );

  return result.rows[0];
};

const crearSolicitudTestDrive = async ({ id_cliente, id_vehiculo, fecha, hora, mensaje }) => {
  const result = await pool.query(
    `
    INSERT INTO test_drive
    (id_cliente, id_vehiculo, fecha, hora, mensaje, estado)
    VALUES ($1, $2, $3, $4, $5, 'pendiente')
    RETURNING *
    `,
    [id_cliente, id_vehiculo, fecha, hora, mensaje || null]
  );

  return result.rows[0];
};

const obtenerMisTestDrives = async (correo) => {
  const result = await pool.query(
    `
    SELECT 
      td.id_test_drive,
      td.fecha,
      td.hora,
      td.estado,
      td.mensaje,
      td.creado_en,

      v.id_vehiculo,
      v.placa,
      v.ano,
      v.color,
      v.precio_venta,

      ma.nombre AS marca,
      mo.nombre AS modelo

    FROM test_drive td
    INNER JOIN cliente c ON td.id_cliente = c.id_cliente
    INNER JOIN vehiculo v ON td.id_vehiculo = v.id_vehiculo
    INNER JOIN marca ma ON v.id_marca = ma.id_marca
    INNER JOIN modelo mo ON v.id_modelo = mo.id_modelo
    WHERE c.correo = $1
    ORDER BY td.id_test_drive DESC
    `,
    [correo]
  );

  return result.rows.map((item) => ({
    id_test_drive: item.id_test_drive,
    fecha: item.fecha,
    hora: item.hora,
    estado: item.estado,
    mensaje: item.mensaje,
    creado_en: item.creado_en,
    vehiculo: {
      id_vehiculo: item.id_vehiculo,
      placa: item.placa,
      marca: item.marca,
      modelo: item.modelo,
      ano: item.ano,
      color: item.color,
      precio_venta: item.precio_venta
    }
  }));
};

module.exports = {
  buscarClientePorCorreo,
  buscarVehiculoPorId,
  crearSolicitudTestDrive,
  obtenerMisTestDrives
};