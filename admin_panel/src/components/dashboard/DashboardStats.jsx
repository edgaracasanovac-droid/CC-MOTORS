import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
  RadialBarChart, RadialBar,
} from "recharts";

const COLORS = {
  red: "#dc2626",
  redLight: "#fca5a5",
  green: "#16a34a",
  greenLight: "#86efac",
  yellow: "#eab308",
  yellowLight: "#fde047",
  blue: "#2563eb",
  blueLight: "#93c5fd",
  slate: "#64748b",
  slateLight: "#cbd5e1",
  dark: "#0f172a",
  darker: "#020617",
};

const PIE_COLORS = [COLORS.red, COLORS.green, COLORS.yellow, COLORS.blue, COLORS.slate];

function StatCard({ icon, label, value, sub, accent = false }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${
      accent
        ? "border-red-500/30 bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-600/20"
        : "border-slate-200 bg-white shadow-sm"
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider ${accent ? "text-red-100" : "text-slate-400"}`}>{label}</p>
          <p className={`mt-2 text-3xl font-black ${accent ? "text-white" : "text-slate-900"}`}>{value}</p>
          {sub && <p className={`mt-1 text-xs font-semibold ${accent ? "text-red-200" : "text-slate-400"}`}>{sub}</p>}
        </div>
        <span className={`text-2xl ${accent ? "opacity-80" : ""}`}>{icon}</span>
      </div>
      {accent && <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10"></div>}
    </div>
  );
}

function ChartCard({ title, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-slate-500">{title}</h3>
      {children}
    </div>
  );
}

function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
    </span>
  );
}

export default function DashboardStats() {
  const [data, setData] = useState({
    vehiculos: [], clientes: [], ventas: [], usuarios: [],
    pagos: [], cotizaciones: [], cuotas: [], planes: [],
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [horaActual, setHoraActual] = useState(new Date());

  const obtenerArray = (respuesta) => {
    if (Array.isArray(respuesta.data)) return respuesta.data;
    for (const key of Object.keys(respuesta.data || {})) {
      if (Array.isArray(respuesta.data[key])) return respuesta.data[key];
    }
    return [];
  };

  const cargarDashboard = async () => {
    setCargando(true);
    setError("");
    try {
      const [vehiculosRes, clientesRes, ventasRes, usuariosRes, pagosRes, cotizacionesRes, cuotasRes, planesRes] =
        await Promise.all([
          api.get("/vehiculos"), api.get("/clientes"), api.get("/ventas"),
          api.get("/usuarios"), api.get("/pagos"), api.get("/cotizaciones"),
          api.get("/cuotas"), api.get("/planes-financiamiento"),
        ]);
      setData({
        vehiculos: obtenerArray(vehiculosRes), clientes: obtenerArray(clientesRes),
        ventas: obtenerArray(ventasRes), usuarios: obtenerArray(usuariosRes),
        pagos: obtenerArray(pagosRes), cotizaciones: obtenerArray(cotizacionesRes),
        cuotas: obtenerArray(cuotasRes), planes: obtenerArray(planesRes),
      });
    } catch {
      setError("Error al cargar el dashboard.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDashboard(); }, []);
  useEffect(() => {
    const t = setInterval(() => setHoraActual(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (v) => `$${Number(v || 0).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtDate = (f) => {
    if (!f) return "—";
    return new Date(f).toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" });
  };

  const stats = useMemo(() => {
    const vehiculos = data.vehiculos;
    const disponibles = vehiculos.filter((v) => v.estado?.toLowerCase() === "disponible").length;
    const vendidos = vehiculos.filter((v) => v.estado?.toLowerCase() === "vendido").length;
    const mant = vehiculos.filter((v) => v.estado?.toLowerCase() === "mantenimiento").length;
    const cotPend = data.cotizaciones.filter((c) => c.estado?.toLowerCase() === "pendiente").length;
    const cuotasPend = data.cuotas.filter((c) => c.estado?.toLowerCase() === "pendiente");
    const cuotasPag = data.cotizaciones.filter((c) => c.estado?.toLowerCase() === "pagado").length;
    const ingresos = data.ventas.reduce((t, v) => t + Number(v.precio_final || 0), 0);
    const pagosR = data.pagos.reduce((t, p) => t + Number(p.monto || 0), 0);
    const porCobrar = cuotasPend.reduce((t, c) => t + Number(c.monto || 0), 0);
    return {
      totalVehiculos: vehiculos.length, disponibles, vendidos, mant,
      clientes: data.clientes.length, usuarios: data.usuarios.length,
      cotizaciones: data.cotizaciones.length, cotPend,
      ventas: data.ventas.length, ingresos,
      pagos: data.pagos.length, pagosR,
      cuotas: data.cuotas.length, cuotasPend: cuotasPend.length, cuotasPag, porCobrar,
      planes: data.planes.length,
    };
  }, [data]);

  const vehiculosChartData = useMemo(() => [
    { name: "Disponibles", value: stats.disponibles, fill: COLORS.green },
    { name: "Vendidos", value: stats.vendidos, fill: COLORS.red },
    { name: "Mantenimiento", value: stats.mant, fill: COLORS.yellow },
  ], [stats]);

  const pagosChartData = useMemo(() => {
    const estados = {};
    data.pagos.forEach((p) => {
      const e = (p.estado || "Otro").toLowerCase();
      estados[e] = (estados[e] || 0) + 1;
    });
    return Object.entries(estados).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [data.pagos]);

  const cotizacionesChartData = useMemo(() => {
    const estados = {};
    data.cotizaciones.forEach((c) => {
      const e = (c.estado || "Otro").toLowerCase();
      estados[e] = (estados[e] || 0) + 1;
    });
    return Object.entries(estados).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [data.cotizaciones]);

  const ventasMensuales = useMemo(() => {
    const meses = {};
    data.ventas.forEach((v) => {
      if (!v.fecha) return;
      const d = new Date(v.fecha);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      meses[key] = (meses[key] || 0) + Number(v.precio_final || 0);
    });
    return Object.entries(meses)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, total]) => {
        const [y, m] = key.split("-");
        const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        return { name: `${meses[parseInt(m) - 1]} ${y.slice(2)}`, ingresos: total };
      });
  }, [data.ventas]);

  const radialData = useMemo(() => {
    const total = stats.totalVehiculos || 1;
    return [
      { name: "Disponibles", value: Math.round((stats.disponibles / total) * 100), fill: COLORS.green },
      { name: "Vendidos", value: Math.round((stats.vendidos / total) * 100), fill: COLORS.red },
      { name: "Mant.", value: Math.round((stats.mant / total) * 100), fill: COLORS.yellow },
    ];
  }, [stats]);

  const ultimasVentas = [...data.ventas].slice(0, 6);
  const ultimosPagos = [...data.pagos].slice(0, 5);

  if (cargando) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100"></div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-100"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
        <h2 className="text-xl font-black">Error</h2>
        <p className="mt-2">{error}</p>
        <button onClick={cargarDashboard} className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <LiveDot />
            <h1 className="text-2xl font-black text-slate-900">Panel de Monitoreo</h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {horaActual.toLocaleDateString("es-VE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · {" "}
            {horaActual.toLocaleTimeString("es-VE")}
          </p>
        </div>
        <button onClick={cargarDashboard} className="self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-red-300 hover:text-red-600">
          Actualizar datos
        </button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="🚗" label="Total Vehículos" value={stats.totalVehiculos} sub={`${stats.disponibles} disponibles`} />
        <StatCard icon="💰" label="Ingresos Ventas" value={fmt(stats.ingresos)} sub={`${stats.ventas} ventas`} accent />
        <StatCard icon="👥" label="Clientes" value={stats.clientes} sub={`${stats.usuarios} usuarios`} />
        <StatCard icon="📄" label="Cotizaciones" value={stats.cotizaciones} sub={`${stats.cotPend} pendientes`} />
      </div>

      {/* SECONDARY KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="💳" label="Pagos" value={stats.pagos} sub={fmt(stats.pagosR) + " recibidos"} />
        <StatCard icon="📆" label="Cuotas" value={stats.cuotas} sub={`${stats.cuotasPend} por cobrar · ${fmt(stats.porCobrar)}`} />
        <StatCard icon="🏦" label="Planes" value={stats.planes} sub="Financiamiento" />
        <StatCard icon="🛠️" label="Mantenimiento" value={stats.mant} sub="Unidades en taller" />
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Vehiculos bar chart */}
        <ChartCard title="Estado del Inventario" className="lg:col-span-1">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehiculosChartData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {vehiculosChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Ingresos mensuales area chart */}
        <ChartCard title="Ingresos Mensuales" className="lg:col-span-2">
          <div className="h-64">
            {ventasMensuales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ventasMensuales}>
                  <defs>
                    <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.red} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={COLORS.red} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                    formatter={(value) => [fmt(value), "Ingresos"]}
                  />
                  <Area type="monotone" dataKey="ingresos" stroke={COLORS.red} strokeWidth={2.5} fill="url(#gradIngresos)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No hay datos de ventas por mes
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cotizaciones pie */}
        <ChartCard title="Cotizaciones por Estado">
          <div className="h-64">
            {cotizacionesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cotizacionesChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {cotizacionesChartData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Sin datos</div>
            )}
          </div>
        </ChartCard>

        {/* Pagos pie */}
        <ChartCard title="Pagos por Estado">
          <div className="h-64">
            {pagosChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pagosChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pagosChartData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Sin datos</div>
            )}
          </div>
        </ChartCard>

        {/* Radial % inventario */}
        <ChartCard title="% Distribución del Inventario">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="20%"
                outerRadius="90%"
                barSize={14}
                data={radialData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar minAngle={15} background clockWise dataKey="value" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} formatter={(v) => `${v}%`} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* TABLES ROW */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Últimas ventas */}
        <ChartCard title="Últimas Ventas">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pr-4">Cliente</th>
                  <th className="pb-3 pr-4">Vehículo</th>
                  <th className="pb-3 pr-4">Precio</th>
                  <th className="pb-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {ultimasVentas.length > 0 ? ultimasVentas.map((v) => (
                  <tr key={v.id_venta || v.id} className="border-b border-slate-50 transition hover:bg-slate-50">
                    <td className="py-3 pr-4 font-semibold text-slate-800">{v.cliente || "—"}</td>
                    <td className="py-3 pr-4 text-slate-500">
                      {v.nombre_marca && v.nombre_modelo ? `${v.nombre_marca} ${v.nombre_modelo}` : v.vehiculo || "—"}
                    </td>
                    <td className="py-3 pr-4 font-bold text-red-600">{fmt(v.precio_final)}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                        {v.estado || "—"}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-400">No hay ventas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </ChartCard>

        {/* Últimos pagos */}
        <ChartCard title="Últimos Pagos">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pr-4">Cliente</th>
                  <th className="pb-3 pr-4">Monto</th>
                  <th className="pb-3 pr-4">Método</th>
                  <th className="pb-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {ultimosPagos.length > 0 ? ultimosPagos.map((p) => (
                  <tr key={p.id_pago || p.id} className="border-b border-slate-50 transition hover:bg-slate-50">
                    <td className="py-3 pr-4 font-semibold text-slate-800">{p.cliente || "—"}</td>
                    <td className="py-3 pr-4 font-bold text-red-600">{fmt(p.monto)}</td>
                    <td className="py-3 pr-4 text-slate-500">{p.metodo_pago || "—"}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        p.estado?.toLowerCase() === "pagado" ? "bg-green-100 text-green-700" :
                        p.estado?.toLowerCase() === "pendiente" ? "bg-yellow-100 text-yellow-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {p.estado || "—"}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-400">No hay pagos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      {/* FINANCIAL SUMMARY BAR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-slate-500">Resumen Financiero</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-xs font-bold uppercase text-green-600">Ingresos por Ventas</p>
            <p className="mt-1 text-2xl font-black text-green-700">{fmt(stats.ingresos)}</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-xs font-bold uppercase text-blue-600">Pagos Recibidos</p>
            <p className="mt-1 text-2xl font-black text-blue-700">{fmt(stats.pagosR)}</p>
          </div>
          <div className="rounded-xl bg-yellow-50 p-4">
            <p className="text-xs font-bold uppercase text-yellow-600">Cuotas por Cobrar</p>
            <p className="mt-1 text-2xl font-black text-yellow-700">{fmt(stats.porCobrar)}</p>
          </div>
          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-xs font-bold uppercase text-red-600">Cuotas Pendientes</p>
            <p className="mt-1 text-2xl font-black text-red-700">{stats.cuotasPend}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
