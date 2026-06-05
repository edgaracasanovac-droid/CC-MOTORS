const pool = require('../config/db');

const crearPago = async (pago) => {

  const client = await pool.connect();

  try {

    await client.query('BEGIN');

    const {
    fecha,
    monto,
    metodo_pago,
    referencia,
    id_usuario,
    id_venta_vehiculo,
    id_cuota
    } = pago;

const pagoResult = await client.query(
  `
  INSERT INTO pago
  (fecha, monto, metodo_pago, referencia, id_usuario, id_venta_vehiculo, id_cuota)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING *
  `,
  [
    fecha,
    monto,
    metodo_pago,
    referencia || null,
    id_usuario,
    id_venta_vehiculo || null,
    id_cuota || null
  ]
);

    if (id_cuota) {

      const cuotaResult = await client.query(
        `
        SELECT *
        FROM cuota
        WHERE id_cuota = $1
        `,
        [id_cuota]
      );

      if (cuotaResult.rows.length === 0) {
        throw new Error('La cuota no existe');
      }

      if (cuotaResult.rows[0].estado === 'pagado') {
        throw new Error('La cuota ya está pagada');
      }

      await client.query(
        `
        UPDATE cuota
        SET estado = 'pagado'
        WHERE id_cuota = $1
        `,
        [id_cuota]
      );

      const ventaId = cuotaResult.rows[0].id_venta_vehiculo;

      const cuotasPendientes = await client.query(
        `
        SELECT COUNT(*) 
        FROM cuota
        WHERE id_venta_vehiculo = $1
        AND estado = 'pendiente'
        `,
        [ventaId]
      );

      if (parseInt(cuotasPendientes.rows[0].count) === 0) {

        await client.query(
          `
          UPDATE venta_vehiculo
          SET estado = 'pagado'
          WHERE id_venta_vehiculo = $1
          `,
          [ventaId]
        );

      }

    }

    await client.query('COMMIT');

    return pagoResult.rows[0];

  } catch (error) {

    await client.query('ROLLBACK');
    throw error;

  } finally {

    client.release();

  }

};

const obtenerPagos = async () => {
  const result = await pool.query(`
    SELECT 
      p.id_pago,
      p.fecha,
      p.monto,
      p.metodo_pago,
      p.estado,
      p.id_usuario,
      p.id_venta_vehiculo,
      p.id_cuota,

      COALESCE(p.referencia, 'Sin referencia') AS referencia,

      CONCAT(c.nombre, ' ', c.apellido) AS cliente,
      vv.id_venta_vehiculo AS venta,
      vv.precio_final AS precio_venta,
      vv.tipo_venta,

      ve.placa AS vehiculo,
      ma.nombre AS marca,
      mo.nombre AS modelo

    FROM pago p
    LEFT JOIN venta_vehiculo vv
      ON p.id_venta_vehiculo = vv.id_venta_vehiculo
    LEFT JOIN cliente c
      ON vv.id_cliente = c.id_cliente
    LEFT JOIN vehiculo ve
      ON vv.id_vehiculo = ve.id_vehiculo
    LEFT JOIN marca ma
      ON ve.id_marca = ma.id_marca
    LEFT JOIN modelo mo
      ON ve.id_modelo = mo.id_modelo
    ORDER BY p.id_pago DESC
  `);

  return result.rows;
};

const obtenerPagoPorId = async (id) => {
  const result = await pool.query(
    `
    SELECT 
      p.id_pago,
      p.fecha,
      p.monto,
      p.metodo_pago,
      p.referencia,
      p.estado,
      p.id_usuario,
      p.id_venta_vehiculo,
      p.id_cuota,
      CONCAT(c.nombre, ' ', c.apellido) AS cliente,
      vv.id_venta_vehiculo AS venta
    FROM pago p
    LEFT JOIN venta_vehiculo vv ON p.id_venta_vehiculo = vv.id_venta_vehiculo
    LEFT JOIN cliente c ON vv.id_cliente = c.id_cliente
    WHERE p.id_pago = $1
    `,
    [id]
  );

  return result.rows[0];
};

const actualizarPago = async (id, pago) => {
  const {
    fecha,
    monto,
    metodo_pago,
    referencia,
    estado,
    id_usuario,
    id_venta_vehiculo,
    id_cuota
  } = pago;

  const result = await pool.query(
    `
    UPDATE pago
    SET fecha = $1,
        monto = $2,
        metodo_pago = $3,
        referencia = $4,
        estado = $5,
        id_usuario = $6,
        id_venta_vehiculo = $7,
        id_cuota = $8
    WHERE id_pago = $9
    RETURNING *
    `,
    [
      fecha,
      monto,
      metodo_pago,
      referencia || null,
      estado,
      id_usuario,
      id_venta_vehiculo || null,
      id_cuota || null,
      id
    ]
  );

  return result.rows[0];
};

const eliminarPago = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM pago
    WHERE id_pago = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  crearPago,
  obtenerPagos,
  obtenerPagoPorId,
  actualizarPago,
  eliminarPago
};