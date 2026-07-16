import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { esCorreoValido, esTextoValido, obtenerIdValido, obtenerMensajeError } from "../../lib/validaciones";

export default function UsuariosList() {
  const [usuarios, setUsuarios] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [usuarioDetalle, setUsuarioDetalle] = useState(null);
  const [usuarioEliminar, setUsuarioEliminar] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    contrasena: "",
    id_rol: "",
    estado: "activo",
  });

  const obtenerArray = (respuesta) => {
    if (Array.isArray(respuesta.data)) return respuesta.data;
    if (Array.isArray(respuesta.data?.usuarios)) return respuesta.data.usuarios;
    return [];
  };

  const cargarUsuarios = async () => {
    setCargando(true);
    setError("");

    try {
      const respuesta = await api.get("/usuarios");
      setUsuarios(obtenerArray(respuesta));
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al cargar los usuarios.");
      toast.error("Error al cargar usuarios");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      apellido: "",
      correo: "",
      contrasena: "",
      id_rol: "",
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

  const obtenerIdUsuario = (usuario) => {
    return usuario.id_usuario || usuario.id;
  };

  const obtenerNombreCompleto = (usuario) => {
    return `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim() || "Sin nombre";
  };

  const obtenerRolTexto = (usuario) => {
    if (usuario.rol) return usuario.rol;
    if (usuario.id_rol) return `Rol #${usuario.id_rol}`;
    return "Sin rol";
  };

  const obtenerBadgeEstado = (estado) => {
    const estadoNormalizado = String(estado || "").toLowerCase();

    if (estadoNormalizado === "activo") {
      return "bg-green-100 text-green-800";
    }

    if (estadoNormalizado === "inactivo") {
      return "bg-yellow-100 text-yellow-800";
    }

    if (estadoNormalizado === "bloqueado") {
      return "bg-red-100 text-red-800";
    }

    return "bg-slate-100 text-slate-700";
  };

  const prepararDatos = () => {
    const datosUsuario = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      correo: form.correo.trim(),
      id_rol: Number(form.id_rol),
      estado: form.estado || "activo",
    };

    if (!editandoId) {
      datosUsuario.contrasena = form.contrasena;
    }

    return datosUsuario;
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const datosUsuario = prepararDatos();

    if (!esTextoValido(datosUsuario.nombre)) {
      setError("El nombre es obligatorio");
      toast.error("El nombre es obligatorio");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosUsuario.apellido)) {
      setError("El apellido es obligatorio");
      toast.error("El apellido es obligatorio");
      setGuardando(false);
      return;
    }

    if (!esCorreoValido(datosUsuario.correo)) {
      setError("El correo debe tener formato válido");
      toast.error("El correo debe tener formato válido");
      setGuardando(false);
      return;
    }

    if (!editandoId && !esTextoValido(form.contrasena)) {
      setError("La contraseña es obligatoria al crear un usuario");
      toast.error("La contraseña es obligatoria al crear un usuario");
      setGuardando(false);
      return;
    }

    if (!obtenerIdValido(datosUsuario.id_rol)) {
      setError("Debe seleccionar un rol válido");
      toast.error("Debe seleccionar un rol válido");
      setGuardando(false);
      return;
    }

    const estadosValidos = ["activo", "inactivo", "bloqueado"];
    if (!estadosValidos.includes(String(datosUsuario.estado).toLowerCase())) {
      setError("El estado del usuario no es válido");
      toast.error("El estado del usuario no es válido");
      setGuardando(false);
      return;
    }

    try {
      if (editandoId) {
        await api.put(`/usuarios/${editandoId}`, datosUsuario);
        toast.success("Usuario actualizado correctamente");
      } else {
        await api.post("/usuarios", datosUsuario);
        toast.success("Usuario registrado correctamente");
      }

      limpiarFormulario();
      await cargarUsuarios();
    } catch (error) {
      const mensaje = obtenerMensajeError(error, "Error al guardar el usuario");

      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const editarUsuario = (usuario) => {
    const id = obtenerIdUsuario(usuario);

    setEditandoId(id);
    setMostrarFormulario(true);

    setForm({
      nombre: usuario.nombre || "",
      apellido: usuario.apellido || "",
      correo: usuario.correo || "",
      contrasena: "",
      id_rol: usuario.id_rol || "",
      estado: usuario.estado || "activo",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const verDetalle = async (usuario) => {
    const id = obtenerIdUsuario(usuario);
    setCargandoDetalle(true);

    try {
      const respuesta = await api.get(`/usuarios/${id}`);
      setUsuarioDetalle(respuesta.data?.usuario || respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Error al cargar el detalle del usuario");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const confirmarEliminarUsuario = async () => {
    if (!usuarioEliminar) return;

    const id = obtenerIdUsuario(usuarioEliminar);

    try {
      await api.delete(`/usuarios/${id}`);
      toast.success("Usuario eliminado correctamente");
      setUsuarioEliminar(null);
      await cargarUsuarios();
    } catch (error) {
      console.error(error.response?.data || error);

      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Error al eliminar el usuario";

      toast.error(mensaje);
    }
  };

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return usuarios.filter((usuario) => {
      const id = String(obtenerIdUsuario(usuario) || "");
      const nombre = obtenerNombreCompleto(usuario).toLowerCase();
      const correo = String(usuario.correo || "").toLowerCase();
      const rol = obtenerRolTexto(usuario).toLowerCase();
      const estado = String(usuario.estado || "").toLowerCase();
      const idRol = String(usuario.id_rol || "");

      const coincideBusqueda =
        !texto ||
        id.includes(texto) ||
        nombre.includes(texto) ||
        correo.includes(texto) ||
        rol.includes(texto) ||
        estado.includes(texto) ||
        idRol.includes(texto);

      const coincideEstado = filtroEstado === "todos" || estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [usuarios, busqueda, filtroEstado]);

  const resumen = useMemo(() => {
    const activos = usuarios.filter(
      (usuario) => usuario.estado?.toLowerCase() === "activo"
    ).length;

    const inactivos = usuarios.filter(
      (usuario) => usuario.estado?.toLowerCase() === "inactivo"
    ).length;

    const bloqueados = usuarios.filter(
      (usuario) => usuario.estado?.toLowerCase() === "bloqueado"
    ).length;

    const rolesUnicos = new Set(
      usuarios.map((usuario) => usuario.id_rol || usuario.rol).filter(Boolean)
    ).size;

    return {
      total: usuarios.length,
      activos,
      inactivos,
      bloqueados,
      rolesUnicos,
    };
  }, [usuarios]);

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
              Seguridad del sistema
            </p>

            <h2 className="text-3xl font-black">Gestión de Usuarios</h2>

            <p className="mt-2 max-w-2xl text-slate-300">
              Administra los usuarios internos que acceden al panel administrativo
              de CC Motors, sus roles y estado dentro del sistema.
            </p>
          </div>

          <button
            onClick={abrirNuevo}
            className="rounded-2xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700"
          >
            + Nuevo usuario
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">Total</p>
          <p className="mt-2 text-4xl font-black text-black">{resumen.total}</p>
          <p className="mt-2 text-sm text-slate-500">Usuarios registrados</p>
        </div>

        <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-green-700">Activos</p>
          <p className="mt-2 text-4xl font-black text-green-700">
            {resumen.activos}
          </p>
          <p className="mt-2 text-sm text-green-700">Con acceso activo</p>
        </div>

        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-yellow-700">
            Inactivos
          </p>
          <p className="mt-2 text-4xl font-black text-yellow-700">
            {resumen.inactivos}
          </p>
          <p className="mt-2 text-sm text-yellow-700">Sin actividad</p>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-red-700">
            Bloqueados
          </p>
          <p className="mt-2 text-4xl font-black text-red-700">
            {resumen.bloqueados}
          </p>
          <p className="mt-2 text-sm text-red-700">Acceso restringido</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">Roles</p>
          <p className="mt-2 text-4xl font-black text-black">
            {resumen.rolesUnicos}
          </p>
          <p className="mt-2 text-sm text-slate-500">Tipos de usuarios</p>
        </div>
      </section>

      {mostrarFormulario && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                {editandoId ? "Actualizar usuario" : "Nuevo usuario"}
              </p>

              <h2 className="text-2xl font-black text-black">
                {editandoId ? "Editar usuario" : "Registrar usuario"}
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

          <form onSubmit={guardarUsuario} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nombre
              </label>

              <input
                name="nombre"
                placeholder="Nombre"
                value={form.nombre}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Apellido
              </label>

              <input
                name="apellido"
                placeholder="Apellido"
                value={form.apellido}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Correo
              </label>

              <input
                type="email"
                name="correo"
                placeholder="usuario@correo.com"
                value={form.correo}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            {!editandoId && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Contraseña
                </label>

                <input
                  name="contrasena"
                  type="password"
                  placeholder="Contraseña"
                  value={form.contrasena}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                ID del rol
              </label>

              <input
                type="number"
                name="id_rol"
                placeholder="Ejemplo: 1"
                value={form.id_rol}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
                required
              />

              <p className="mt-2 text-xs text-slate-500">
                El backend no expone un endpoint de roles, por eso se registra el ID.
              </p>
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
                <option value="bloqueado">Bloqueado</option>
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
                    ? "Actualizar usuario"
                    : "Guardar usuario"}
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
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_220px]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Buscar usuario
            </label>

            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, correo, rol, estado o ID..."
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
              <option value="bloqueado">Bloqueado</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[1100px] w-full border-collapse">
            <thead className="bg-black text-white">
              <tr className="text-left text-sm">
                <th className="p-4">ID</th>
                <th className="p-4">Usuario</th>
                <th className="p-4">Correo</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((usuario) => {
                  const id = obtenerIdUsuario(usuario);

                  return (
                    <tr
                      key={id}
                      className="border-b text-sm transition hover:bg-slate-50"
                    >
                      <td className="p-4 font-bold text-slate-700">#{id}</td>

                      <td className="p-4">
                        <p className="font-black text-black">
                          {obtenerNombreCompleto(usuario)}
                        </p>
                        <p className="text-xs text-slate-500">
                          Usuario interno
                        </p>
                      </td>

                      <td className="p-4 text-slate-600">
                        {usuario.correo || "Sin correo"}
                      </td>

                      <td className="p-4 font-bold text-slate-700">
                        {obtenerRolTexto(usuario)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${obtenerBadgeEstado(
                            usuario.estado
                          )}`}
                        >
                          {usuario.estado || "Sin estado"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => verDetalle(usuario)}
                            disabled={cargandoDetalle}
                            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                          >
                            Ver
                          </button>

                          <button
                            onClick={() => editarUsuario(usuario)}
                            className="rounded-lg bg-black px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => setUsuarioEliminar(usuario)}
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
                  <td colSpan="6" className="p-10 text-center">
                    <div className="mx-auto max-w-md">
                      <p className="text-4xl">👤</p>

                      <h3 className="mt-3 text-xl font-black text-black">
                        No hay usuarios para mostrar
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        No se encontraron usuarios con la búsqueda o filtro actual.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {usuarioDetalle && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                  Detalle de usuario
                </p>

                <h2 className="text-2xl font-black text-black">
                  {obtenerNombreCompleto(usuarioDetalle)}
                </h2>

                <p className="mt-1 text-slate-500">
                  {usuarioDetalle.correo || "Sin correo"}
                </p>
              </div>

              <button
                onClick={() => setUsuarioDetalle(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">ID</p>
                <p className="mt-1 font-bold text-black">
                  #{obtenerIdUsuario(usuarioDetalle)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Estado
                </p>
                <p className="mt-1 font-bold text-black">
                  {usuarioDetalle.estado || "Sin estado"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Nombre
                </p>
                <p className="mt-1 font-bold text-black">
                  {usuarioDetalle.nombre || "Sin nombre"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Apellido
                </p>
                <p className="mt-1 font-bold text-black">
                  {usuarioDetalle.apellido || "Sin apellido"}
                </p>
              </div>

              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-bold uppercase text-red-700">
                  Correo
                </p>
                <p className="mt-1 font-bold text-red-700">
                  {usuarioDetalle.correo || "Sin correo"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Rol
                </p>
                <p className="mt-1 font-bold text-black">
                  {obtenerRolTexto(usuarioDetalle)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-800">
              El backend actual no expone un módulo independiente para administrar
              roles, por eso el panel trabaja con el ID de rol recibido por la API.
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setUsuarioDetalle(null)}
                className="rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-red-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {usuarioEliminar && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 text-5xl">⚠️</div>

            <h2 className="text-2xl font-black text-black">
              ¿Eliminar usuario?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Esta acción eliminará al usuario{" "}
              <strong>{obtenerNombreCompleto(usuarioEliminar)}</strong>. No se
              puede deshacer.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={confirmarEliminarUsuario}
                className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
              >
                Sí, eliminar
              </button>

              <button
                onClick={() => setUsuarioEliminar(null)}
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