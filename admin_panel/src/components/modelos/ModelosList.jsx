import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { esNumeroValido, esTextoValido, obtenerIdValido, obtenerMensajeError } from "../../lib/validaciones";

export default function ModelosList() {
  const [modelos, setModelos] = useState([]);
  const [marcas, setMarcas] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [modeloDetalle, setModeloDetalle] = useState(null);
  const [modeloEliminar, setModeloEliminar] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroMarca, setFiltroMarca] = useState("todos");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    id_marca: "",
    descripcion: "",
    ano_lanzamiento: "",
    tipo_combustible: "",
    transmision: "",
    estado: "activo",
  });

  const obtenerArray = (respuesta) => {
    if (Array.isArray(respuesta.data)) return respuesta.data;
    if (Array.isArray(respuesta.data?.modelos)) return respuesta.data.modelos;
    if (Array.isArray(respuesta.data?.marcas)) return respuesta.data.marcas;
    return [];
  };

  const cargarDatos = async () => {
    setCargando(true);
    setError("");

    try {
      const [modelosRes, marcasRes] = await Promise.all([
        api.get("/modelos"),
        api.get("/marcas"),
      ]);

      setModelos(obtenerArray(modelosRes));
      setMarcas(obtenerArray(marcasRes));
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al cargar los modelos.");
      toast.error("Error al cargar modelos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      id_marca: "",
      descripcion: "",
      ano_lanzamiento: "",
      tipo_combustible: "",
      transmision: "",
      estado: "activo",
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
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const obtenerIdModelo = (modelo) => {
    return modelo.id_modelo || modelo.id;
  };

  const obtenerIdMarca = (marca) => {
    return marca.id_marca || marca.id;
  };

  const obtenerNombreMarca = (modelo) => {
    if (modelo.marca) return modelo.marca;
    if (modelo.nombre_marca) return modelo.nombre_marca;

    const marcaEncontrada = marcas.find(
      (marca) => String(obtenerIdMarca(marca)) === String(modelo.id_marca)
    );

    return marcaEncontrada?.nombre || "Sin marca";
  };

  const prepararDatos = () => {
    return {
      nombre: form.nombre.trim(),
      id_marca: Number(form.id_marca),
      descripcion: form.descripcion.trim(),
      ano_lanzamiento: Number(form.ano_lanzamiento),
      tipo_combustible: form.tipo_combustible.trim(),
      transmision: form.transmision.trim(),
      estado: form.estado || "activo",
    };
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

  const obtenerBadgeEstado = (estado) => {
    const estadoNormalizado = String(estado || "").toLowerCase();

    if (estadoNormalizado === "activo") {
      return "bg-green-100 text-green-800";
    }

    if (estadoNormalizado === "inactivo") {
      return "bg-red-100 text-red-800";
    }

    return "bg-slate-100 text-slate-700";
  };

  const guardarModelo = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const datosModelo = prepararDatos();

    if (!esTextoValido(datosModelo.nombre)) {
      setError("El nombre del modelo es obligatorio");
      toast.error("El nombre del modelo es obligatorio");
      setGuardando(false);
      return;
    }

    if (!obtenerIdValido(datosModelo.id_marca)) {
      setError("Debe seleccionar una marca válida");
      toast.error("Debe seleccionar una marca válida");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosModelo.descripcion)) {
      setError("La descripción es obligatoria");
      toast.error("La descripción es obligatoria");
      setGuardando(false);
      return;
    }

    if (datosModelo.ano_lanzamiento !== "" && (!esNumeroValido(datosModelo.ano_lanzamiento) || Number(datosModelo.ano_lanzamiento) < 1900)) {
      setError("El año de lanzamiento debe ser válido");
      toast.error("El año de lanzamiento debe ser válido");
      setGuardando(false);
      return;
    }

    const combustiblesValidos = ["gasolina", "diesel", "electrico", "hibrido", "gas"];
    if (!combustiblesValidos.includes(String(datosModelo.tipo_combustible).toLowerCase())) {
      setError("Seleccione un tipo de combustible válido");
      toast.error("Seleccione un tipo de combustible válido");
      setGuardando(false);
      return;
    }

    const transmisionesValidas = ["manual", "automatico", "cvt"];
    if (!transmisionesValidas.includes(String(datosModelo.transmision).toLowerCase())) {
      setError("Seleccione una transmisión válida");
      toast.error("Seleccione una transmisión válida");
      setGuardando(false);
      return;
    }

    try {
      if (editandoId) {
        await api.put(`/modelos/${editandoId}`, datosModelo);
        toast.success("Modelo actualizado correctamente");
      } else {
        await api.post("/modelos", datosModelo);
        toast.success("Modelo registrado correctamente");
      }

      limpiarFormulario();
      await cargarDatos();
    } catch (error) {
      const mensaje = obtenerMensajeError(error, "Error al guardar el modelo");

      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const editarModelo = (modelo) => {
    const id = obtenerIdModelo(modelo);

    setEditandoId(id);
    setMostrarFormulario(true);

    setForm({
      nombre: modelo.nombre || "",
      id_marca: modelo.id_marca || "",
      descripcion: modelo.descripcion || "",
      ano_lanzamiento: modelo.ano_lanzamiento || "",
      tipo_combustible: modelo.tipo_combustible || "",
      transmision: modelo.transmision || "",
      estado: modelo.estado || "activo",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const verDetalle = async (modelo) => {
    const id = obtenerIdModelo(modelo);
    setCargandoDetalle(true);

    try {
      const respuesta = await api.get(`/modelos/${id}`);
      setModeloDetalle(respuesta.data?.modelo || respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Error al cargar el detalle del modelo");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const confirmarEliminarModelo = async () => {
    if (!modeloEliminar) return;

    const id = obtenerIdModelo(modeloEliminar);

    try {
      await api.delete(`/modelos/${id}`);
      toast.success("Modelo eliminado correctamente");
      setModeloEliminar(null);
      await cargarDatos();
    } catch (error) {
      console.error(error.response?.data || error);

      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Error al eliminar el modelo";

      toast.error(mensaje);
    }
  };

  const modelosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return modelos.filter((modelo) => {
      const id = String(obtenerIdModelo(modelo) || "");
      const nombre = String(modelo.nombre || "").toLowerCase();
      const marca = obtenerNombreMarca(modelo).toLowerCase();
      const descripcion = String(modelo.descripcion || "").toLowerCase();
      const combustible = String(modelo.tipo_combustible || "").toLowerCase();
      const transmision = String(modelo.transmision || "").toLowerCase();
      const ano = String(modelo.ano_lanzamiento || "");
      const estado = String(modelo.estado || "").toLowerCase();

      const coincideBusqueda =
        !texto ||
        id.includes(texto) ||
        nombre.includes(texto) ||
        marca.includes(texto) ||
        descripcion.includes(texto) ||
        combustible.includes(texto) ||
        transmision.includes(texto) ||
        ano.includes(texto) ||
        estado.includes(texto);

      const coincideEstado = filtroEstado === "todos" || estado === filtroEstado;

      const coincideMarca =
        filtroMarca === "todos" || String(modelo.id_marca) === String(filtroMarca);

      return coincideBusqueda && coincideEstado && coincideMarca;
    });
  }, [modelos, marcas, busqueda, filtroEstado, filtroMarca]);

  const resumen = useMemo(() => {
    const activos = modelos.filter(
      (modelo) => modelo.estado?.toLowerCase() === "activo"
    ).length;

    const inactivos = modelos.filter(
      (modelo) => modelo.estado?.toLowerCase() === "inactivo"
    ).length;

    const marcasUsadas = new Set(
      modelos.map((modelo) => modelo.id_marca).filter(Boolean)
    ).size;

    const combustibles = new Set(
      modelos.map((modelo) => modelo.tipo_combustible).filter(Boolean)
    ).size;

    return {
      total: modelos.length,
      activos,
      inactivos,
      marcasUsadas,
      combustibles,
    };
  }, [modelos]);

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
              Catálogo CC Motors
            </p>

            <h2 className="text-3xl font-black">Gestión de Modelos</h2>

            <p className="mt-2 max-w-2xl text-slate-300">
              Administra los modelos asociados a marcas. Estos modelos se usan
              directamente al registrar vehículos en el inventario.
            </p>
          </div>

          <button
            onClick={abrirNuevo}
            className="rounded-2xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700"
          >
            + Nuevo modelo
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">Total</p>
          <p className="mt-2 text-4xl font-black text-black">{resumen.total}</p>
          <p className="mt-2 text-sm text-slate-500">Modelos registrados</p>
        </div>

        <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-green-700">Activos</p>
          <p className="mt-2 text-4xl font-black text-green-700">
            {resumen.activos}
          </p>
          <p className="mt-2 text-sm text-green-700">Disponibles para vehículos</p>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-red-700">Inactivos</p>
          <p className="mt-2 text-4xl font-black text-red-700">
            {resumen.inactivos}
          </p>
          <p className="mt-2 text-sm text-red-700">Fuera de catálogo</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">
            Marcas usadas
          </p>
          <p className="mt-2 text-4xl font-black text-black">
            {resumen.marcasUsadas}
          </p>
          <p className="mt-2 text-sm text-slate-500">Con modelos asociados</p>
        </div>

        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-yellow-700">
            Combustibles
          </p>
          <p className="mt-2 text-4xl font-black text-yellow-700">
            {resumen.combustibles}
          </p>
          <p className="mt-2 text-sm text-yellow-700">Tipos registrados</p>
        </div>
      </section>

      {mostrarFormulario && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                {editandoId ? "Actualizar modelo" : "Nuevo modelo"}
              </p>

              <h2 className="text-2xl font-black text-black">
                {editandoId ? "Editar modelo" : "Registrar modelo"}
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

          <form onSubmit={guardarModelo} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nombre del modelo
              </label>

              <input
                name="nombre"
                placeholder="Corolla"
                value={form.nombre}
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
                  <option key={obtenerIdMarca(marca)} value={obtenerIdMarca(marca)}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Año de lanzamiento
              </label>

              <input
                type="number"
                name="ano_lanzamiento"
                placeholder="2024"
                value={form.ano_lanzamiento}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Tipo de combustible
              </label>

              <input
                name="tipo_combustible"
                placeholder="Gasolina, Diésel, Híbrido, Eléctrico"
                value={form.tipo_combustible}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Transmisión
              </label>

              <input
                name="transmision"
                placeholder="Automática o manual"
                value={form.transmision}
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
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Descripción
              </label>

              <textarea
                name="descripcion"
                placeholder="Descripción breve del modelo"
                value={form.descripcion}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-red-600"
                required
              />
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
                    ? "Actualizar modelo"
                    : "Guardar modelo"}
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
              Buscar modelo
            </label>

            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por modelo, marca, combustible, transmisión, año, estado o ID..."
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
            />
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
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Marca
            </label>

            <select
              value={filtroMarca}
              onChange={(e) => setFiltroMarca(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
            >
              <option value="todos">Todas</option>

              {marcas.map((marca) => (
                <option key={obtenerIdMarca(marca)} value={obtenerIdMarca(marca)}>
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
                <th className="p-4">ID</th>
                <th className="p-4">Modelo</th>
                <th className="p-4">Marca</th>
                <th className="p-4">Año</th>
                <th className="p-4">Combustible</th>
                <th className="p-4">Transmisión</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {modelosFiltrados.length > 0 ? (
                modelosFiltrados.map((modelo) => {
                  const id = obtenerIdModelo(modelo);

                  return (
                    <tr
                      key={id}
                      className="border-b text-sm transition hover:bg-slate-50"
                    >
                      <td className="p-4 font-bold text-slate-700">#{id}</td>

                      <td className="p-4">
                        <p className="font-black text-black">{modelo.nombre}</p>
                        <p className="max-w-xs truncate text-xs text-slate-500">
                          {modelo.descripcion || "Sin descripción"}
                        </p>
                      </td>

                      <td className="p-4 font-bold text-slate-700">
                        {obtenerNombreMarca(modelo)}
                      </td>

                      <td className="p-4 text-slate-600">
                        {modelo.ano_lanzamiento || "Sin año"}
                      </td>

                      <td className="p-4 text-slate-600">
                        {modelo.tipo_combustible || "Sin combustible"}
                      </td>

                      <td className="p-4 text-slate-600">
                        {modelo.transmision || "Sin transmisión"}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${obtenerBadgeEstado(
                            modelo.estado
                          )}`}
                        >
                          {modelo.estado || "Sin estado"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => verDetalle(modelo)}
                            disabled={cargandoDetalle}
                            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                          >
                            Ver
                          </button>

                          <button
                            onClick={() => editarModelo(modelo)}
                            className="rounded-lg bg-black px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => setModeloEliminar(modelo)}
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
                  <td colSpan="8" className="p-10 text-center">
                    <div className="mx-auto max-w-md">
                      <p className="text-4xl">🚘</p>

                      <h3 className="mt-3 text-xl font-black text-black">
                        No hay modelos para mostrar
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        No se encontraron modelos con la búsqueda o filtros actuales.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modeloDetalle && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                  Detalle de modelo
                </p>

                <h2 className="text-2xl font-black text-black">
                  {modeloDetalle.nombre || "Modelo"}
                </h2>

                <p className="mt-1 text-slate-500">
                  {obtenerNombreMarca(modeloDetalle)}
                </p>
              </div>

              <button
                onClick={() => setModeloDetalle(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">ID</p>
                <p className="mt-1 font-bold text-black">
                  #{obtenerIdModelo(modeloDetalle)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Marca</p>
                <p className="mt-1 font-bold text-black">
                  {obtenerNombreMarca(modeloDetalle)}
                </p>
              </div>

              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-bold uppercase text-red-700">Modelo</p>
                <p className="mt-1 text-xl font-black text-red-700">
                  {modeloDetalle.nombre || "Sin nombre"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Año lanzamiento
                </p>
                <p className="mt-1 font-bold text-black">
                  {modeloDetalle.ano_lanzamiento || "Sin año"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Tipo de combustible
                </p>
                <p className="mt-1 font-bold text-black">
                  {modeloDetalle.tipo_combustible || "Sin combustible"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Transmisión
                </p>
                <p className="mt-1 font-bold text-black">
                  {modeloDetalle.transmision || "Sin transmisión"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                <p className="text-xs font-bold uppercase text-slate-500">Estado</p>
                <p className="mt-1 font-bold text-black">
                  {modeloDetalle.estado || "Sin estado"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Descripción
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {modeloDetalle.descripcion || "Sin descripción"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Fecha creación
                </p>
                <p className="mt-1 font-bold text-black">
                  {formatearFecha(modeloDetalle.fecha_creacion)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-800">
              Este modelo puede ser utilizado para registrar vehículos asociados
              a su marca correspondiente.
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setModeloDetalle(null)}
                className="rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-red-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {modeloEliminar && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 text-5xl">⚠️</div>

            <h2 className="text-2xl font-black text-black">
              ¿Eliminar modelo?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Esta acción eliminará el modelo{" "}
              <strong>{modeloEliminar.nombre}</strong>. No se puede deshacer.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={confirmarEliminarModelo}
                className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
              >
                Sí, eliminar
              </button>

              <button
                onClick={() => setModeloEliminar(null)}
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