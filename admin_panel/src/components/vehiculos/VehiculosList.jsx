import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { esNumeroMayorQueCero, esNumeroNoNegativo, esTextoValido, obtenerIdValido, obtenerMensajeError, esNumeroValido } from "../../lib/validaciones";

export default function VehiculosList() {
  const [vehiculos, setVehiculos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [vehiculoDetalle, setVehiculoDetalle] = useState(null);
  const [vehiculoEliminar, setVehiculoEliminar] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroMarca, setFiltroMarca] = useState("todos");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    placa: "",
    color: "",
    ano: "",
    kilometraje: "",
    estado: "disponible",
    precio_compra: "",
    precio_venta: "",
    id_marca: "",
    id_modelo: "",
    id_proveedor: "",
  });

  const obtenerArray = (respuesta) => {
    if (Array.isArray(respuesta.data)) return respuesta.data;
    if (Array.isArray(respuesta.data?.vehiculos)) return respuesta.data.vehiculos;
    if (Array.isArray(respuesta.data?.marcas)) return respuesta.data.marcas;
    if (Array.isArray(respuesta.data?.modelos)) return respuesta.data.modelos;
    if (Array.isArray(respuesta.data?.proveedores)) return respuesta.data.proveedores;
    return [];
  };

  const cargarDatos = async () => {
    setCargando(true);
    setError("");

    try {
      const [vehiculosRes, marcasRes, modelosRes, proveedoresRes] =
        await Promise.all([
          api.get("/vehiculos"),
          api.get("/marcas"),
          api.get("/modelos"),
          api.get("/proveedores"),
        ]);

      setVehiculos(obtenerArray(vehiculosRes));
      setMarcas(obtenerArray(marcasRes));
      setModelos(obtenerArray(modelosRes));
      setProveedores(obtenerArray(proveedoresRes));
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al cargar los vehículos.");
      toast.error("Error al cargar vehículos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const limpiarFormulario = () => {
    setForm({
      placa: "",
      color: "",
      ano: "",
      kilometraje: "",
      estado: "disponible",
      precio_compra: "",
      precio_venta: "",
      id_marca: "",
      id_modelo: "",
      id_proveedor: "",
    });

    setEditandoId(null);
    setMostrarFormulario(false);
    setError("");
  };

  const abrirNuevo = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "id_marca") {
      setForm({
        ...form,
        id_marca: value,
        id_modelo: "",
      });

      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  const prepararDatos = () => {
    return {
      placa: form.placa.trim().toUpperCase(),
      color: form.color.trim(),
      ano: Number(form.ano),
      kilometraje: Number(form.kilometraje),
      estado: form.estado,
      precio_compra: Number(form.precio_compra),
      precio_venta: Number(form.precio_venta),
      id_marca: Number(form.id_marca),
      id_modelo: Number(form.id_modelo),
      id_proveedor: Number(form.id_proveedor),
    };
  };

  const formatoMoneda = (valor) => {
    return `$${Number(valor || 0).toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatoKilometraje = (valor) => {
    return `${Number(valor || 0).toLocaleString("es-VE")} km`;
  };

  const obtenerNombreMarca = (vehiculo) => {
    return vehiculo.nombre_marca || vehiculo.marca || "Sin marca";
  };

  const obtenerNombreModelo = (vehiculo) => {
    return vehiculo.nombre_modelo || vehiculo.modelo || "Sin modelo";
  };

  const obtenerNombreProveedor = (vehiculo) => {
    return vehiculo.nombre_proveedor || vehiculo.proveedor || "Sin proveedor";
  };

  const obtenerBadgeEstado = (estado) => {
    const estadoNormalizado = String(estado || "").toLowerCase();

    if (estadoNormalizado === "disponible") {
      return "bg-green-100 text-green-800";
    }

    if (estadoNormalizado === "vendido") {
      return "bg-red-100 text-red-800";
    }

    if (estadoNormalizado === "mantenimiento") {
      return "bg-yellow-100 text-yellow-800";
    }

    return "bg-slate-100 text-slate-700";
  };

  const modelosFiltrados = useMemo(() => {
    if (!form.id_marca) return modelos;

    return modelos.filter((modelo) => {
      return String(modelo.id_marca) === String(form.id_marca);
    });
  }, [modelos, form.id_marca]);

  const vehiculosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return vehiculos.filter((vehiculo) => {
      const placa = String(vehiculo.placa || "").toLowerCase();
      const color = String(vehiculo.color || "").toLowerCase();
      const marca = obtenerNombreMarca(vehiculo).toLowerCase();
      const modelo = obtenerNombreModelo(vehiculo).toLowerCase();
      const proveedor = obtenerNombreProveedor(vehiculo).toLowerCase();
      const estado = String(vehiculo.estado || "").toLowerCase();
      const ano = String(vehiculo.ano || vehiculo.anio || "");

      const coincideBusqueda =
        !texto ||
        placa.includes(texto) ||
        color.includes(texto) ||
        marca.includes(texto) ||
        modelo.includes(texto) ||
        proveedor.includes(texto) ||
        estado.includes(texto) ||
        ano.includes(texto);

      const coincideEstado =
        filtroEstado === "todos" || estado === filtroEstado;

      const coincideMarca =
        filtroMarca === "todos" || String(vehiculo.id_marca) === String(filtroMarca);

      return coincideBusqueda && coincideEstado && coincideMarca;
    });
  }, [vehiculos, busqueda, filtroEstado, filtroMarca]);

  const resumen = useMemo(() => {
    const disponibles = vehiculos.filter(
      (vehiculo) => vehiculo.estado?.toLowerCase() === "disponible"
    ).length;

    const vendidos = vehiculos.filter(
      (vehiculo) => vehiculo.estado?.toLowerCase() === "vendido"
    ).length;

    const mantenimiento = vehiculos.filter(
      (vehiculo) => vehiculo.estado?.toLowerCase() === "mantenimiento"
    ).length;

    const valorInventario = vehiculos
      .filter((vehiculo) => vehiculo.estado?.toLowerCase() === "disponible")
      .reduce((total, vehiculo) => total + Number(vehiculo.precio_venta || 0), 0);

    return {
      total: vehiculos.length,
      disponibles,
      vendidos,
      mantenimiento,
      valorInventario,
    };
  }, [vehiculos]);

  const guardarVehiculo = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const datosVehiculo = prepararDatos();

    if (!esTextoValido(datosVehiculo.placa)) {
      setError("La placa es obligatoria");
      toast.error("La placa es obligatoria");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosVehiculo.color)) {
      setError("El color es obligatorio");
      toast.error("El color es obligatorio");
      setGuardando(false);
      return;
    }

    if (!esNumeroValido(datosVehiculo.ano) || Number(datosVehiculo.ano) < 1900) {
      setError("El año debe ser válido");
      toast.error("El año debe ser válido");
      setGuardando(false);
      return;
    }

    if (!esNumeroNoNegativo(datosVehiculo.kilometraje)) {
      setError("El kilometraje no puede ser negativo");
      toast.error("El kilometraje no puede ser negativo");
      setGuardando(false);
      return;
    }

    if (!esNumeroNoNegativo(datosVehiculo.precio_compra)) {
      setError("El precio de compra no puede ser negativo");
      toast.error("El precio de compra no puede ser negativo");
      setGuardando(false);
      return;
    }

    if (!esNumeroMayorQueCero(datosVehiculo.precio_venta)) {
      setError("El precio de venta debe ser mayor que cero");
      toast.error("El precio de venta debe ser mayor que cero");
      setGuardando(false);
      return;
    }

    if (!obtenerIdValido(datosVehiculo.id_modelo)) {
      setError("Debe seleccionar un modelo válido");
      toast.error("Debe seleccionar un modelo válido");
      setGuardando(false);
      return;
    }

    if (!obtenerIdValido(datosVehiculo.id_proveedor)) {
      setError("Debe seleccionar un proveedor válido");
      toast.error("Debe seleccionar un proveedor válido");
      setGuardando(false);
      return;
    }

    const estadosValidos = ["disponible", "vendido", "mantenimiento"];
    if (!estadosValidos.includes(String(datosVehiculo.estado).toLowerCase())) {
      setError("El estado no es válido");
      toast.error("El estado no es válido");
      setGuardando(false);
      return;
    }

    try {
      if (editandoId) {
        await api.put(`/vehiculos/${editandoId}`, datosVehiculo);
        toast.success("Vehículo actualizado correctamente");
      } else {
        await api.post("/vehiculos", datosVehiculo);
        toast.success("Vehículo registrado correctamente");
      }

      limpiarFormulario();
      await cargarDatos();
    } catch (error) {
      const mensaje = obtenerMensajeError(error, "Error al guardar el vehículo");

      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const editarVehiculo = (vehiculo) => {
    setMostrarFormulario(true);
    setEditandoId(vehiculo.id_vehiculo || vehiculo.id);

    setForm({
      placa: vehiculo.placa || "",
      color: vehiculo.color || "",
      ano: vehiculo.ano || vehiculo.anio || "",
      kilometraje: vehiculo.kilometraje || "",
      estado: vehiculo.estado || "disponible",
      precio_compra: vehiculo.precio_compra || "",
      precio_venta: vehiculo.precio_venta || "",
      id_marca: vehiculo.id_marca || "",
      id_modelo: vehiculo.id_modelo || "",
      id_proveedor: vehiculo.id_proveedor || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const verDetalle = async (vehiculo) => {
    const id = vehiculo.id_vehiculo || vehiculo.id;
    setCargandoDetalle(true);

    try {
      const respuesta = await api.get(`/vehiculos/${id}`);
      setVehiculoDetalle(respuesta.data?.vehiculo || respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Error al cargar el detalle del vehículo");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const confirmarEliminarVehiculo = async () => {
    if (!vehiculoEliminar) return;

    const id = vehiculoEliminar.id_vehiculo || vehiculoEliminar.id;

    try {
      await api.delete(`/vehiculos/${id}`);
      toast.success("Vehículo eliminado correctamente");
      setVehiculoEliminar(null);
      await cargarDatos();
    } catch (error) {
      console.error(error.response?.data || error);

      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "Error al eliminar el vehículo";

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
              Inventario CC Motors
            </p>

            <h2 className="text-3xl font-black">Gestión de Vehículos</h2>

            <p className="mt-2 max-w-2xl text-slate-300">
              Administra el inventario de unidades disponibles, vendidas y en mantenimiento.
              Estos vehículos alimentan el catálogo público de la website.
            </p>
          </div>

          <button
            onClick={abrirNuevo}
            className="rounded-2xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700"
          >
            + Nuevo vehículo
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">Total</p>
          <p className="mt-2 text-4xl font-black text-black">{resumen.total}</p>
          <p className="mt-2 text-sm text-slate-500">Vehículos registrados</p>
        </div>

        <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-green-700">Disponibles</p>
          <p className="mt-2 text-4xl font-black text-green-700">
            {resumen.disponibles}
          </p>
          <p className="mt-2 text-sm text-green-700">Listos para vender</p>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-red-700">Vendidos</p>
          <p className="mt-2 text-4xl font-black text-red-700">
            {resumen.vendidos}
          </p>
          <p className="mt-2 text-sm text-red-700">Unidades cerradas</p>
        </div>

        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-yellow-700">
            Inventario disponible
          </p>
          <p className="mt-2 text-3xl font-black text-yellow-700">
            {formatoMoneda(resumen.valorInventario)}
          </p>
          <p className="mt-2 text-sm text-yellow-700">Valor de venta estimado</p>
        </div>
      </section>

      {mostrarFormulario && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                {editandoId ? "Actualizar unidad" : "Nueva unidad"}
              </p>

              <h2 className="text-2xl font-black text-black">
                {editandoId ? "Editar vehículo" : "Registrar vehículo"}
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

          <form onSubmit={guardarVehiculo} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Placa
              </label>
              <input
                name="placa"
                placeholder="ABC123"
                value={form.placa}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 uppercase outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Color
              </label>
              <input
                name="color"
                placeholder="Negro"
                value={form.color}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Año
              </label>
              <input
                type="number"
                name="ano"
                placeholder="2024"
                value={form.ano}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Kilometraje
              </label>
              <input
                type="number"
                name="kilometraje"
                placeholder="1000"
                value={form.kilometraje}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Estado
              </label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              >
                <option value="disponible">Disponible</option>
                <option value="vendido">Vendido</option>
                <option value="mantenimiento">Mantenimiento</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Precio de compra
              </label>
              <input
                type="number"
                name="precio_compra"
                placeholder="10000"
                value={form.precio_compra}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Precio de venta
              </label>
              <input
                type="number"
                name="precio_venta"
                placeholder="15000"
                value={form.precio_venta}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Marca
              </label>
              <select
                name="id_marca"
                value={form.id_marca}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              >
                <option value="">Selecciona una marca</option>

                {marcas.map((marca) => (
                  <option key={marca.id_marca || marca.id} value={marca.id_marca || marca.id}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Modelo
              </label>
              <select
                name="id_modelo"
                value={form.id_modelo}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              >
                <option value="">Selecciona un modelo</option>

                {modelosFiltrados.map((modelo) => (
                  <option
                    key={modelo.id_modelo || modelo.id}
                    value={modelo.id_modelo || modelo.id}
                  >
                    {modelo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Proveedor
              </label>
              <select
                name="id_proveedor"
                value={form.id_proveedor}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              >
                <option value="">Selecciona un proveedor</option>

                {proveedores.map((proveedor) => (
                  <option
                    key={proveedor.id_proveedor || proveedor.id}
                    value={proveedor.id_proveedor || proveedor.id}
                  >
                    {proveedor.nombre}
                  </option>
                ))}
              </select>
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
                    ? "Actualizar vehículo"
                    : "Guardar vehículo"}
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
              Buscar vehículo
            </label>
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por placa, marca, modelo, color, año o proveedor..."
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
              <option value="disponible">Disponibles</option>
              <option value="vendido">Vendidos</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Filtrar marca
            </label>
            <select
              value={filtroMarca}
              onChange={(e) => setFiltroMarca(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
            >
              <option value="todos">Todas</option>

              {marcas.map((marca) => (
                <option key={marca.id_marca || marca.id} value={marca.id_marca || marca.id}>
                  {marca.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[1200px] w-full border-collapse">
            <thead className="bg-black text-white">
              <tr className="text-left text-sm">
                <th className="p-4">Placa</th>
                <th className="p-4">Vehículo</th>
                <th className="p-4">Color</th>
                <th className="p-4">Año</th>
                <th className="p-4">Kilometraje</th>
                <th className="p-4">Precio venta</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {vehiculosFiltrados.length > 0 ? (
                vehiculosFiltrados.map((vehiculo) => (
                  <tr
                    key={vehiculo.id_vehiculo || vehiculo.id}
                    className="border-b text-sm transition hover:bg-slate-50"
                  >
                    <td className="p-4 font-black text-black">
                      {vehiculo.placa}
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-black">
                        {obtenerNombreMarca(vehiculo)} {obtenerNombreModelo(vehiculo)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {obtenerNombreProveedor(vehiculo)}
                      </p>
                    </td>

                    <td className="p-4 text-slate-600">{vehiculo.color}</td>

                    <td className="p-4 text-slate-600">
                      {vehiculo.ano || vehiculo.anio}
                    </td>

                    <td className="p-4 text-slate-600">
                      {formatoKilometraje(vehiculo.kilometraje)}
                    </td>

                    <td className="p-4 font-bold text-red-600">
                      {formatoMoneda(vehiculo.precio_venta)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${obtenerBadgeEstado(
                          vehiculo.estado
                        )}`}
                      >
                        {vehiculo.estado || "Sin estado"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => verDetalle(vehiculo)}
                          disabled={cargandoDetalle}
                          className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                        >
                          Ver
                        </button>

                        <button
                          onClick={() => editarVehiculo(vehiculo)}
                          className="rounded-lg bg-black px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => setVehiculoEliminar(vehiculo)}
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
                      <p className="text-4xl">🚗</p>
                      <h3 className="mt-3 text-xl font-black text-black">
                        No hay vehículos para mostrar
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

      {vehiculoDetalle && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                  Detalle de vehículo
                </p>
                <h2 className="text-2xl font-black text-black">
                  {obtenerNombreMarca(vehiculoDetalle)} {obtenerNombreModelo(vehiculoDetalle)}
                </h2>
                <p className="mt-1 text-slate-500">
                  Placa {vehiculoDetalle.placa}
                </p>
              </div>

              <button
                onClick={() => setVehiculoDetalle(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Marca</p>
                <p className="mt-1 font-bold text-black">
                  {obtenerNombreMarca(vehiculoDetalle)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Modelo</p>
                <p className="mt-1 font-bold text-black">
                  {obtenerNombreModelo(vehiculoDetalle)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Color</p>
                <p className="mt-1 font-bold text-black">
                  {vehiculoDetalle.color || "Sin color"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Año</p>
                <p className="mt-1 font-bold text-black">
                  {vehiculoDetalle.ano || vehiculoDetalle.anio || "Sin año"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Kilometraje
                </p>
                <p className="mt-1 font-bold text-black">
                  {formatoKilometraje(vehiculoDetalle.kilometraje)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Estado</p>
                <p className="mt-1 font-bold text-black">
                  {vehiculoDetalle.estado || "Sin estado"}
                </p>
              </div>

              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-bold uppercase text-red-700">
                  Precio venta
                </p>
                <p className="mt-1 text-xl font-black text-red-700">
                  {formatoMoneda(vehiculoDetalle.precio_venta)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Precio compra
                </p>
                <p className="mt-1 font-bold text-black">
                  {formatoMoneda(vehiculoDetalle.precio_compra)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Proveedor
                </p>
                <p className="mt-1 font-bold text-black">
                  {obtenerNombreProveedor(vehiculoDetalle)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setVehiculoDetalle(null)}
                className="rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-red-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {vehiculoEliminar && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 text-5xl">⚠️</div>

            <h2 className="text-2xl font-black text-black">
              ¿Eliminar vehículo?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Esta acción eliminará el vehículo con placa{" "}
              <strong>{vehiculoEliminar.placa}</strong>. No se puede deshacer.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={confirmarEliminarVehiculo}
                className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
              >
                Sí, eliminar
              </button>

              <button
                onClick={() => setVehiculoEliminar(null)}
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