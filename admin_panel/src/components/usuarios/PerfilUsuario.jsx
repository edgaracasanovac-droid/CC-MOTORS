import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function PerfilUsuario() {
  const [perfil, setPerfil] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
  });

  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const obtenerPerfil = async () => {
    try {
      const respuesta = await api.get("/auth/profile");

      const datosPerfil = respuesta.data.perfil;

      setPerfil(datosPerfil);

      setForm({
        nombre: datosPerfil.nombre || "",
        apellido: datosPerfil.apellido || "",
        correo: datosPerfil.email || "",
      });
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al cargar el perfil");
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
    setMensaje("");
    setError("");

    try {
      const respuesta = await api.put("/auth/profile_update", form);

      const datosActualizados =
        respuesta.data.perfil || respuesta.data.usuario || respuesta.data;

      setPerfil({
        ...datosActualizados,
        email: datosActualizados.email || datosActualizados.correo,
      });

      setMensaje("Perfil actualizado correctamente");
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al actualizar el perfil");
    }
  };

  if (cargando) return <p>Cargando perfil...</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-bold">Mi perfil</h2>

        {perfil && (
          <div className="space-y-2 text-slate-700">
            <p>
              <strong>Nombre:</strong> {perfil.nombre}
            </p>
            <p>
              <strong>Apellido:</strong> {perfil.apellido}
            </p>
            <p>
              <strong>Correo:</strong> {perfil.email || perfil.correo}
            </p>
            <p>
              <strong>Rol:</strong> {perfil.rol || perfil.id_rol}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-bold">Actualizar perfil</h2>

        <form onSubmit={actualizarPerfil} className="grid gap-4 md:grid-cols-2">
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

          <button
            type="submit"
            className="rounded-xl bg-black px-5 py-3 text-white"
          >
            Actualizar perfil
          </button>
        </form>

        {mensaje && <p className="mt-4 text-green-600">{mensaje}</p>}
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    </div>
  );
}