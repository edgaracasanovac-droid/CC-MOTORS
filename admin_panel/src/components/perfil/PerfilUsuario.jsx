import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { esCorreoValido, esTextoValido, obtenerMensajeError } from "../../lib/validaciones";

export default function PerfilUsuario() {
  const [perfil, setPerfil] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const obtenerDatosPerfil = (respuesta) => {
    return (
      respuesta.data?.perfil ||
      respuesta.data?.usuario ||
      respuesta.data?.user ||
      respuesta.data
    );
  };

  const obtenerCorreo = (datos) => {
    return datos?.correo || datos?.email || "";
  };

  const obtenerRol = (datos) => {
    if (datos?.rol) return datos.rol;
    if (datos?.nombre_rol) return datos.nombre_rol;
    if (datos?.id_rol) return `Rol #${datos.id_rol}`;
    return "Sin rol";
  };

  const obtenerNombreCompleto = (datos) => {
    return `${datos?.nombre || ""} ${datos?.apellido || ""}`.trim() || "Usuario";
  };

  const obtenerIniciales = (datos) => {
    const nombre = datos?.nombre?.charAt(0) || "U";
    const apellido = datos?.apellido?.charAt(0) || "";
    return `${nombre}${apellido}`.toUpperCase();
  };

  const obtenerPerfil = async () => {
    setCargando(true);
    setError("");

    try {
      const respuesta = await api.get("/auth/profile");
      const datosPerfil = obtenerDatosPerfil(respuesta);

      setPerfil(datosPerfil);

      setForm({
        nombre: datosPerfil?.nombre || "",
        apellido: datosPerfil?.apellido || "",
        correo: obtenerCorreo(datosPerfil),
      });
    } catch (error) {
      console.error(error.response?.data || error);

      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Error al cargar el perfil";

      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerPerfil();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const actualizarPerfil = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const datosEnviar = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      correo: form.correo.trim(),
    };

    if (!esTextoValido(datosEnviar.nombre)) {
      setError("El nombre es obligatorio");
      toast.error("El nombre es obligatorio");
      setGuardando(false);
      return;
    }

    if (!esTextoValido(datosEnviar.apellido)) {
      setError("El apellido es obligatorio");
      toast.error("El apellido es obligatorio");
      setGuardando(false);
      return;
    }

    if (!esCorreoValido(datosEnviar.correo)) {
      setError("El correo debe tener formato válido");
      toast.error("El correo debe tener formato válido");
      setGuardando(false);
      return;
    }

    try {
      const respuesta = await api.put("/auth/profile_update", datosEnviar);

      const datosActualizados = obtenerDatosPerfil(respuesta);

      const perfilFinal = {
        ...perfil,
        ...datosActualizados,
        correo: obtenerCorreo(datosActualizados) || datosEnviar.correo,
        email: obtenerCorreo(datosActualizados) || datosEnviar.correo,
      };

      setPerfil(perfilFinal);

      setForm({
        nombre: perfilFinal.nombre || "",
        apellido: perfilFinal.apellido || "",
        correo: obtenerCorreo(perfilFinal),
      });

      const usuarioStorage = localStorage.getItem("usuario");

      if (usuarioStorage) {
        const usuarioActual = JSON.parse(usuarioStorage);

        localStorage.setItem(
          "usuario",
          JSON.stringify({
            ...usuarioActual,
            nombre: perfilFinal.nombre,
            apellido: perfilFinal.apellido,
            correo: obtenerCorreo(perfilFinal),
          })
        );
      }

      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      const mensaje = obtenerMensajeError(error, "Error al actualizar el perfil");

      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="space-y-6">
        <div className="h-48 animate-pulse rounded-3xl bg-slate-200"></div>

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
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
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-600 text-3xl font-black text-white shadow-lg">
              {obtenerIniciales(perfil)}
            </div>

            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-red-500">
                Cuenta del usuario
              </p>

              <h2 className="text-3xl font-black">
                {obtenerNombreCompleto(perfil)}
              </h2>

              <p className="mt-2 text-slate-300">
                {obtenerCorreo(perfil) || "Sin correo registrado"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Rol actual
            </p>

            <p className="mt-1 text-xl font-black text-white">
              {obtenerRol(perfil)}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">
            Nombre
          </p>

          <p className="mt-2 text-2xl font-black text-black">
            {perfil?.nombre || "Sin nombre"}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Información principal
          </p>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-red-700">
            Correo
          </p>

          <p className="mt-2 break-all text-xl font-black text-red-700">
            {obtenerCorreo(perfil) || "Sin correo"}
          </p>

          <p className="mt-2 text-sm text-red-700">
            Acceso al sistema
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-slate-500">
            Identificador
          </p>

          <p className="mt-2 text-2xl font-black text-black">
            #{perfil?.id_usuario || perfil?.id || "N/A"}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Usuario autenticado
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-widest text-red-600">
              Datos actuales
            </p>

            <h3 className="text-2xl font-black text-black">
              Información del perfil
            </h3>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">
                Nombre completo
              </p>

              <p className="mt-1 font-bold text-black">
                {obtenerNombreCompleto(perfil)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">
                Correo
              </p>

              <p className="mt-1 break-all font-bold text-black">
                {obtenerCorreo(perfil) || "Sin correo"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">
                Rol
              </p>

              <p className="mt-1 font-bold text-black">
                {obtenerRol(perfil)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">
                Estado
              </p>

              <p className="mt-1 font-bold text-black">
                {perfil?.estado || "No especificado"}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-800">
            Estos datos pertenecen al usuario autenticado con el token JWT del
            panel administrativo.
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-widest text-red-600">
              Actualización
            </p>

            <h3 className="text-2xl font-black text-black">
              Editar mi perfil
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Actualiza tus datos básicos de usuario dentro del sistema.
            </p>
          </div>

          <form onSubmit={actualizarPerfil} className="grid gap-4 md:grid-cols-2">
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

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Correo
              </label>

              <input
                type="email"
                name="correo"
                placeholder="correo@ejemplo.com"
                value={form.correo}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
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
                {guardando ? "Actualizando..." : "Actualizar perfil"}
              </button>

              <button
                type="button"
                onClick={obtenerPerfil}
                className="rounded-xl bg-slate-200 px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-300"
              >
                Recargar datos
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}