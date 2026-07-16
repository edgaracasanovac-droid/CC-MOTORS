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

const obtenerTodasLasSolicitudes = async () => {
  const result = await pool.query(
    `
    SELECT
      td.id_test_drive,
      td.fecha,
      td.hora,
      td.estado,
      td.mensaje,
      td.observaciones,
      td.creado_en,
      c.id_cliente,
      c.nombre AS nombre_cliente,
      c.apellido AS apellido_cliente,
      c.documento,
      c.telefono,
      c.correo,
      c.direccion,
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
    ORDER BY td.id_test_drive DESC
    `
  );

  return result.rows.map((item) => ({
    id_test_drive: item.id_test_drive,
    fecha: item.fecha,
    hora: item.hora,
    estado: item.estado,
    mensaje: item.mensaje,
    observaciones: item.observaciones,
    creado_en: item.creado_en,
    cliente: {
      id_cliente: item.id_cliente,
      nombre: item.nombre_cliente,
      apellido: item.apellido_cliente,
      documento: item.documento,
      telefono: item.telefono,
      correo: item.correo,
      direccion: item.direccion,
    },
    vehiculo: {
      id_vehiculo: item.id_vehiculo,
      placa: item.placa,
      marca: item.marca,
      modelo: item.modelo,
      ano: item.ano,
      color: item.color,
      precio_venta: item.precio_venta,
    },
  }));
};

const obtenerSolicitudPorId = async (id) => {
  const result = await pool.query(
    `
    SELECT
      td.id_test_drive,
      td.fecha,
      td.hora,
      td.estado,
      td.mensaje,
      td.observaciones,
      td.creado_en,
      c.id_cliente,
      c.nombre AS nombre_cliente,
      c.apellido AS apellido_cliente,
      c.documento,
      c.telefono,
      c.correo,
      c.direccion,
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
    WHERE td.id_test_drive = $1
    `,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const item = result.rows[0];
  return {
    id_test_drive: item.id_test_drive,
    fecha: item.fecha,
    hora: item.hora,
    estado: item.estado,
    mensaje: item.mensaje,
    observaciones: item.observaciones,
    creado_en: item.creado_en,
    cliente: {
      id_cliente: item.id_cliente,
      nombre: item.nombre_cliente,
      apellido: item.apellido_cliente,
      documento: item.documento,
      telefono: item.telefono,
      correo: item.correo,
      direccion: item.direccion,
    },
    vehiculo: {
      id_vehiculo: item.id_vehiculo,
      placa: item.placa,
      marca: item.marca,
      modelo: item.modelo,
      ano: item.ano,
      color: item.color,
      precio_venta: item.precio_venta,
    },
  };
};

const actualizarSolicitud = async (id, campos) => {
  const camposPermitidos = ['estado', 'fecha', 'hora', 'observaciones'];
  const entries = Object.entries(campos || {}).filter(([key]) => camposPermitidos.includes(key));

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
    UPDATE test_drive
    SET ${sets.join(', ')}
    WHERE id_test_drive = $${values.length}
    RETURNING *
    `,
    values
  );

  if (result.rows.length === 0) {
    return null;
  }

  return obtenerSolicitudPorId(id);
};

const eliminarSolicitud = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM test_drive
    WHERE id_test_drive = $1
    RETURNING *
    `,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

module.exports = {
  buscarClientePorCorreo,
  buscarVehiculoPorId,
  crearSolicitudTestDrive,
  obtenerMisTestDrives,
  obtenerTodasLasSolicitudes,
  obtenerSolicitudPorId,
  actualizarSolicitud,
  eliminarSolicitud
};