import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import toast from "react-hot-toast";
import api from "../../lib/api";
import {
  esFechaValida, esNumeroMayorQueCero, esTextoValido,
  obtenerIdValido, obtenerMensajeError,
} from "../../lib/validaciones";

const COLORES_ESTADO = {
  pendiente: "#eab308",
  aprobada: "#22c55e",
  rechazada: "#ef4444",
  en_proceso: "#3b82f6",
  vendida: "#8b5cf6",
  vencida: "#94a3b8",
};

const ETIQUETAS_ESTADO = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  en_proceso: "En Proceso",
  vendida: "Vendida",
  vencida: "Vencida",
};

export default function CotizacionesList() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [planes, setPlanes] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [cotizacionDetalle, setCotizacionDetalle] = useState(null);
  const [cotizacionEliminar, setCotizacionEliminar] = useState(null);
  const [ventaModal, setVentaModal] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState("");

  const fechaHoy = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    fecha: fechaHoy,
    id_cliente: "",
    id_vehiculo: "",
    precio_estimado: "",
    vigencia: "",
    estado: "pendiente",
    mensaje: "",
  });

  const [ventaForm, setVentaForm] = useState({
    tipo_venta: "contado",
    id_plan_financiamiento: "",
  });

  const obtenerArray = (respuesta) => {
    if (Array.isArray(respuesta.data)) return respuesta.data;
    if (Array.isArray(respuesta.data?.cotizaciones)) return respuesta.data.cotizaciones;
    if (Array.isArray(respuesta.data?.clientes)) return respuesta.data.clientes;
    if (Array.isArray(respuesta.data?.vehiculos)) return respuesta.data.vehiculos;
    if (Array.isArray(respuesta.data?.planes)) return respuesta.data.planes;
    return [];
  };

  const cargarDatos = async () => {
    setCargando(true);
    setError("");
    try {
      const [cotizacionesRes, clientesRes, vehiculosRes, planesRes] = await Promise.all([
        api.get("/cotizaciones"),
        api.get("/clientes"),
        api.get("/vehiculos"),
        api.get("/planes-financiamiento"),
      ]);
      setCotizaciones(obtenerArray(cotizacionesRes));
      setClientes(obtenerArray(clientesRes));
      setVehiculos(obtenerArray(vehiculosRes));
      setPlanes(obtenerArray(planesRes));
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al cargar datos del módulo.");
      toast.error("Error al cargar datos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const limpiarFormulario = () => {
    setForm({
      fecha: fechaHoy, id_cliente: "", id_vehiculo: "",
      precio_estimado: "", vigencia: "", estado: "pendiente", mensaje: "",
    });
    setEditandoId(null);
    setMostrarFormulario(false);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "id_vehiculo" && value) {
      const veh = vehiculos.find((v) => String(v.id_vehiculo || v.id) === String(value));
      if (veh && !form.precio_estimado) {
        setForm((prev) => ({ ...prev, [name]: value, precio_estimado: veh.precio_venta || "" }));
      }
    }
  };

  const formatearInputFecha = (f) => (f ? String(f).slice(0, 10) : "");

  const formatearFecha = (f) => {
    if (!f) return "Sin fecha";
    const s = String(f).slice(0, 10);
    const p = s.split("-");
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : s;
  };

  const formatoMoneda = (v) =>
    `$${Number(v || 0).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const obtenerNombreCliente = (c) => {
    if (c.cliente_nombre || c.cliente_apellido)
      return `${c.cliente_nombre || ""} ${c.cliente_apellido || ""}`.trim();
    if (c.cliente?.nombre || c.cliente?.apellido)
      return `${c.cliente.nombre || ""} ${c.cliente.apellido || ""}`.trim();
    return "Sin cliente";
  };

  const obtenerNombreVehiculo = (c) => {
    const marca = c.marca || c.nombre_marca || c.vehiculo?.marca || "";
    const modelo = c.modelo || c.nombre_modelo || c.vehiculo?.modelo || "";
    const placa = c.placa || c.vehiculo?.placa || "";
    return `${marca} ${modelo}${placa ? ` - ${placa}` : ""}`.trim() || "Sin vehículo";
  };

  const obtenerIdCliente = (c) => c?.id_cliente || c?.cliente?.id_cliente || c?.cliente?.id || "";
  const obtenerIdVehiculo = (c) => c?.id_vehiculo || c?.vehiculo?.id_vehiculo || c?.vehiculo?.id || "";

  const badgeEstado = (estado) => {
    const e = String(estado || "pendiente").toLowerCase();
    const mapa = {
      pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
      aprobada: "bg-green-100 text-green-800 border-green-200",
      rechazada: "bg-red-100 text-red-800 border-red-200",
      en_proceso: "bg-blue-100 text-blue-800 border-blue-200",
      vendida: "bg-purple-100 text-purple-800 border-purple-200",
      vencida: "bg-slate-100 text-slate-600 border-slate-200",
    };
    return mapa[e] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  const cotizacionesFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();
    return cotizaciones.filter((c) => {
      const cliente = obtenerNombreCliente(c).toLowerCase();
      const vehiculo = obtenerNombreVehiculo(c).toLowerCase();
      const estado = String(c.estado || "").toLowerCase();
      const id = String(c.id_cotizacion || "");
      const ok = !texto || cliente.includes(texto) || vehiculo.includes(texto) || estado.includes(texto) || id.includes(texto);
      const st = filtroEstado === "todos" || estado === filtroEstado;
      return ok && st;
    });
  }, [cotizaciones, busqueda, filtroEstado]);

  const resumen = useMemo(() => {
    const counts = { total: cotizaciones.length, pendiente: 0, aprobada: 0, rechazada: 0, en_proceso: 0, vendida: 0, vencida: 0, totalEstimado: 0, totalAprobado: 0 };
    cotizaciones.forEach((c) => {
      const e = String(c.estado || "pendiente").toLowerCase();
      if (counts[e] !== undefined) counts[e]++;
      counts.totalEstimado += Number(c.precio_estimado || 0);
      if (e === "aprobada" || e === "vendida" || e === "en_proceso") counts.totalAprobado += Number(c.precio_estimado || 0);
    });
    return counts;
  }, [cotizaciones]);

  const chartDataEstado = useMemo(() => {
    const labels = { pendiente: "Pendientes", aprobada: "Aprobadas", rechazada: "Rechazadas", en_proceso: "En Proceso", vendida: "Vendidas", vencida: "Vencidas" };
    return Object.keys(labels)
      .map((k) => ({ name: labels[k], value: resumen[k] || 0, color: COLORES_ESTADO[k] }))
      .filter((d) => d.value > 0);
  }, [resumen]);

  const chartDataMes = useMemo(() => {
    const meses = {};
    cotizaciones.forEach((c) => {
      const f = String(c.fecha || "").slice(0, 7);
      if (!f) return;
      if (!meses[f]) meses[f] = { mes: f, total: 0, estimado: 0 };
      meses[f].total++;
      meses[f].estimado += Number(c.precio_estimado || 0);
    });
    return Object.values(meses).sort((a, b) => a.mes.localeCompare(b.mes)).slice(-6);
  }, [cotizaciones]);

  const chartDataReciente = useMemo(() => {
    return [...cotizaciones].sort((a, b) => {
      const da = new Date(a.fecha || 0).getTime();
      const db = new Date(b.fecha || 0).getTime();
      return db - da;
    }).slice(0, 10).reverse().map((c) => ({
      name: `#${c.id_cotizacion}`,
      precio: Number(c.precio_estimado || 0),
    }));
  }, [cotizaciones]);

  const cambiarEstado = async (cotizacion, nuevoEstado) => {
    try {
      await api.put(`/cotizaciones/${cotizacion.id_cotizacion}`, {
        fecha: cotizacion.fecha,
        precio_estimado: Number(cotizacion.precio_estimado),
        vigencia: cotizacion.vigencia,
        id_vehiculo: Number(obtenerIdVehiculo(cotizacion)),
        id_cliente: Number(obtenerIdCliente(cotizacion)),
        estado: nuevoEstado,
      });
      toast.success(`Cotización ${ETIQUETAS_ESTADO[nuevoEstado]?.toLowerCase() || nuevoEstado}`);
      await cargarDatos();
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Error al actualizar estado");
    }
  };

  const abrirConvertirVenta = (cotizacion) => {
    setVentaModal(cotizacion);
    setVentaForm({ tipo_venta: "contado", id_plan_financiamiento: "" });
  };

  const confirmarConvertirVenta = async () => {
    if (!ventaModal) return;
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    const id_usuario = usuario?.id_usuario;
    if (!id_usuario) {
      toast.error("No se pudo identificar el usuario. Inicia sesión nuevamente.");
      return;
    }

    const datosVenta = {
      fecha: fechaHoy,
      precio_final: Number(ventaModal.precio_estimado),
      tipo_venta: ventaForm.tipo_venta,
      id_usuario: Number(id_usuario),
      id_cliente: Number(obtenerIdCliente(ventaModal)),
      id_vehiculo: Number(obtenerIdVehiculo(ventaModal)),
      id_plan_financiamiento: ventaForm.tipo_venta === "financiado" ? Number(ventaForm.id_plan_financiamiento) || null : null,
    };

    try {
      await api.post("/ventas", datosVenta);
      await api.put(`/cotizaciones/${ventaModal.id_cotizacion}`, {
        fecha: ventaModal.fecha,
        precio_estimado: Number(ventaModal.precio_estimado),
        vigencia: ventaModal.vigencia,
        id_vehiculo: datosVenta.id_vehiculo,
        id_cliente: datosVenta.id_cliente,
        estado: "vendida",
      });
      toast.success("Venta registrada y cotización convertida correctamente");
      setVentaModal(null);
      await cargarDatos();
    } catch (error) {
      console.error(error.response?.data || error);
      const msg = error.response?.data?.mensaje || error.response?.data?.error || "Error al convertir en venta";
      toast.error(msg);
    }
  };

  const guardarCotizacion = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const datos = {
      fecha: form.fecha,
      precio_estimado: Number(form.precio_estimado),
      vigencia: form.vigencia,
      id_vehiculo: Number(form.id_vehiculo),
      id_cliente: Number(form.id_cliente),
      estado: form.estado || "pendiente",
      mensaje: form.mensaje || null,
    };

    if (!obtenerIdValido(datos.id_cliente)) { setError("Selecciona un cliente válido"); toast.error("Selecciona un cliente válido"); setGuardando(false); return; }
    if (!obtenerIdValido(datos.id_vehiculo)) { setError("Selecciona un vehículo válido"); toast.error("Selecciona un vehículo válido"); setGuardando(false); return; }
    if (!esNumeroMayorQueCero(datos.precio_estimado)) { setError("El precio debe ser mayor a 0"); toast.error("El precio debe ser mayor a 0"); setGuardando(false); return; }
    if (!esTextoValido(form.vigencia) || !esFechaValida(form.vigencia)) { setError("Vigencia inválida"); toast.error("Vigencia inválida"); setGuardando(false); return; }
    if (!esTextoValido(form.fecha) || !esFechaValida(form.fecha)) { setError("Fecha inválida"); toast.error("Fecha inválida"); setGuardando(false); return; }

    try {
      if (editandoId) {
        await api.put(`/cotizaciones/${editandoId}`, datos);
        toast.success("Cotización actualizada");
      } else {
        await api.post("/cotizaciones", datos);
        toast.success("Cotización registrada");
      }
      limpiarFormulario();
      await cargarDatos();
    } catch (error) {
      const msg = obtenerMensajeError(error, "Error al guardar");
      setError(msg);
      toast.error(msg);
    } finally {
      setGuardando(false);
    }
  };

  const editarCotizacion = async (cotizacion) => {
    setError("");
    setCargandoDetalle(true);
    try {
      const res = await api.get(`/cotizaciones/${cotizacion.id_cotizacion}`);
      const det = res.data?.cotizacion || res.data;
      setEditandoId(cotizacion.id_cotizacion);
      setMostrarFormulario(true);
      setForm({
        fecha: formatearInputFecha(det.fecha || cotizacion.fecha || fechaHoy),
        id_cliente: obtenerIdCliente(det) || obtenerIdCliente(cotizacion),
        id_vehiculo: obtenerIdVehiculo(det) || obtenerIdVehiculo(cotizacion),
        precio_estimado: det.precio_estimado || cotizacion.precio_estimado || "",
        vigencia: formatearInputFecha(det.vigencia || cotizacion.vigencia),
        estado: det.estado || cotizacion.estado || "pendiente",
        mensaje: det.mensaje || "",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error("Error al cargar detalle");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const verDetalle = async (cotizacion) => {
    setCargandoDetalle(true);
    try {
      const res = await api.get(`/cotizaciones/${cotizacion.id_cotizacion}`);
      setCotizacionDetalle(res.data?.cotizacion || res.data);
    } catch (error) {
      toast.error("Error al cargar detalle");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!cotizacionEliminar) return;
    try {
      await api.delete(`/cotizaciones/${cotizacionEliminar.id_cotizacion}`);
      toast.success("Cotización eliminada");
      setCotizacionEliminar(null);
      await cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.mensaje || "Error al eliminar");
    }
  };

  if (cargando) {
    return (
      <div className="space-y-6">
        <div className="h-40 animate-pulse rounded-3xl bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-3xl bg-slate-200" />)}</div>
        <div className="grid gap-4 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-72 animate-pulse rounded-3xl bg-slate-200" />)}</div>
        <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── HEADER ── */}
      <section className="rounded-3xl bg-black p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-red-500">
              Monitoreo de Cotizaciones
            </p>
            <h2 className="text-3xl font-black">Panel de Control</h2>
            <p className="mt-2 max-w-2xl text-slate-300">
              Supervisa el pipeline completo de cotizaciones, aprueba o rechaza solicitudes
              y convierte cotizaciones aprobadas en ventas directamente.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={cargarDatos}
              className="rounded-2xl border border-white/20 px-5 py-3 font-bold text-white transition hover:border-white/40"
            >
              Actualizar
            </button>
            <button
              onClick={() => { limpiarFormulario(); setMostrarFormulario(true); }}
              className="rounded-2xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700"
            >
              + Nueva cotización
            </button>
          </div>
        </div>
      </section>

      {/* ── KPI CARDS ── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Total</p>
          <p className="mt-1 text-4xl font-black text-black">{resumen.total}</p>
          <p className="mt-1 text-xs text-slate-500">Cotizaciones registradas</p>
        </div>
        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-yellow-600">Pendientes</p>
          <p className="mt-1 text-4xl font-black text-yellow-700">{resumen.pendiente}</p>
          <p className="mt-1 text-xs text-yellow-600">Esperando revisión</p>
        </div>
        <div className="rounded-3xl border border-green-200 bg-green-50 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-green-600">Aprobadas</p>
          <p className="mt-1 text-4xl font-black text-green-700">{resumen.aprobada}</p>
          <p className="mt-1 text-xs text-green-600">Listas para venta</p>
        </div>
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-blue-600">En Proceso</p>
          <p className="mt-1 text-4xl font-black text-blue-700">{resumen.en_proceso}</p>
          <p className="mt-1 text-xs text-blue-600">Negociación activa</p>
        </div>
        <div className="rounded-3xl border border-purple-200 bg-purple-50 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-purple-600">Vendidas</p>
          <p className="mt-1 text-4xl font-black text-purple-700">{resumen.vendida}</p>
          <p className="mt-1 text-xs text-purple-600">Convertidas en venta</p>
        </div>
      </section>

      {/* ── SECONDARY KPIs ── */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-red-500">Valor Total Estimado</p>
          <p className="mt-1 text-3xl font-black text-red-700">{formatoMoneda(resumen.totalEstimado)}</p>
          <p className="mt-1 text-xs text-red-500">Suma de todas las cotizaciones</p>
        </div>
        <div className="rounded-3xl border border-green-200 bg-green-50 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-green-500">Pipeline Activo</p>
          <p className="mt-1 text-3xl font-black text-green-700">{formatoMoneda(resumen.totalAprobado)}</p>
          <p className="mt-1 text-xs text-green-500">Aprobadas + En Proceso + Vendidas</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Rechazadas</p>
          <p className="mt-1 text-3xl font-black text-slate-700">{resumen.rechazada}</p>
          <p className="mt-1 text-xs text-slate-500">Cotizaciones rechazadas</p>
        </div>
      </section>

      {/* ── CHARTS ── */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-bold uppercase text-slate-500">Distribución por Estado</p>
          {chartDataEstado.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={chartDataEstado} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {chartDataEstado.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} cotizaciones`, name]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">Sin datos</p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-bold uppercase text-slate-500">Cotizaciones por Mes</p>
          {chartDataMes.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartDataMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#dc2626" radius={[6, 6, 0, 0]} name="Cotizaciones" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">Sin datos</p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-bold uppercase text-slate-500">Últimas Cotizaciones (Precio)</p>
          {chartDataReciente.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartDataReciente}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatoMoneda(v)} />
                <Area type="monotone" dataKey="precio" stroke="#dc2626" fill="#fef2f2" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">Sin datos</p>
          )}
        </div>
      </section>

      {/* ── FORMULARIO ── */}
      {mostrarFormulario && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                {editandoId ? "Actualizar" : "Nueva"} cotización
              </p>
              <h2 className="text-2xl font-black text-black">
                {editandoId ? "Editar cotización" : "Registrar cotización"}
              </h2>
            </div>
            <button onClick={limpiarFormulario} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
              Cerrar
            </button>
          </div>

          <form onSubmit={guardarCotizacion} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Fecha</label>
              <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Cliente</label>
              <select name="id_cliente" value={form.id_cliente} onChange={handleChange} className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600" required>
                <option value="">Seleccionar cliente</option>
                {clientes.map((cl) => <option key={cl.id_cliente || cl.id} value={cl.id_cliente || cl.id}>{cl.nombre} {cl.apellido} · {cl.documento}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Vehículo</label>
              <select name="id_vehiculo" value={form.id_vehiculo} onChange={handleChange} className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600" required>
                <option value="">Seleccionar vehículo</option>
                {vehiculos.map((v) => <option key={v.id_vehiculo || v.id} value={v.id_vehiculo || v.id}>{v.nombre_marca || v.marca} {v.nombre_modelo || v.modelo} · {v.placa} · {formatoMoneda(v.precio_venta)}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Precio Estimado</label>
              <input type="number" name="precio_estimado" placeholder="15000" value={form.precio_estimado} onChange={handleChange} className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Vigencia</label>
              <input type="date" name="vigencia" value={form.vigencia} onChange={handleChange} className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Estado</label>
              <select name="estado" value={form.estado} onChange={handleChange} className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600">
                <option value="pendiente">Pendiente</option>
                <option value="aprobada">Aprobada</option>
                <option value="rechazada">Rechazada</option>
                <option value="en_proceso">En Proceso</option>
                <option value="vendida">Vendida</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Mensaje / Observaciones</label>
              <textarea name="mensaje" value={form.mensaje} onChange={handleChange} rows={3} placeholder="Notas internas sobre la cotización..." className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-red-600" />
            </div>

            {error && <div className="md:col-span-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
              <button type="submit" disabled={guardando} className="rounded-xl bg-black px-6 py-3 font-bold text-white transition hover:bg-red-600 disabled:opacity-60">
                {guardando ? "Guardando..." : editandoId ? "Actualizar" : "Guardar cotización"}
              </button>
              <button type="button" onClick={limpiarFormulario} className="rounded-xl bg-slate-200 px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-300">
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ── TABLA ── */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_240px]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Buscar</label>
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Cliente, vehículo, placa, estado o ID..." className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Estado</label>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600">
              <option value="todos">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobada">Aprobadas</option>
              <option value="en_proceso">En Proceso</option>
              <option value="rechazada">Rechazadas</option>
              <option value="vendida">Vendidas</option>
              <option value="vencida">Vencidas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[1200px] w-full border-collapse">
            <thead className="bg-black text-white">
              <tr className="text-left text-xs uppercase">
                <th className="p-4">ID</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Vehículo</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Vigencia</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cotizacionesFiltradas.length > 0 ? (
                cotizacionesFiltradas.map((c) => {
                  const estado = String(c.estado || "pendiente").toLowerCase();
                  return (
                    <tr key={c.id_cotizacion} className="border-b text-sm transition hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-700">#{c.id_cotizacion}</td>
                      <td className="p-4 text-slate-600">{formatearFecha(c.fecha)}</td>
                      <td className="p-4 font-semibold text-black">{obtenerNombreCliente(c)}</td>
                      <td className="p-4 text-slate-600">{obtenerNombreVehiculo(c)}</td>
                      <td className="p-4 font-bold text-red-600">{formatoMoneda(c.precio_estimado)}</td>
                      <td className="p-4 text-slate-600">{formatearFecha(c.vigencia)}</td>
                      <td className="p-4">
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${badgeEstado(c.estado)}`}>
                          {ETIQUETAS_ESTADO[estado] || c.estado || "Sin estado"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          <button onClick={() => verDetalle(c)} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200" title="Ver detalle">
                            Ver
                          </button>

                          {estado === "pendiente" && (
                            <>
                              <button onClick={() => cambiarEstado(c, "aprobada")} className="rounded-lg bg-green-600 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-green-700" title="Aprobar">
                                Aprobar
                              </button>
                              <button onClick={() => cambiarEstado(c, "en_proceso")} className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700" title="En proceso">
                                Proceso
                              </button>
                              <button onClick={() => cambiarEstado(c, "rechazada")} className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-red-700" title="Rechazar">
                                Rechazar
                              </button>
                            </>
                          )}

                          {(estado === "aprobada" || estado === "en_proceso") && (
                            <button onClick={() => abrirConvertirVenta(c)} className="rounded-lg bg-purple-600 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-purple-700" title="Convertir en venta">
                              Venta
                            </button>
                          )}

                          <button onClick={() => { setEditandoId(c.id_cotizacion); editarCotizacion(c); }} disabled={cargandoDetalle} className="rounded-lg bg-black px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-red-600 disabled:opacity-60">
                            Editar
                          </button>

                          <button onClick={() => setCotizacionEliminar(c)} className="rounded-lg bg-red-600/10 px-2.5 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-600 hover:text-white">
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="p-12 text-center">
                    <p className="text-4xl">📄</p>
                    <h3 className="mt-3 text-xl font-black text-black">Sin resultados</h3>
                    <p className="mt-2 text-sm text-slate-500">No se encontraron cotizaciones con los filtros actuales.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between text-xs text-slate-500">
          <p>{cotizacionesFiltradas.length} de {cotizaciones.length} cotizaciones</p>
          <p>Valor total: {formatoMoneda(cotizacionesFiltradas.reduce((s, c) => s + Number(c.precio_estimado || 0), 0))}</p>
        </div>
      </section>

      {/* ── MODAL DETALLE ── */}
      {cotizacionDetalle && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-red-600">Detalle</p>
                <h2 className="text-2xl font-black text-black">Cotización #{cotizacionDetalle.id_cotizacion}</h2>
              </div>
              <button onClick={() => setCotizacionDetalle(null)} className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200">✕</button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Cliente</p>
                <p className="mt-1 font-bold text-black">{obtenerNombreCliente(cotizacionDetalle)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Vehículo</p>
                <p className="mt-1 font-bold text-black">{obtenerNombreVehiculo(cotizacionDetalle)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Fecha</p>
                <p className="mt-1 font-bold text-black">{formatearFecha(cotizacionDetalle.fecha)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Vigencia</p>
                <p className="mt-1 font-bold text-black">{formatearFecha(cotizacionDetalle.vigencia)}</p>
              </div>
              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-bold uppercase text-red-700">Precio Estimado</p>
                <p className="mt-1 text-xl font-black text-red-700">{formatoMoneda(cotizacionDetalle.precio_estimado)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Estado</p>
                <span className={`mt-1 inline-block rounded-full border px-3 py-1 text-xs font-bold ${badgeEstado(cotizacionDetalle.estado)}`}>
                  {ETIQUETAS_ESTADO[String(cotizacionDetalle.estado || "").toLowerCase()] || cotizacionDetalle.estado || "Sin estado"}
                </span>
              </div>
            </div>

            {cotizacionDetalle.mensaje && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Observaciones</p>
                <p className="mt-2 text-sm text-slate-700">{cotizacionDetalle.mensaje}</p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              {String(cotizacionDetalle.estado || "").toLowerCase() === "pendiente" && (
                <>
                  <button onClick={() => { cambiarEstado(cotizacionDetalle, "aprobada"); setCotizacionDetalle(null); }} className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700">Aprobar</button>
                  <button onClick={() => { cambiarEstado(cotizacionDetalle, "rechazada"); setCotizacionDetalle(null); }} className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700">Rechazar</button>
                </>
              )}
              {(String(cotizacionDetalle.estado || "").toLowerCase() === "aprobada" || String(cotizacionDetalle.estado || "").toLowerCase() === "en_proceso") && (
                <button onClick={() => { setCotizacionDetalle(null); abrirConvertirVenta(cotizacionDetalle); }} className="rounded-xl bg-purple-600 px-5 py-3 font-bold text-white transition hover:bg-purple-700">Convertir en Venta</button>
              )}
              <button onClick={() => setCotizacionDetalle(null)} className="rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-red-600">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ELIMINAR ── */}
      {cotizacionEliminar && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 text-5xl">⚠️</div>
            <h2 className="text-2xl font-black text-black">¿Eliminar cotización?</h2>
            <p className="mt-2 text-sm text-slate-600">Se eliminará la cotización #{cotizacionEliminar.id_cotizacion} permanentemente.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={confirmarEliminar} className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700">Sí, eliminar</button>
              <button onClick={() => setCotizacionEliminar(null)} className="flex-1 rounded-xl bg-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-300">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CONVERTIR A VENTA ── */}
      {ventaModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-widest text-purple-600">Convertir a Venta</p>
              <h2 className="text-2xl font-black text-black">Cotización #{ventaModal.id_cotizacion}</h2>
            </div>

            <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Cliente</span><span className="font-bold">{obtenerNombreCliente(ventaModal)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Vehículo</span><span className="font-bold">{obtenerNombreVehiculo(ventaModal)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Precio</span><span className="font-bold text-red-600">{formatoMoneda(ventaModal.precio_estimado)}</span></div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Tipo de Venta</label>
                <select value={ventaForm.tipo_venta} onChange={(e) => setVentaForm((p) => ({ ...p, tipo_venta: e.target.value, id_plan_financiamiento: "" }))} className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-purple-600">
                  <option value="contado">Contado</option>
                  <option value="financiado">Financiado</option>
                </select>
              </div>

              {ventaForm.tipo_venta === "financiado" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Plan de Financiamiento</label>
                  <select value={ventaForm.id_plan_financiamiento} onChange={(e) => setVentaForm((p) => ({ ...p, id_plan_financiamiento: e.target.value }))} className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-purple-600" required>
                    <option value="">Seleccionar plan</option>
                    {planes.map((p) => <option key={p.id_plan_financiamiento || p.id} value={p.id_plan_financiamiento || p.id}>{p.nombre || `Plan #${p.id_plan_financiamiento || p.id}`} · {p.numero_cuotas} cuotas</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={confirmarConvertirVenta} className="flex-1 rounded-xl bg-purple-600 px-5 py-3 font-bold text-white transition hover:bg-purple-700">
                Confirmar Venta
              </button>
              <button onClick={() => setVentaModal(null)} className="flex-1 rounded-xl bg-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-300">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
