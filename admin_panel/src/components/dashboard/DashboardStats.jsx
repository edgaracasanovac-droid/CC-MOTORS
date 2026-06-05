import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    vehiculos: 0,
    clientes: 0,
    ventas: 0,
    usuarios: 0,
    pagos: 0,
    cotizaciones: 0,
    disponibles: 0,
    vendidos: 0,
    ingresos: 0,
    ultimasVentas: [],
    ultimosPagos: [],
    ultimosClientes: [],
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarEstadisticas = async () => {
    try {
      const [
        vehiculosRes,
        clientesRes,
        ventasRes,
        usuariosRes,
        pagosRes,
        cotizacionesRes,
      ] = await Promise.all([
        api.get("/vehiculos"),
        api.get("/clientes"),
        api.get("/ventas"),
        api.get("/usuarios"),
        api.get("/pagos"),
        api.get("/cotizaciones"),
      ]);

      const vehiculos = vehiculosRes.data;
      const clientes = clientesRes.data;
      const ventas = ventasRes.data;
      const usuarios = usuariosRes.data;
      const pagos = pagosRes.data;
      const cotizaciones = cotizacionesRes.data;

      const disponibles = vehiculos.filter(
        (v) => v.estado?.toLowerCase() === "disponible"
      ).length;

      const vendidos = vehiculos.filter(
        (v) => v.estado?.toLowerCase() === "vendido"
      ).length;

      const ingresos = ventas.reduce((total, venta) => {
        return total + Number(venta.precio_final || 0);
      }, 0);

      setStats({
        vehiculos: vehiculos.length,
        clientes: clientes.length,
        ventas: ventas.length,
        usuarios: usuarios.length,
        pagos: pagos.length,
        cotizaciones: cotizaciones.length,
        disponibles,
        vendidos,
        ingresos,
        ultimasVentas: ventas.slice(0, 5),
        ultimosPagos: pagos.slice(0, 5),
        ultimosClientes: clientes.slice(0, 5),
      });
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al cargar estadísticas");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  if (cargando) return <p>Cargando estadísticas...</p>;

  if (error) return <p className="text-red-500">{error}</p>;

  const cards = [
    { titulo: "Vehículos", valor: stats.vehiculos, icono: "🚗", descripcion: "Vehículos registrados" },
    { titulo: "Clientes", valor: stats.clientes, icono: "👥", descripcion: "Clientes registrados" },
    { titulo: "Ventas", valor: stats.ventas, icono: "💰", descripcion: "Ventas realizadas" },
    { titulo: "Usuarios", valor: stats.usuarios, icono: "👤", descripcion: "Usuarios del sistema" },
    { titulo: "Pagos", valor: stats.pagos, icono: "💳", descripcion: "Pagos registrados" },
    { titulo: "Cotizaciones", valor: stats.cotizaciones, icono: "📄", descripcion: "Cotizaciones realizadas" },
    { titulo: "Disponibles", valor: stats.disponibles, icono: "✅", descripcion: "Vehículos disponibles" },
    { titulo: "Vendidos", valor: stats.vendidos, icono: "🏁", descripcion: "Vehículos vendidos" },
    {
      titulo: "Ingresos",
      valor: `$${stats.ingresos.toLocaleString("es-VE")}`,
      icono: "💵",
      descripcion: "Total en ventas",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-black p-8 text-white shadow">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-red-500">
          Concesionaria Casanova Contreras
        </p>

        <h1 className="text-4xl font-bold">Panel Administrativo</h1>

        <p className="mt-2 text-slate-300">
          Resumen general de ventas, clientes, vehículos y operaciones del sistema.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.titulo}
            className="rounded-2xl border-l-4 border-red-600 bg-black p-6 text-white shadow transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-4xl">{card.icono}</span>
              <span className="rounded-full bg-red-600 px-3 py-1 text-sm text-white">
                Total
              </span>
            </div>

            <h3 className="text-lg font-semibold text-slate-300">
              {card.titulo}
            </h3>

            <p className="mt-2 text-4xl font-bold text-red-500">
              {card.valor}
            </p>

            <p className="mt-2 text-sm text-slate-400">{card.descripcion}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow">
        <div className="border-b p-6">
          <h2 className="text-2xl font-bold">🚘 Últimas ventas realizadas</h2>
        </div>

        <table className="w-full border-collapse">
          <thead className="bg-black text-white">
            <tr className="text-left">
              <th className="p-3">Cliente</th>
              <th className="p-3">Vehículo</th>
              <th className="p-3">Precio</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>

          <tbody>
            {stats.ultimasVentas.map((venta) => (
              <tr key={venta.id_venta || venta.id} className="border-b hover:bg-slate-50">
                <td className="p-3">{venta.cliente}</td>
                <td className="p-3">{venta.vehiculo}</td>
                <td className="p-3">
                  ${Number(venta.precio_final || 0).toLocaleString("es-VE")}
                </td>
                <td className="p-3">{venta.tipo_venta}</td>
                <td className="p-3">{venta.estado}</td>
              </tr>
            ))}

            {stats.ultimasVentas.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-slate-500">
                  No hay ventas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">💳 Últimos pagos registrados</h2>

          {stats.ultimosPagos.length > 0 ? (
            stats.ultimosPagos.map((pago) => (
              <div key={pago.id_pago || pago.id} className="border-b py-3">
                <p className="font-semibold">
                  {pago.cliente || pago.nombre_cliente || "Sin cliente"}
                </p>

                <p className="text-sm text-slate-500">
                  ${Number(pago.monto || 0).toLocaleString("es-VE")} ·{" "}
                  {pago.metodo_pago}
                </p>
              </div>
            ))
          ) : (
            <p className="text-slate-500">No hay pagos registrados.</p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">👥 Últimos clientes registrados</h2>

          {stats.ultimosClientes.length > 0 ? (
            stats.ultimosClientes.map((cliente) => (
              <div
                key={cliente.id_cliente || cliente.id}
                className="border-b py-3"
              >
                <p className="font-semibold">
                  {cliente.nombre} {cliente.apellido}
                </p>

                <p className="text-sm text-slate-500">{cliente.correo}</p>
              </div>
            ))
          ) : (
            <p className="text-slate-500">No hay clientes registrados.</p>
          )}
        </div>
      </div>
    </div>
  );
}