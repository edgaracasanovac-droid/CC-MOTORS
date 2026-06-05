const pool = require('../config/db');

const crearVenta = async (venta) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      fecha,
      precio_final,
      tipo_venta,
      id_usuario,
      id_cliente,
      id_vehiculo,
      id_plan_financiamiento
    } = venta;

    const vehiculoResult = await client.query(
      `
      SELECT estado
      FROM vehiculo
      WHERE id_vehiculo = $1
      `,
      [id_vehiculo]
    );

    if (vehiculoResult.rows.length === 0) {
      throw new Error('El vehículo no existe');
    }

    if (vehiculoResult.rows[0].estado !== 'disponible') {
      throw new Error('El vehículo no está disponible para la venta');
    }

    if (tipo_venta === 'financiado' && !id_plan_financiamiento) {
      throw new Error('Una venta financiada debe tener un plan de financiamiento');
    }

    const ventaResult = await client.query(
      `
      INSERT INTO venta_vehiculo
      (fecha, precio_final, tipo_venta, id_usuario, id_cliente, id_vehiculo, id_plan_financiamiento)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        fecha,
        precio_final,
        tipo_venta,
        id_usuario,
        id_cliente,
        id_vehiculo,
        id_plan_financiamiento || null
      ]
    );

    const ventaCreada = ventaResult.rows[0];

    await client.query(
      `
      UPDATE vehiculo
      SET estado = 'vendido'
      WHERE id_vehiculo = $1
      `,
      [id_vehiculo]
    );

    let cuotasGeneradas = [];

    if (tipo_venta === 'financiado') {
      const planResult = await client.query(
        `
        SELECT numero_cuotas, tasa_interes
        FROM plan_financiamiento
        WHERE id_plan_financiamiento = $1
        `,
        [id_plan_financiamiento]
      );

      if (planResult.rows.length === 0) {
        throw new Error('El plan de financiamiento no existe');
      }

      const numeroCuotas = planResult.rows[0].numero_cuotas;
      const tasaInteres = Number(planResult.rows[0].tasa_interes);
      const totalConInteres = Number(precio_final) + (Number(precio_final) * tasaInteres / 100);
      const montoCuota = totalConInteres / numeroCuotas;

      for (let i = 1; i <= numeroCuotas; i++) {
        const fechaVencimiento = new Date(fecha);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);

        const cuotaResult = await client.query(
          `
          INSERT INTO cuota
          (numero, monto, fecha_vencimiento, estado, id_venta_vehiculo, id_plan_financiamiento)
          VALUES ($1, $2, $3, 'pendiente', $4, $5)
          RETURNING *
          `,
          [
            i,
            montoCuota,
            fechaVencimiento.toISOString().split('T')[0],
            ventaCreada.id_venta_vehiculo,
            id_plan_financiamiento
          ]
        );

        cuotasGeneradas.push(cuotaResult.rows[0]);
      }
    }

    await client.query('COMMIT');

    return {
      venta: ventaCreada,
      cuotas: cuotasGeneradas
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const obtenerVentas = async () => {
  const result = await pool.query(`
    SELECT 
      vv.id_venta_vehiculo AS id_venta,
      vv.fecha,
      CONCAT(c.nombre, ' ', c.apellido) AS cliente,
      u.nombre AS usuario,
      ve.placa AS vehiculo,
      vv.precio_final,
      vv.tipo_venta,
      vv.estado,

      vv.id_cliente,
      vv.id_usuario,
      vv.id_vehiculo,

      ma.nombre AS nombre_marca,
      mo.nombre AS nombre_modelo

    FROM venta_vehiculo vv
    INNER JOIN cliente c 
      ON vv.id_cliente = c.id_cliente
    INNER JOIN usuario u 
      ON vv.id_usuario = u.id_usuario
    INNER JOIN vehiculo ve 
      ON vv.id_vehiculo = ve.id_vehiculo
    INNER JOIN marca ma
      ON ve.id_marca = ma.id_marca
    INNER JOIN modelo mo
      ON ve.id_modelo = mo.id_modelo
    ORDER BY vv.id_venta_vehiculo DESC
  `);

  return result.rows;
};

const obtenerVentaPorId = async (id) => {
  const result = await pool.query(
    `
    SELECT 
      vv.id_venta_vehiculo AS id_venta,
      vv.fecha,
      CONCAT(c.nombre, ' ', c.apellido) AS cliente,
      u.nombre AS usuario,
      ve.placa AS vehiculo,
      vv.precio_final,
      vv.tipo_venta,
      vv.estado,

      vv.id_cliente,
      vv.id_usuario,
      vv.id_vehiculo,

      ma.nombre AS nombre_marca,
      mo.nombre AS nombre_modelo

    FROM venta_vehiculo vv
    INNER JOIN cliente c 
      ON vv.id_cliente = c.id_cliente
    INNER JOIN usuario u 
      ON vv.id_usuario = u.id_usuario
    INNER JOIN vehiculo ve 
      ON vv.id_vehiculo = ve.id_vehiculo
    INNER JOIN marca ma
      ON ve.id_marca = ma.id_marca
    INNER JOIN modelo mo
      ON ve.id_modelo = mo.id_modelo
    WHERE vv.id_venta_vehiculo = $1
    `,
    [id]
  );

  return result.rows[0];
};

const actualizarVenta = async (id, venta) => {
  const {
    fecha,
    precio_final,
    tipo_venta,
    estado,
    id_usuario,
    id_cliente,
    id_vehiculo,
    id_plan_financiamiento
  } = venta;

  const result = await pool.query(
    `
    UPDATE venta_vehiculo
    SET fecha = $1,
        precio_final = $2,
        tipo_venta = $3,
        estado = $4,
        id_usuario = $5,
        id_cliente = $6,
        id_vehiculo = $7,
        id_plan_financiamiento = $8
    WHERE id_venta_vehiculo = $9
    RETURNING *
    `,
    [
      fecha,
      precio_final,
      tipo_venta,
      estado,
      id_usuario,
      id_cliente,
      id_vehiculo,
      id_plan_financiamiento || null,
      id
    ]
  );

  return result.rows[0];
};

const eliminarVenta = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM venta_vehiculo
    WHERE id_venta_vehiculo = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
};



module.exports = {
  crearVenta,
  obtenerVentas,
  obtenerVentaPorId,
  actualizarVenta,
  eliminarVenta
};