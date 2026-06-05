import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function UsuariosList() {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    contrasena: "",
    id_rol: "",
  });

  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const obtenerUsuarios = async () => {
    try {
      const respuesta = await api.get("/usuarios");
      setUsuarios(respuesta.data);
    } catch {
      setError("Error al cargar los usuarios");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      apellido: "",
      correo: "",
      contrasena: "",
      id_rol: "",
    });

    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const abrirNuevo = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    setError("");

    const datosUsuario = {
      nombre: form.nombre,
      apellido: form.apellido,
      correo: form.correo,
      id_rol: Number(form.id_rol),
    };

    if (!editandoId) {
      datosUsuario.contrasena = form.contrasena;
    }

    try {
      if (editandoId) {
        await api.put(`/usuarios/${editandoId}`, datosUsuario);
      } else {
        await api.post("/usuarios", datosUsuario);
      }

      limpiarFormulario();
      obtenerUsuarios();
    } catch (error) {
      console.error(error.response?.data || error);
      setError(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          "Error al guardar el usuario"
      );
    }
  };

  const editarUsuario = (usuario) => {
    const id = usuario.id_usuario || usuario.id;

    setEditandoId(id);
    setMostrarFormulario(true);

    setForm({
      nombre: usuario.nombre || "",
      apellido: usuario.apellido || "",
      correo: usuario.correo || "",
      contrasena: "",
      id_rol: usuario.id_rol || "",
    });
  };

  const eliminarUsuario = async (usuario) => {
    const id = usuario.id_usuario || usuario.id;

    const confirmar = confirm(
      `¿Seguro que deseas eliminar al usuario ${usuario.nombre}?`
    );

    if (!confirmar) return;

    try {
      await api.delete(`/usuarios/${id}`);
      obtenerUsuarios();
    } catch (error) {
      console.error(error.response?.data || error);
      setError(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          "Error al eliminar el usuario"
      );
    }
  };

  if (cargando) return <p>Cargando usuarios...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow">
        <div>
          <h2 className="text-2xl font-bold">Usuarios registrados</h2>
          <p className="text-sm text-slate-500">
            Gestiona los usuarios del sistema.
          </p>
        </div>

        <button
          onClick={abrirNuevo}
          className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
        >
          + Nuevo usuario
        </button>
      </div>

      {mostrarFormulario && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">
            {editandoId ? "Editar usuario" : "Registrar usuario"}
          </h2>

          <form onSubmit={guardarUsuario} className="grid gap-4 md:grid-cols-2">
            <input
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            />

            <input
              name="apellido"
              placeholder="Apellido"
              value={form.apellido}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            />

            <input
              name="correo"
              placeholder="Correo"
              value={form.correo}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            />

            {!editandoId && (
              <input
                name="contrasena"
                type="password"
                placeholder="Contraseña"
                value={form.contrasena}
                onChange={handleChange}
                className="rounded-xl border p-3"
                required
              />
            )}

            <input
              name="id_rol"
              placeholder="ID rol"
              value={form.id_rol}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            />

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-black px-5 py-3 text-white"
              >
                {editandoId ? "Actualizar" : "Guardar"}
              </button>

              <button
                type="button"
                onClick={limpiarFormulario}
                className="rounded-xl bg-slate-200 px-5 py-3"
              >
                Cancelar
              </button>
            </div>
          </form>

          {error && <p className="mt-4 text-red-500">{error}</p>}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl bg-white shadow">
  <table className="min-w-[900px] w-full border-collapse">
          <thead className="bg-black text-white">
            <tr className="text-left">
              <th className="p-3">Nombre</th>
              <th className="p-3">Apellido</th>
              <th className="p-3">Correo</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {usuarios.map((usuario) => {
              const id = usuario.id_usuario || usuario.id;

              return (
                <tr key={id} className="border-b hover:bg-slate-50">
                  <td className="p-3">{usuario.nombre}</td>
                  <td className="p-3">{usuario.apellido}</td>
                  <td className="p-3">{usuario.correo}</td>
                  <td className="p-3">{usuario.rol || usuario.id_rol}</td>

                  <td className="flex gap-2 p-3">
                    <button
                      onClick={() => editarUsuario(usuario)}
                      className="rounded-lg bg-black px-3 py-2 text-sm text-white"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => eliminarUsuario(usuario)}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}

            {usuarios.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-slate-500">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}