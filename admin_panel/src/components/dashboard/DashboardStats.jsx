import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";

export default function DashboardStats() {
  const [data, setData] = useState({
    vehiculos: [],
    clientes: [],
    ventas: [],
    usuarios: [],
    pagos: [],
    cotizaciones: [],
    cuotas: [],
    planes: [],
    testDrives: [],
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const obtenerArray = (respuesta) => {
    if (Array.isArray(respuesta.data)) return respuesta.data;

    if (Array.isArray(respuesta.data?.vehiculos)) return respuesta.data.vehiculos;
    if (Array.isArray(respuesta.data?.clientes)) return respuesta.data.clientes;
    if (Array.isArray(respuesta.data?.ventas)) return respuesta.data.ventas;
    if (Array.isArray(respuesta.data?.usuarios)) return respuesta.data.usuarios;
    if (Array.isArray(respuesta.data?.pagos)) return respuesta.data.pagos;
    if (Array.isArray(respuesta.data?.cotizaciones)) return respuesta.data.cotizaciones;
    if (Array.isArray(respuesta.data?.cuotas)) return respuesta.data.cuotas;
    if (Array.isArray(respuesta.data?.planes)) return respuesta.data.planes;
    if (Array.isArray(respuesta.data?.testDrives)) return respuesta.data.testDrives;

    return [];
  };

  const cargarDashboard = async () => {
    setCargando(true);
    setError("");

    try {
      const [
        vehiculosRes,
        clientesRes,
        ventasRes,
        usuariosRes,
        pagosRes,
        cotizacionesRes,
        cuotasRes,
        planesRes,
      ] = await Promise.all([
        api.get("/vehiculos"),
        api.get("/clientes"),
        api.get("/ventas"),
        api.get("/usuarios"),
        api.get("/pagos"),
        api.get("/cotizaciones"),
        api.get("/cuotas"),
        api.get("/planes-financiamiento"),
      ]);

      setData({
        vehiculos: obtenerArray(vehiculosRes),
        clientes: obtenerArray(clientesRes),
        ventas: obtenerArray(ventasRes),
        usuarios: obtenerArray(usuariosRes),
        pagos: obtenerArray(pagosRes),
        cotizaciones: obtenerArray(cotizacionesRes),
        cuotas: obtenerArray(cuotasRes),
        planes: obtenerArray(planesRes),
        testDrives: [],
      });

      try {
        const testDrivesRes = await api.get("/test-drive");
        setData((prev) => ({
          ...prev,
          testDrives: obtenerArray(testDrivesRes),
        }));
      } catch {
        console.warn("No se pudieron cargar test drives");
      }
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al cargar el dashboard. Verifica que el backend esté activo.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
  }, []);

  const formatoMoneda = (valor) => {
    return `$${Number(valor || 0).toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const stats = useMemo(() => {
    const vehiculosDisponibles = data.vehiculos.filter(
      (vehiculo) => vehiculo.estado?.toLowerCase() === "disponible"
    );

    const vehiculosVendidos = data.vehiculos.filter(
      (vehiculo) => vehiculo.estado?.toLowerCase() === "vendido"
    );

    const vehiculosMantenimiento = data.vehiculos.filter(
      (vehiculo) => vehiculo.estado?.toLowerCase() === "mantenimiento"
    );

    const cotizacionesPendientes = data.cotizaciones.filter(
      (cotizacion) => cotizacion.estado?.toLowerCase() === "pendiente"
    );

    const cuotasPendientes = data.cuotas.filter(
      (cuota) => cuota.estado?.toLowerCase() === "pendiente"
    );

    const cuotasPagadas = data.cuotas.filter(
      (cuota) => cuota.estado?.toLowerCase() === "pagado"
    );

    const testDrivesPendientes = data.testDrives.filter(
      (td) => td.estado?.toLowerCase() === "pendiente"
    );

    const testDrivesConfirmados = data.testDrives.filter(
      (td) => td.estado?.toLowerCase() === "confirmado"
    );

    const ingresosVentas = data.ventas.reduce((total, venta) => {
      return total + Number(venta.precio_final || 0);
    }, 0);

    const pagosRecibidos = data.pagos.reduce((total, pago) => {
      return total + Number(pago.monto || 0);
    }, 0);

    const cuotasPorCobrar = cuotasPendientes.reduce((total, cuota) => {
      return total + Number(cuota.monto || 0);
    }, 0);

    return {
      totalVehiculos: data.vehiculos.length,
      disponibles: vehiculosDisponibles.length,
      vendidos: vehiculosVendidos.length,
      mantenimiento: vehiculosMantenimiento.length,
      clientes: data.clientes.length,
      usuarios: data.usuarios.length,
      cotizaciones: data.cotizaciones.length,
      cotizacionesPendientes: cotizacionesPendientes.length,
      ventas: data.ventas.length,
      ingresosVentas,
      pagos: data.pagos.length,
      pagosRecibidos,
      cuotas: data.cuotas.length,
      cuotasPendientes: cuotasPendientes.length,
      cuotasPagadas: cuotasPagadas.length,
      cuotasPorCobrar,
      planes: data.planes.length,
      testDrives: data.testDrives.length,
      testDrivesPendientes: testDrivesPendientes.length,
      testDrivesConfirmados: testDrivesConfirmados.length,
    };
  }, [data]);

  const ultimasVentas = [...data.ventas].slice(0, 5);
  const ultimosPagos = [...data.pagos].slice(0, 5);
  const ultimasCotizaciones = [...data.cotizaciones].slice(0, 5);
  const cuotasPendientesLista = data.cuotas
    .filter((cuota) => cuota.estado?.toLowerCase() === "pendiente")
    .slice(0, 5);
  const ultimosTestDrives = [...data.testDrives].slice(0, 5);

  const kpis = [
    {
      titulo: "Vehículos",
      valor: stats.totalVehiculos,
      icono: "🚗",
      descripcion: "Unidades registradas",
      detalle: `${stats.disponibles} disponibles`,
    },
    {
      titulo: "Disponibles",
      valor: stats.disponibles,
      icono: "✅",
      descripcion: "Listos para la venta",
      detalle: `${stats.mantenimiento} en mantenimiento`,
    },
    {
      titulo: "Vendidos",
      valor: stats.vendidos,
      icono: "🏁",
      descripcion: "Unidades vendidas",
      detalle: "Estado del inventario",
    },
    {
      titulo: "Clientes",
      valor: stats.clientes,
      icono: "👥",
      descripcion: "Clientes registrados",
      detalle: "Base comercial",
    },
    {
      titulo: "Usuarios",
      valor: stats.usuarios,
      icono: "👤",
      descripcion: "Usuarios del sistema",
      detalle: "Equipo interno",
    },
    {
      titulo: "Cotizaciones",
      valor: stats.cotizaciones,
      icono: "📄",
      descripcion: "Solicitudes recibidas",
      detalle: `${stats.cotizacionesPendientes} pendientes`,
    },
    {
      titulo: "Ventas",
      valor: stats.ventas,
      icono: "💰",
      descripcion: "Operaciones registradas",
      detalle: formatoMoneda(stats.ingresosVentas),
    },
    {
      titulo: "Pagos",
      valor: stats.pagos,
      icono: "💳",
      descripcion: "Pagos registrados",
      detalle: formatoMoneda(stats.pagosRecibidos),
    },
    {
      titulo: "Cuotas pendientes",
      valor: stats.cuotasPendientes,
      icono: "📆",
      descripcion: "Cuotas por cobrar",
      detalle: formatoMoneda(stats.cuotasPorCobrar),
    },
    {
      titulo: "Planes",
      valor: stats.planes,
      icono: "🏦",
      descripcion: "Planes de financiamiento",
      detalle: "Opciones activas",
    },
    {
      titulo: "Test Drives",
      valor: stats.testDrives,
      icono: "🚗",
      descripcion: "Solicitudes de prueba",
      detalle: `${stats.testDrivesPendientes} pendientes`,
    },
  ];

  if (cargando) {
    return (
      <div className="space-y-8">
        <div className="h-52 animate-pulse rounded-3xl bg-slate-200"></div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-3xl bg-slate-200"
            ></div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-3xl bg-slate-200"></div>
          <div className="h-72 animate-pulse rounded-3xl bg-slate-200"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
        <h2 className="text-2xl font-bold">Error al cargar el panel</h2>
        <p className="mt-2">{error}</p>

        <button
          onClick={cargarDashboard}
          className="mt-6 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-black text-white shadow-xl">
        <div className="relative p-8 md:p-10">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-red-600/30"></div>

          <div className="relative z-10 max-w-4xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-red-500">
              Casanova Contreras Motors
            </p>

            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              Dashboard Administrativo
            </h1>

            <p className="mt-4 max-w-2xl text-slate-300">
              Resumen operativo de vehículos, clientes, cotizaciones, ventas,
              pagos, cuotas y financiamiento conectado al backend real de CC Motors.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Ingresos por ventas</p>
                <p className="mt-2 text-2xl font-bold text-red-500">
                  {formatoMoneda(stats.ingresosVentas)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Pagos recibidos</p>
                <p className="mt-2 text-2xl font-bold text-red-500">
                  {formatoMoneda(stats.pagosRecibidos)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Cuotas por cobrar</p>
                <p className="mt-2 text-2xl font-bold text-red-500">
                  {formatoMoneda(stats.cuotasPorCobrar)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <article
            key={kpi.titulo}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="text-4xl">{kpi.icono}</span>
              <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                KPI
              </span>
            </div>

            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              {kpi.titulo}
            </p>

            <p className="mt-2 text-4xl font-black text-black">{kpi.valor}</p>

            <p className="mt-2 text-sm text-slate-500">{kpi.descripcion}</p>

            <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {kpi.detalle}
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                Operaciones
              </p>
              <h2 className="text-2xl font-black text-black">
                Últimas ventas realizadas
              </h2>
            </div>

            <a
              href="/dashboard/ventas"
              className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Ver ventas
            </a>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-[800px] w-full border-collapse">
              <thead className="bg-black text-white">
                <tr className="text-left text-sm">
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Vehículo</th>
                  <th className="p-4">Precio</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>

              <tbody>
                {ultimasVentas.length > 0 ? (
                  ultimasVentas.map((venta) => (
                    <tr
                      key={venta.id_venta || venta.id}
                      className="border-b text-sm transition hover:bg-slate-50"
                    >
                      <td className="p-4 font-semibold text-slate-800">
                        {venta.cliente || "Sin cliente"}
                      </td>
                      <td className="p-4 text-slate-600">
                        {venta.nombre_marca && venta.nombre_modelo
                          ? `${venta.nombre_marca} ${venta.nombre_modelo}`
                          : venta.vehiculo || "Sin vehículo"}
                      </td>
                      <td className="p-4 font-bold text-red-600">
                        {formatoMoneda(venta.precio_final)}
                      </td>
                      <td className="p-4 text-slate-600">
                        {venta.tipo_venta || "Sin tipo"}
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {venta.estado || "Sin estado"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">
                      No hay ventas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black">🚗 Últimos test drives</h2>
            <a
              href="/dashboard/test-drive"
              className="text-sm font-semibold text-red-600 hover:text-black"
            >
              Ver todo
            </a>
          </div>

          {ultimosTestDrives.length > 0 ? (
            <div className="space-y-4">
              {ultimosTestDrives.map((td) => (
                <div
                  key={td.id_test_drive || td.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-black">
                        {td.cliente?.nombre || ""} {td.cliente?.apellido || ""}
                      </p>
                      <p className="text-sm text-slate-500">
                        {td.vehiculo?.marca || ""}{" "}
                        {td.vehiculo?.modelo || ""} ·{" "}
                        {td.vehiculo?.placa || ""}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        td.estado === "confirmado"
                          ? "bg-green-100 text-green-700"
                          : td.estado === "cancelado"
                            ? "bg-red-100 text-red-700"
                            : td.estado === "realizado"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {td.estado || "pendiente"}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    {td.fecha || "Sin fecha"} · {td.hora || "Sin hora"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
              No hay solicitudes de test drive.
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black">📄 Últimas cotizaciones</h2>
            <a
              href="/dashboard/cotizaciones"
              className="text-sm font-semibold text-red-600 hover:text-black"
            >
              Ver todo
            </a>
          </div>

          {ultimasCotizaciones.length > 0 ? (
            <div className="space-y-4">
              {ultimasCotizaciones.map((cotizacion) => (
                <div
                  key={cotizacion.id_cotizacion}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-black">
                        {cotizacion.cliente_nombre} {cotizacion.cliente_apellido}
                      </p>
                      <p className="text-sm text-slate-500">
                        {cotizacion.marca} {cotizacion.modelo} ·{" "}
                        {cotizacion.placa}
                      </p>
                    </div>

                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                      {cotizacion.estado || "Sin estado"}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    {formatoMoneda(cotizacion.precio_estimado)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
              No hay cotizaciones registradas.
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black">💳 Últimos pagos</h2>
            <a
              href="/dashboard/pagos"
              className="text-sm font-semibold text-red-600 hover:text-black"
            >
              Ver todo
            </a>
          </div>

          {ultimosPagos.length > 0 ? (
            <div className="space-y-4">
              {ultimosPagos.map((pago) => (
                <div
                  key={pago.id_pago || pago.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <p className="font-bold text-black">
                    {pago.cliente || "Sin cliente"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {pago.metodo_pago || "Sin método"} · Ref:{" "}
                    {pago.referencia || "N/A"}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-black text-red-600">
                      {formatoMoneda(pago.monto)}
                    </p>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {pago.estado || "Sin estado"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
              No hay pagos registrados.
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black">📆 Cuotas pendientes</h2>
            <a
              href="/dashboard/cuotas"
              className="text-sm font-semibold text-red-600 hover:text-black"
            >
              Ver todo
            </a>
          </div>

          {cuotasPendientesLista.length > 0 ? (
            <div className="space-y-4">
              {cuotasPendientesLista.map((cuota) => (
                <div
                  key={cuota.id_cuota || cuota.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <p className="font-bold text-black">
                    {cuota.cliente || "Sin cliente"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Vence: {formatearFecha(cuota.fecha_vencimiento)}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-black text-red-600">
                      {formatoMoneda(cuota.monto)}
                    </p>

                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                      {cuota.estado || "pendiente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
              No hay cuotas pendientes.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}