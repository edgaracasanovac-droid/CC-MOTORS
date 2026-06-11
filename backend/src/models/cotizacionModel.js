const pool = require('../config/db');

const crearCotizacion = async (cotizacion) => {
  const {
    fecha,
    precio_estimado,
    vigencia,
    id_vehiculo,
    id_cliente
  } = cotizacion;

  const result = await pool.query(
    `
    INSERT INTO cotizacion
    (fecha, precio_estimado, vigencia, id_vehiculo, id_cliente)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [fecha, precio_estimado, vigencia, id_vehiculo, id_cliente]
  );

  return result.rows[0];
};

const crearCotizacionPublica = async (datos) => {
  const {
    nombre,
    apellido,
    documento,
    telefono,
    correo,
    direccion,
    id_vehiculo,
    mensaje
  } = datos;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Buscar cliente existente
    const clienteResult = await client.query(
      `
      SELECT *
      FROM cliente
      WHERE documento = $1
      `,
      [documento]
    );

    let cliente = clienteResult.rows[0];

    // Crear cliente si no existe
    if (!cliente) {
      const nuevoCliente = await client.query(
        `
        INSERT INTO cliente
        (nombre, apellido, documento, telefono, correo, direccion)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [
          nombre,
          apellido,
          documento,
          telefono,
          correo,
          direccion
        ]
      );

      cliente = nuevoCliente.rows[0];
    }

    // Buscar vehículo
    const vehiculoResult = await client.query(
      `
      SELECT id_vehiculo, precio_venta
      FROM vehiculo
      WHERE id_vehiculo = $1
      `,
      [id_vehiculo]
    );

    const vehiculo = vehiculoResult.rows[0];

    if (!vehiculo) {
      throw new Error('Vehículo no encontrado');
    }

    // Crear cotización
    const cotizacionResult = await client.query(
      `
      INSERT INTO cotizacion
      (
        fecha,
        precio_estimado,
        vigencia,
        estado,
        id_vehiculo,
        id_cliente,
        mensaje
      )
      VALUES
      (
        CURRENT_DATE,
        $1,
        CURRENT_DATE + INTERVAL '7 days',
        'pendiente',
        $2,
        $3,
        $4
      )
      RETURNING *
      `,
      [
        vehiculo.precio_venta,
        id_vehiculo,
        cliente.id_cliente,
        mensaje || null
      ]
    );

    await client.query('COMMIT');

    return {
      cliente,
      cotizacion: cotizacionResult.rows[0]
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;

  } finally {
    client.release();
  }
};

const obtenerCotizaciones = async () => {
  const result = await pool.query(`
    SELECT 
      co.id_cotizacion,
      co.fecha,
      co.precio_estimado,
      co.vigencia,
      co.estado,
      c.nombre AS cliente_nombre,
      c.apellido AS cliente_apellido,
      v.placa,
      ma.nombre AS marca,
      mo.nombre AS modelo
    FROM cotizacion co
    INNER JOIN cliente c ON co.id_cliente = c.id_cliente
    INNER JOIN vehiculo v ON co.id_vehiculo = v.id_vehiculo
    INNER JOIN marca ma ON v.id_marca = ma.id_marca
    INNER JOIN modelo mo ON v.id_modelo = mo.id_modelo
    ORDER BY co.id_cotizacion ASC
  `);

  return result.rows;
};

const obtenerCotizacionPorId = async (id) => {
  const result = await pool.query(`
    SELECT 
      co.*,
      c.nombre AS cliente_nombre,
      c.apellido AS cliente_apellido,
      v.placa,
      ma.nombre AS marca,
      mo.nombre AS modelo
    FROM cotizacion co
    INNER JOIN cliente c ON co.id_cliente = c.id_cliente
    INNER JOIN vehiculo v ON co.id_vehiculo = v.id_vehiculo
    INNER JOIN marca ma ON v.id_marca = ma.id_marca
    INNER JOIN modelo mo ON v.id_modelo = mo.id_modelo
    WHERE co.id_cotizacion = $1
  `, [id]);

  return result.rows[0];
};

const actualizarCotizacion = async (id, cotizacion) => {
  const {
    fecha,
    precio_estimado,
    vigencia,
    estado,
    id_vehiculo,
    id_cliente
  } = cotizacion;

  const result = await pool.query(
    `
    UPDATE cotizacion
    SET fecha = $1,
        precio_estimado = $2,
        vigencia = $3,
        estado = $4,
        id_vehiculo = $5,
        id_cliente = $6
    WHERE id_cotizacion = $7
    RETURNING *
    `,
    [
      fecha,
      precio_estimado,
      vigencia,
      estado || 'pendiente',
      id_vehiculo,
      id_cliente,
      id
    ]
  );

  return result.rows[0];
};

const eliminarCotizacion = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM cotizacion
    WHERE id_cotizacion = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
};

const obtenerMisCotizaciones = async (correo) => {
  const result = await pool.query(
    `
    SELECT 
      co.id_cotizacion,
      co.fecha,
      co.estado,
      co.precio_estimado,
      co.vigencia,
      co.mensaje,

      CASE 
        WHEN co.mensaje ILIKE '%Mi Compra%' THEN 'configuracion_compra'
        ELSE 'cotizacion'
      END AS tipo_historial,

      v.id_vehiculo,
      v.placa,
      v.color,
      v.ano,
      v.kilometraje,
      v.estado AS estado_vehiculo,
      v.precio_venta,

      ma.nombre AS marca,
      mo.nombre AS modelo

    FROM cotizacion co
    INNER JOIN cliente c 
      ON co.id_cliente = c.id_cliente
    INNER JOIN vehiculo v 
      ON co.id_vehiculo = v.id_vehiculo
    INNER JOIN marca ma 
      ON v.id_marca = ma.id_marca
    INNER JOIN modelo mo 
      ON v.id_modelo = mo.id_modelo
    WHERE c.correo = $1
    ORDER BY co.id_cotizacion DESC
    `,
    [correo]
  );

  return result.rows.map((item) => ({
    id_cotizacion: item.id_cotizacion,
    fecha: item.fecha,
    estado: item.estado,
    precio_estimado: item.precio_estimado,
    vigencia: item.vigencia,
    mensaje: item.mensaje,
    tipo_historial: item.tipo_historial,
    vehiculo: {
      id_vehiculo: item.id_vehiculo,
      placa: item.placa,
      marca: item.marca,
      modelo: item.modelo,
      ano: item.ano,
      color: item.color,
      kilometraje: item.kilometraje,
      estado: item.estado_vehiculo,
      precio_venta: item.precio_venta
    }
  }));
};

module.exports = {
  crearCotizacion,
  crearCotizacionPublica,
  obtenerCotizaciones,
  obtenerCotizacionPorId,
  actualizarCotizacion,
  eliminarCotizacion,
  obtenerMisCotizaciones
};