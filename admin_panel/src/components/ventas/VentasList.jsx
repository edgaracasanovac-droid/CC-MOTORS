import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { esFechaValida, esNumeroMayorQueCero, esTextoValido, obtenerIdValido, obtenerMensajeError } from "../../lib/validaciones";

export default function VentasList() {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [planes, setPlanes] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [ventaDetalle, setVentaDetalle] = useState(null);
  const [ventaEliminar, setVentaEliminar] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState("");

  const fechaHoy = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    id_cliente: "",
    id_usuario: "",
    id_vehiculo: "",
    id_plan_financiamiento: "",
    precio_final: "",
    tipo_venta: "contado",
    estado: "pendiente",
    fecha: fechaHoy,
  });

  const obtenerArray = (respuesta) => {
    if (Array.isArray(respuesta.data)) return respuesta.data;
    if (Array.isArray(respuesta.data?.ventas)) return respuesta.data.ventas;
    if (Array.isArray(respuesta.data?.clientes)) return respuesta.data.clientes;
    if (Array.isArray(respuesta.data?.usuarios)) return respuesta.data.usuarios;
    if (Array.isArray(respuesta.data?.vehiculos)) return respuesta.data.vehiculos;
    if (Array.isArray(respuesta.data?.planes)) return respuesta.data.planes;
    return [];
  };

  const cargarDatos = async () => {
    setCargando(true);
    setError("");

    try {
      const [ventasRes, clientesRes, usuariosRes, vehiculosRes, planesRes] =
        await Promise.all([
          api.get("/ventas"),
          api.get("/clientes"),
          api.get("/usuarios"),
          api.get("/vehiculos"),
          api.get("/planes-financiamiento"),
        ]);

      setVentas(obtenerArray(ventasRes));
      setClientes(obtenerArray(clientesRes));
      setUsuarios(obtenerArray(usuariosRes));
      setVehiculos(obtenerArray(vehiculosRes));
      setPlanes(obtenerArray(planesRes));
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al cargar las ventas.");
      toast.error("Error al cargar ventas");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const limpiarFormulario = () => {
    setForm({
      id_cliente: "",
      id_usuario: "",
      id_vehiculo: "",
      id_plan_financiamiento: "",
      precio_final: "",
      tipo_venta: "contado",
      estado: "pendiente",
      fecha: fechaHoy,
    });

    setEditandoId(null);
    setMostrarFormulario(false);
    setError("");
  };

  const abrirNueva = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "tipo_venta" && value === "contado") {
      setForm({
        ...form,
        tipo_venta: value,
        id_plan_financiamiento: "",
      });

      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  const formatoMoneda = (valor) => {
    return `$${Number(valor || 0).toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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

  const formatearInputFecha = (fecha) => {
    if (!fecha) return fechaHoy;
    return String(fecha).slice(0, 10);
  };

  const obtenerNombreCliente = (venta) => {
    return venta.cliente || venta.nombre_cliente || "Sin cliente";
  };

  const obtenerNombreUsuario = (venta) => {
    return venta.usuario || venta.nombre_usuario || "Sin usuario";
  };

  const obtenerNombreVehiculo = (venta) => {
    const marca = venta.nombre_marca || venta.marca || "";
    const modelo = venta.nombre_modelo || venta.modelo || "";
    const placa = venta.vehiculo || venta.placa || "";

    const texto = `${marca} ${modelo}${placa ? ` - ${placa}` : ""}`.trim();

    return texto || "Sin vehículo";
  };

  const obtenerBadgeEstado = (estado) => {
    const estadoNormalizado = String(estado || "").toLowerCase();

    if (estadoNormalizado === "pagado" || estadoNormalizado === "completada") {
      return "bg-green-100 text-green-800";
    }

    if (estadoNormalizado === "pendiente") {
      return "bg-yellow-100 text-yellow-800";
    }

    if (estadoNormalizado === "cancelada" || estadoNormalizado === "cancelado") {
      return "bg-red-100 text-red-800";
    }

    return "bg-slate-100 text-slate-700";
  };

  const obtenerBadgeTipo = (tipo) => {
    const tipoNormalizado = String(tipo || "").toLowerCase();

    if (tipoNormalizado === "contado") {
      return "bg-black text-white";
    }

    if (tipoNormalizado === "financiado") {
      return "bg-red-100 text-red-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  const vehiculosParaFormulario = useMemo(() => {
    if (editandoId) return vehiculos;

    return vehiculos.filter(
      (vehiculo) => vehiculo.estado?.toLowerCase() === "disponible"
    );
  }, [vehiculos, editandoId]);

  const prepararDatos = () => {
    const datos = {
      fecha: form.fecha,
      precio_final: Number(form.precio_final),
      tipo_venta: form.tipo_venta,
      id_usuario: Number(form.id_usuario),
      id_cliente: Number(form.id_cliente),
      id_vehiculo: Number(form.id_vehiculo),
      id_plan_financiamiento:
        form.tipo_venta === "financiado" && form.id_plan_financiamiento
          ? Number(form.id_plan_financiamiento)
          : null,
    };

    if (editandoId) {
      datos.estado = form.estado || "pendiente";
    }

    return datos;
  };

  const guardarVenta = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const datosVenta = prepararDatos();

    if (!obtenerIdValido(datosVenta.id_cliente)) {
      setError("Debe seleccionar un cliente válido");
      toast.error("Debe seleccionar un cliente válido");
      setGuardando(false);
      return;
    }

    if (!obtenerIdValido(datosVenta.id_usuario)) {
      setError("Debe seleccionar un usuario válido");
      toast.error("Debe seleccionar un usuario válido");
      setGuardando(false);
      return;
    }

    if (!obtenerIdValido(datosVenta.id_vehiculo)) {
      setError("Debe seleccionar un vehículo válido");
      toast.error("Debe seleccionar un vehículo válido");
      setGuardando(false);
      return;
    }

    if (!esNumeroMayorQueCero(datosVenta.precio_final)) {
      setError("El precio final debe ser mayor que cero");
      toast.error("El precio final debe ser mayor que cero");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosVenta.tipo_venta)) {
      setError("El tipo de venta es obligatorio");
      toast.error("El tipo de venta es obligatorio");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosVenta.fecha) || !esFechaValida(datosVenta.fecha)) {
      setError("La fecha debe ser válida");
      toast.error("La fecha debe ser válida");
      setGuardando(false);
      return;
    }

    if (datosVenta.tipo_venta === "financiado" && !obtenerIdValido(datosVenta.id_plan_financiamiento)) {
      setError("Seleccione un plan de financiamiento válido");
      toast.error("Seleccione un plan de financiamiento válido");
      setGuardando(false);
      return;
    }

    try {
      if (editandoId) {
        await api.put(`/ventas/${editandoId}`, datosVenta);
        toast.success("Venta actualizada correctamente");
      } else {
        await api.post("/ventas", datosVenta);
        toast.success("Venta registrada correctamente");
      }

      limpiarFormulario();
      await cargarDatos();
    } catch (error) {
      const mensaje = obtenerMensajeError(error, "Error al guardar la venta");

      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const editarVenta = (venta) => {
    const id = venta.id_venta || venta.id;

    setEditandoId(id);
    setMostrarFormulario(true);

    setForm({
      id_cliente: venta.id_cliente || "",
      id_usuario: venta.id_usuario || "",
      id_vehiculo: venta.id_vehiculo || "",
      id_plan_financiamiento: venta.id_plan_financiamiento || "",
      precio_final: venta.precio_final || "",
      tipo_venta: venta.tipo_venta || "contado",
      estado: venta.estado || "pendiente",
      fecha: formatearInputFecha(venta.fecha),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const verDetalle = async (venta) => {
    const id = venta.id_venta || venta.id;
    setCargandoDetalle(true);

    try {
      const respuesta = await api.get(`/ventas/${id}`);
      setVentaDetalle(respuesta.data?.venta || respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Error al cargar el detalle de la venta");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const confirmarEliminarVenta = async () => {
    if (!ventaEliminar) return;

    const id = ventaEliminar.id_venta || ventaEliminar.id;

    try {
      await api.delete(`/ventas/${id}`);
      toast.success("Venta eliminada correctamente");
      setVentaEliminar(null);
      await cargarDatos();
    } catch (error) {
      console.error(error.response?.data || error);

      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Error al eliminar la venta";

      toast.error(mensaje);
    }
  };

  const ventasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return ventas.filter((venta) => {
      const cliente = obtenerNombreCliente(venta).toLowerCase();
      const usuario = obtenerNombreUsuario(venta).toLowerCase();
      const vehiculo = obtenerNombreVehiculo(venta).toLowerCase();
      const tipo = String(venta.tipo_venta || "").toLowerCase();
      const estado = String(venta.estado || "").toLowerCase();
      const id = String(venta.id_venta || venta.id || "");

      const coincideBusqueda =
        !texto ||
        cliente.includes(texto) ||
        usuario.includes(texto) ||
        vehiculo.includes(texto) ||
        tipo.includes(texto) ||
        estado.includes(texto) ||
        id.includes(texto);

      const coincideTipo = filtroTipo === "todos" || tipo === filtroTipo;
      const coincideEstado = filtroEstado === "todos" || estado === filtroEstado;

      return coincideBusqueda && coincideTipo && coincideEstado;
    });
  }, [ventas, busqueda, filtroTipo, filtroEstado]);

  const resumen = useMemo(() => {
    const contado = ventas.filter(
      (venta) => venta.tipo_venta?.toLowerCase() === "contado"
    ).length;

    const financiado = ventas.filter(
      (venta) => venta.tipo_venta?.toLowerCase() === "financiado"
    ).length;

    const ingresos = ventas.reduce((total, venta) => {
      return total + Number(venta.precio_final || 0);
    }, 0);

    const pendientes = ventas.filter(
      (venta) => venta.estado?.toLowerCase() === "pendiente"
    ).length;

    return {
      total: ventas.length,
      contado,
      financiado,
      ingresos,
      pendientes,
    };
  }, [ventas]);

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

            <h2 className="text-3xl font-black">Gestión de Ventas</h2>

            <p className="mt-2 max-w-2xl text-slate-300">
              Registra, consulta y administra las ventas de vehículos de CC Motors.
              Al crear una venta, el backend actualiza el vehículo como vendido.
            </p>
          </div>

          <button
            onClick={abrirNueva}
            className="rounded-2xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700"
          >
            + Nueva venta
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">Total</p>
          <p className="mt-2 text-4xl font-black text-black">{resumen.total}</p>
          <p className="mt-2 text-sm text-slate-500">Ventas registradas</p>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-red-700">Ingresos</p>
          <p className="mt-2 text-3xl font-black text-red-700">
            {formatoMoneda(resumen.ingresos)}
          </p>
          <p className="mt-2 text-sm text-red-700">Total vendido</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">Contado</p>
          <p className="mt-2 text-4xl font-black text-black">{resumen.contado}</p>
          <p className="mt-2 text-sm text-slate-500">Ventas directas</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">
            Financiadas
          </p>
          <p className="mt-2 text-4xl font-black text-black">
            {resumen.financiado}
          </p>
          <p className="mt-2 text-sm text-slate-500">Con plan asociado</p>
        </div>

        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-yellow-700">
            Pendientes
          </p>
          <p className="mt-2 text-4xl font-black text-yellow-700">
            {resumen.pendientes}
          </p>
          <p className="mt-2 text-sm text-yellow-700">Por completar</p>
        </div>
      </section>

      {mostrarFormulario && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                {editandoId ? "Actualizar venta" : "Nueva venta"}
              </p>

              <h2 className="text-2xl font-black text-black">
                {editandoId ? "Editar venta" : "Registrar venta"}
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

          <form onSubmit={guardarVenta} className="grid gap-4 md:grid-cols-2">
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
                Usuario / Vendedor
              </label>
              <select
                name="id_usuario"
                value={form.id_usuario}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              >
                <option value="">Selecciona un usuario</option>

                {usuarios.map((usuario) => (
                  <option
                    key={usuario.id_usuario || usuario.id}
                    value={usuario.id_usuario || usuario.id}
                  >
                    {usuario.nombre} {usuario.apellido} · {usuario.rol || "usuario"}
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

                {vehiculosParaFormulario.map((vehiculo) => (
                  <option
                    key={vehiculo.id_vehiculo || vehiculo.id}
                    value={vehiculo.id_vehiculo || vehiculo.id}
                  >
                    {vehiculo.nombre_marca || vehiculo.marca || "Vehículo"}{" "}
                    {vehiculo.nombre_modelo || vehiculo.modelo || ""} ·{" "}
                    {vehiculo.placa} · {vehiculo.estado} ·{" "}
                    {formatoMoneda(vehiculo.precio_venta)}
                  </option>
                ))}
              </select>

              {!editandoId && (
                <p className="mt-2 text-xs text-slate-500">
                  Solo se muestran vehículos disponibles para ventas nuevas.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Precio final
              </label>
              <input
                type="number"
                name="precio_final"
                placeholder="15000"
                value={form.precio_final}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

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
                Tipo de venta
              </label>
              <select
                name="tipo_venta"
                value={form.tipo_venta}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              >
                <option value="contado">Contado</option>
                <option value="financiado">Financiado</option>
              </select>
            </div>

            {form.tipo_venta === "financiado" && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Plan de financiamiento
                </label>
                <select
                  name="id_plan_financiamiento"
                  value={form.id_plan_financiamiento}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                  required
                >
                  <option value="">Selecciona un plan</option>

                  {planes.map((plan) => (
                    <option
                      key={plan.id_plan_financiamiento || plan.id}
                      value={plan.id_plan_financiamiento || plan.id}
                    >
                      {plan.nombre} · {plan.numero_cuotas} cuotas ·{" "}
                      {plan.tasa_interes}% interés
                    </option>
                  ))}
                </select>
              </div>
            )}

            {editandoId && (
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
                  El backend no valida estados fijos para ventas.
                </p>
              </div>
            )}

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
                    ? "Actualizar venta"
                    : "Guardar venta"}
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
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_220px_220px]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Buscar venta
            </label>
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por cliente, vendedor, vehículo, tipo, estado o ID..."
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Tipo
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
            >
              <option value="todos">Todos</option>
              <option value="contado">Contado</option>
              <option value="financiado">Financiado</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[1200px] w-full border-collapse">
            <thead className="bg-black text-white">
              <tr className="text-left text-sm">
                <th className="p-4">ID</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Vendedor</th>
                <th className="p-4">Vehículo</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Precio final</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {ventasFiltradas.length > 0 ? (
                ventasFiltradas.map((venta) => {
                  const id = venta.id_venta || venta.id;

                  return (
                    <tr
                      key={id}
                      className="border-b text-sm transition hover:bg-slate-50"
                    >
                      <td className="p-4 font-bold text-slate-700">#{id}</td>

                      <td className="p-4 font-bold text-black">
                        {obtenerNombreCliente(venta)}
                      </td>

                      <td className="p-4 text-slate-600">
                        {obtenerNombreUsuario(venta)}
                      </td>

                      <td className="p-4 text-slate-600">
                        {obtenerNombreVehiculo(venta)}
                      </td>

                      <td className="p-4 text-slate-600">
                        {formatearFecha(venta.fecha)}
                      </td>

                      <td className="p-4 font-black text-red-600">
                        {formatoMoneda(venta.precio_final)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${obtenerBadgeTipo(
                            venta.tipo_venta
                          )}`}
                        >
                          {venta.tipo_venta || "Sin tipo"}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${obtenerBadgeEstado(
                            venta.estado
                          )}`}
                        >
                          {venta.estado || "Sin estado"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => verDetalle(venta)}
                            disabled={cargandoDetalle}
                            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                          >
                            Ver
                          </button>

                          <button
                            onClick={() => editarVenta(venta)}
                            className="rounded-lg bg-black px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => setVentaEliminar(venta)}
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="p-10 text-center">
                    <div className="mx-auto max-w-md">
                      <p className="text-4xl">💰</p>
                      <h3 className="mt-3 text-xl font-black text-black">
                        No hay ventas para mostrar
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        No se encontraron registros con la búsqueda o filtros actuales.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {ventaDetalle && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                  Detalle de venta
                </p>

                <h2 className="text-2xl font-black text-black">
                  Venta #{ventaDetalle.id_venta || ventaDetalle.id}
                </h2>

                <p className="mt-1 text-slate-500">
                  {obtenerNombreCliente(ventaDetalle)}
                </p>
              </div>

              <button
                onClick={() => setVentaDetalle(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Cliente</p>
                <p className="mt-1 font-bold text-black">
                  {obtenerNombreCliente(ventaDetalle)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Vendedor</p>
                <p className="mt-1 font-bold text-black">
                  {obtenerNombreUsuario(ventaDetalle)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Vehículo</p>
                <p className="mt-1 font-bold text-black">
                  {obtenerNombreVehiculo(ventaDetalle)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Fecha</p>
                <p className="mt-1 font-bold text-black">
                  {formatearFecha(ventaDetalle.fecha)}
                </p>
              </div>

              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-bold uppercase text-red-700">Precio final</p>
                <p className="mt-1 text-xl font-black text-red-700">
                  {formatoMoneda(ventaDetalle.precio_final)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Tipo</p>
                <p className="mt-1 font-bold text-black">
                  {ventaDetalle.tipo_venta || "Sin tipo"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                <p className="text-xs font-bold uppercase text-slate-500">Estado</p>
                <p className="mt-1 font-bold text-black">
                  {ventaDetalle.estado || "Sin estado"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-800">
              Nota: según el backend actual, al registrar una venta el vehículo
              asociado pasa automáticamente a estado vendido.
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setVentaDetalle(null)}
                className="rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-red-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {ventaEliminar && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 text-5xl">⚠️</div>

            <h2 className="text-2xl font-black text-black">
              ¿Eliminar venta?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Esta acción eliminará la venta #{ventaEliminar.id_venta || ventaEliminar.id}.
              No se puede deshacer.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={confirmarEliminarVenta}
                className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
              >
                Sí, eliminar
              </button>

              <button
                onClick={() => setVentaEliminar(null)}
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