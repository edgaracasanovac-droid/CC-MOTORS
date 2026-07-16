import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { esFechaValida, esNumeroMayorQueCero, esTextoValido, obtenerIdValido, obtenerMensajeError } from "../../lib/validaciones";

export default function CotizacionesList() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [cotizacionDetalle, setCotizacionDetalle] = useState(null);
  const [cotizacionEliminar, setCotizacionEliminar] = useState(null);

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
  });

  const obtenerArray = (respuesta) => {
    if (Array.isArray(respuesta.data)) return respuesta.data;
    if (Array.isArray(respuesta.data?.cotizaciones)) return respuesta.data.cotizaciones;
    if (Array.isArray(respuesta.data?.clientes)) return respuesta.data.clientes;
    if (Array.isArray(respuesta.data?.vehiculos)) return respuesta.data.vehiculos;
    return [];
  };

  const cargarDatos = async () => {
    setCargando(true);
    setError("");

    try {
      const [cotizacionesRes, clientesRes, vehiculosRes] = await Promise.all([
        api.get("/cotizaciones"),
        api.get("/clientes"),
        api.get("/vehiculos"),
      ]);

      setCotizaciones(obtenerArray(cotizacionesRes));
      setClientes(obtenerArray(clientesRes));
      setVehiculos(obtenerArray(vehiculosRes));
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al cargar las cotizaciones.");
      toast.error("Error al cargar cotizaciones");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const limpiarFormulario = () => {
    setForm({
      fecha: fechaHoy,
      id_cliente: "",
      id_vehiculo: "",
      precio_estimado: "",
      vigencia: "",
      estado: "pendiente",
    });

    setEditandoId(null);
    setMostrarFormulario(false);
    setError("");
  };

  const abrirNuevaCotizacion = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const obtenerIdCliente = (cotizacion) => {
    return (
      cotizacion?.id_cliente ||
      cotizacion?.cliente?.id_cliente ||
      cotizacion?.cliente?.id ||
      ""
    );
  };

  const obtenerIdVehiculo = (cotizacion) => {
    return (
      cotizacion?.id_vehiculo ||
      cotizacion?.vehiculo?.id_vehiculo ||
      cotizacion?.vehiculo?.id ||
      ""
    );
  };

  const formatearInputFecha = (fecha) => {
    if (!fecha) return "";
    return String(fecha).slice(0, 10);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const fechaString = String(fecha).slice(0, 10);
    const partes = fechaString.split("-");

    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    return fechaString;
  };

  const formatoMoneda = (valor) => {
    return `$${Number(valor || 0).toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const obtenerNombreCliente = (cotizacion) => {
    if (cotizacion.cliente_nombre || cotizacion.cliente_apellido) {
      return `${cotizacion.cliente_nombre || ""} ${cotizacion.cliente_apellido || ""}`.trim();
    }

    if (cotizacion.cliente) return cotizacion.cliente;

    if (cotizacion.cliente?.nombre || cotizacion.cliente?.apellido) {
      return `${cotizacion.cliente.nombre || ""} ${cotizacion.cliente.apellido || ""}`.trim();
    }

    return "Sin cliente";
  };

  const obtenerNombreVehiculo = (cotizacion) => {
    const marca = cotizacion.marca || cotizacion.nombre_marca || cotizacion.vehiculo?.marca || "";
    const modelo = cotizacion.modelo || cotizacion.nombre_modelo || cotizacion.vehiculo?.modelo || "";
    const placa = cotizacion.placa || cotizacion.vehiculo?.placa || "";

    const texto = `${marca} ${modelo}${placa ? ` - ${placa}` : ""}`.trim();

    return texto || "Sin vehículo";
  };

  const obtenerBadgeEstado = (estado) => {
    const estadoNormalizado = String(estado || "sin estado").toLowerCase();

    if (estadoNormalizado === "pendiente") {
      return "bg-yellow-100 text-yellow-800";
    }

    return "bg-slate-100 text-slate-700";
  };

  const cotizacionesFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return cotizaciones.filter((cotizacion) => {
      const cliente = obtenerNombreCliente(cotizacion).toLowerCase();
      const vehiculo = obtenerNombreVehiculo(cotizacion).toLowerCase();
      const estado = String(cotizacion.estado || "").toLowerCase();
      const id = String(cotizacion.id_cotizacion || "");

      const coincideBusqueda =
        !texto ||
        cliente.includes(texto) ||
        vehiculo.includes(texto) ||
        estado.includes(texto) ||
        id.includes(texto);

      const coincideEstado =
        filtroEstado === "todos" ||
        (filtroEstado === "pendiente" && estado === "pendiente") ||
        (filtroEstado === "otros" && estado !== "pendiente");

      return coincideBusqueda && coincideEstado;
    });
  }, [cotizaciones, busqueda, filtroEstado]);

  const resumen = useMemo(() => {
    const pendientes = cotizaciones.filter(
      (cotizacion) => cotizacion.estado?.toLowerCase() === "pendiente"
    ).length;

    const totalEstimado = cotizaciones.reduce((total, cotizacion) => {
      return total + Number(cotizacion.precio_estimado || 0);
    }, 0);

    return {
      total: cotizaciones.length,
      pendientes,
      otros: cotizaciones.length - pendientes,
      totalEstimado,
    };
  }, [cotizaciones]);

  const guardarCotizacion = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const datosCotizacion = {
      fecha: form.fecha,
      precio_estimado: Number(form.precio_estimado),
      vigencia: form.vigencia,
      id_vehiculo: Number(form.id_vehiculo),
      id_cliente: Number(form.id_cliente),
      estado: form.estado || "pendiente",
    };

    if (!obtenerIdValido(datosCotizacion.id_cliente)) {
      setError("Debe seleccionar un cliente válido");
      toast.error("Debe seleccionar un cliente válido");
      setGuardando(false);
      return;
    }

    if (!obtenerIdValido(datosCotizacion.id_vehiculo)) {
      setError("Debe seleccionar un vehículo válido");
      toast.error("Debe seleccionar un vehículo válido");
      setGuardando(false);
      return;
    }

    if (!esNumeroMayorQueCero(datosCotizacion.precio_estimado)) {
      setError("El precio estimado debe ser mayor que cero");
      toast.error("El precio estimado debe ser mayor que cero");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosCotizacion.vigencia) || !esFechaValida(datosCotizacion.vigencia)) {
      setError("La vigencia debe ser una fecha válida");
      toast.error("La vigencia debe ser una fecha válida");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosCotizacion.fecha) || !esFechaValida(datosCotizacion.fecha)) {
      setError("La fecha debe ser válida");
      toast.error("La fecha debe ser válida");
      setGuardando(false);
      return;
    }

    try {
      if (editandoId) {
        await api.put(`/cotizaciones/${editandoId}`, datosCotizacion);
        toast.success("Cotización actualizada correctamente");
      } else {
        await api.post("/cotizaciones", datosCotizacion);
        toast.success("Cotización registrada correctamente");
      }

      limpiarFormulario();
      await cargarDatos();
    } catch (error) {
      const mensaje = obtenerMensajeError(error, "Error al guardar la cotización");

      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const editarCotizacion = async (cotizacion) => {
    setError("");
    setCargandoDetalle(true);

    try {
      const respuesta = await api.get(`/cotizaciones/${cotizacion.id_cotizacion}`);
      const detalle = respuesta.data?.cotizacion || respuesta.data;

      setEditandoId(cotizacion.id_cotizacion);
      setMostrarFormulario(true);

      setForm({
        fecha: formatearInputFecha(detalle.fecha || cotizacion.fecha || fechaHoy),
        id_cliente: obtenerIdCliente(detalle) || obtenerIdCliente(cotizacion),
        id_vehiculo: obtenerIdVehiculo(detalle) || obtenerIdVehiculo(cotizacion),
        precio_estimado: detalle.precio_estimado || cotizacion.precio_estimado || "",
        vigencia: formatearInputFecha(detalle.vigencia || cotizacion.vigencia),
        estado: detalle.estado || cotizacion.estado || "pendiente",
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Error al obtener el detalle de la cotización");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const verDetalle = async (cotizacion) => {
    setCargandoDetalle(true);

    try {
      const respuesta = await api.get(`/cotizaciones/${cotizacion.id_cotizacion}`);
      setCotizacionDetalle(respuesta.data?.cotizacion || respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Error al cargar el detalle");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const confirmarEliminarCotizacion = async () => {
    if (!cotizacionEliminar) return;

    try {
      await api.delete(`/cotizaciones/${cotizacionEliminar.id_cotizacion}`);
      toast.success("Cotización eliminada correctamente");
      setCotizacionEliminar(null);
      await cargarDatos();
    } catch (error) {
      console.error(error.response?.data || error);

      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "Error al eliminar la cotización";

      toast.error(mensaje);
    }
  };

  if (cargando) {
    return (
      <div className="space-y-6">
        <div className="h-36 animate-pulse rounded-3xl bg-slate-200"></div>

        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-3xl bg-slate-200"
            ></div>
          ))}
        </div>

        <div className="h-96 animate-pulse rounded-3xl bg-slate-200"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-black p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-red-500">
              Operaciones comerciales
            </p>

            <h2 className="text-3xl font-black">Gestión de Cotizaciones</h2>

            <p className="mt-2 max-w-2xl text-slate-300">
              Administra las solicitudes de cotización registradas desde el panel
              y las cotizaciones recibidas desde la website de CC Motors.
            </p>
          </div>

          <button
            onClick={abrirNuevaCotizacion}
            className="rounded-2xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700"
          >
            + Nueva cotización
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">Total</p>
          <p className="mt-2 text-4xl font-black text-black">{resumen.total}</p>
          <p className="mt-2 text-sm text-slate-500">Cotizaciones registradas</p>
        </div>

        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-yellow-700">Pendientes</p>
          <p className="mt-2 text-4xl font-black text-yellow-700">
            {resumen.pendientes}
          </p>
          <p className="mt-2 text-sm text-yellow-700">Estado confirmado por backend</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">Otros estados</p>
          <p className="mt-2 text-4xl font-black text-black">{resumen.otros}</p>
          <p className="mt-2 text-sm text-slate-500">Estados no validados por backend</p>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-red-700">Valor estimado</p>
          <p className="mt-2 text-3xl font-black text-red-700">
            {formatoMoneda(resumen.totalEstimado)}
          </p>
          <p className="mt-2 text-sm text-red-700">Suma de precios estimados</p>
        </div>
      </section>

      {mostrarFormulario && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                {editandoId ? "Actualizar registro" : "Nuevo registro"}
              </p>

              <h2 className="text-2xl font-black text-black">
                {editandoId ? "Editar cotización" : "Registrar cotización"}
              </h2>
            </div>

            <button
              type="button"
              onClick={limpiarFormulario}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Cerrar formulario
            </button>
          </div>

          <form onSubmit={guardarCotizacion} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Fecha
              </label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Cliente
              </label>
              <select
                name="id_cliente"
                value={form.id_cliente}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              >
                <option value="">Selecciona un cliente</option>

                {clientes.map((cliente) => (
                  <option
                    key={cliente.id_cliente || cliente.id}
                    value={cliente.id_cliente || cliente.id}
                  >
                    {cliente.nombre} {cliente.apellido} · {cliente.documento}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Vehículo
              </label>
              <select
                name="id_vehiculo"
                value={form.id_vehiculo}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              >
                <option value="">Selecciona un vehículo</option>

                {vehiculos.map((vehiculo) => (
                  <option
                    key={vehiculo.id_vehiculo || vehiculo.id}
                    value={vehiculo.id_vehiculo || vehiculo.id}
                  >
                    {vehiculo.nombre_marca || vehiculo.marca || "Vehículo"}{" "}
                    {vehiculo.nombre_modelo || vehiculo.modelo || ""} ·{" "}
                    {vehiculo.placa} · {formatoMoneda(vehiculo.precio_venta)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Precio estimado
              </label>
              <input
                type="number"
                name="precio_estimado"
                placeholder="15000"
                value={form.precio_estimado}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Vigencia
              </label>
              <input
                type="date"
                name="vigencia"
                value={form.vigencia}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Estado
              </label>
              <input
                name="estado"
                placeholder="pendiente"
                value={form.estado}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
              />

              <p className="mt-2 text-xs text-slate-500">
                El backend solo confirma como estado real inicial: pendiente.
              </p>
            </div>

            {error && (
              <div className="md:col-span-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
              <button
                type="submit"
                disabled={guardando}
                className="rounded-xl bg-black px-6 py-3 font-bold text-white transition hover:bg-red-600 disabled:opacity-60"
              >
                {guardando
                  ? "Guardando..."
                  : editandoId
                    ? "Actualizar cotización"
                    : "Guardar cotización"}
              </button>

              <button
                type="button"
                onClick={limpiarFormulario}
                className="rounded-xl bg-slate-200 px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_240px]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Buscar cotización
            </label>
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por cliente, vehículo, placa, estado o ID..."
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Filtrar estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="otros">Otros estados</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[1100px] w-full border-collapse">
            <thead className="bg-black text-white">
              <tr className="text-left text-sm">
                <th className="p-4">ID</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Vehículo</th>
                <th className="p-4">Precio estimado</th>
                <th className="p-4">Vigencia</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cotizacionesFiltradas.length > 0 ? (
                cotizacionesFiltradas.map((cotizacion) => (
                  <tr
                    key={cotizacion.id_cotizacion}
                    className="border-b text-sm transition hover:bg-slate-50"
                  >
                    <td className="p-4 font-bold text-slate-700">
                      #{cotizacion.id_cotizacion}
                    </td>

                    <td className="p-4 text-slate-600">
                      {formatearFecha(cotizacion.fecha)}
                    </td>

                    <td className="p-4 font-semibold text-black">
                      {obtenerNombreCliente(cotizacion)}
                    </td>

                    <td className="p-4 text-slate-600">
                      {obtenerNombreVehiculo(cotizacion)}
                    </td>

                    <td className="p-4 font-bold text-red-600">
                      {formatoMoneda(cotizacion.precio_estimado)}
                    </td>

                    <td className="p-4 text-slate-600">
                      {formatearFecha(cotizacion.vigencia)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${obtenerBadgeEstado(
                          cotizacion.estado
                        )}`}
                      >
                        {cotizacion.estado || "Sin estado"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => verDetalle(cotizacion)}
                          className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                        >
                          Ver
                        </button>

                        <button
                          onClick={() => editarCotizacion(cotizacion)}
                          disabled={cargandoDetalle}
                          className="rounded-lg bg-black px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600 disabled:opacity-60"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => setCotizacionEliminar(cotizacion)}
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-10 text-center">
                    <div className="mx-auto max-w-md">
                      <p className="text-4xl">📄</p>
                      <h3 className="mt-3 text-xl font-black text-black">
                        No hay cotizaciones para mostrar
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        No se encontraron registros con la búsqueda o filtro actual.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {cotizacionDetalle && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                  Detalle de cotización
                </p>
                <h2 className="text-2xl font-black text-black">
                  Cotización #{cotizacionDetalle.id_cotizacion}
                </h2>
              </div>

              <button
                onClick={() => setCotizacionDetalle(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Cliente</p>
                <p className="mt-1 font-bold text-black">
                  {obtenerNombreCliente(cotizacionDetalle)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Vehículo</p>
                <p className="mt-1 font-bold text-black">
                  {obtenerNombreVehiculo(cotizacionDetalle)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Fecha</p>
                <p className="mt-1 font-bold text-black">
                  {formatearFecha(cotizacionDetalle.fecha)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Vigencia</p>
                <p className="mt-1 font-bold text-black">
                  {formatearFecha(cotizacionDetalle.vigencia)}
                </p>
              </div>

              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-bold uppercase text-red-700">
                  Precio estimado
                </p>
                <p className="mt-1 text-xl font-black text-red-700">
                  {formatoMoneda(cotizacionDetalle.precio_estimado)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Estado</p>
                <p className="mt-1 font-bold text-black">
                  {cotizacionDetalle.estado || "Sin estado"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-800">
              Las acciones como aprobar, rechazar, observaciones o convertir en venta
              no tienen endpoint propio actualmente. Para cambios básicos se usa
              PUT /api/cotizaciones/:id.
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setCotizacionDetalle(null)}
                className="rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-red-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {cotizacionEliminar && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 text-5xl">⚠️</div>

            <h2 className="text-2xl font-black text-black">
              ¿Eliminar cotización?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Esta acción eliminará la cotización #{cotizacionEliminar.id_cotizacion}.
              No se puede deshacer.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={confirmarEliminarCotizacion}
                className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
              >
                Sí, eliminar
              </button>

              <button
                onClick={() => setCotizacionEliminar(null)}
                className="flex-1 rounded-xl bg-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}