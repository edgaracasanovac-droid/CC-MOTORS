import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function MarcasList() {
  const [marcas, setMarcas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    pais_origen: "",
    sitio_web: "",
    estado: "activo",
  });

  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const obtenerMarcas = async () => {
    try {
      const respuesta = await api.get("/marcas");
      setMarcas(respuesta.data);
    } catch {
      setError("Error al cargar las marcas");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerMarcas();
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
      descripcion: "",
      pais_origen: "",
      sitio_web: "",
      estado: "activo",
    });

    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const abrirNueva = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const guardarMarca = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editandoId) {
        await api.put(`/marcas/${editandoId}`, form);
      } else {
        await api.post("/marcas", form);
      }

      limpiarFormulario();
      obtenerMarcas();
    } catch (error) {
      console.error(error.response?.data || error);
      setError(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          "Error al guardar la marca"
      );
    }
  };

  const editarMarca = (marca) => {
    setEditandoId(marca.id_marca);
    setMostrarFormulario(true);

    setForm({
      nombre: marca.nombre || "",
      descripcion: marca.descripcion || "",
      pais_origen: marca.pais_origen || "",
      sitio_web: marca.sitio_web || "",
      estado: marca.estado || "activo",
    });
  };

  const eliminarMarca = async (id) => {
    const confirmar = confirm("¿Seguro que deseas eliminar esta marca?");
    if (!confirmar) return;

    try {
      await api.delete(`/marcas/${id}`);
      obtenerMarcas();
    } catch (error) {
      console.error(error.response?.data || error);
      setError(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          "Error al eliminar la marca"
      );
    }
  };

  if (cargando) return <p>Cargando marcas...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow">
        <div>
          <h2 className="text-2xl font-bold">Marcas registradas</h2>
          <p className="text-sm text-slate-500">
            Gestiona las marcas disponibles para los vehículos.
          </p>
        </div>

        <button
          onClick={abrirNueva}
          className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
        >
          + Nueva marca
        </button>
      </div>

      {mostrarFormulario && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">
            {editandoId ? "Editar marca" : "Registrar marca"}
          </h2>

          <form onSubmit={guardarMarca} className="grid gap-4 md:grid-cols-2">
            <input
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            />

            <input
              name="pais_origen"
              placeholder="País de origen"
              value={form.pais_origen}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            />

            <input
              name="sitio_web"
              placeholder="Sitio web"
              value={form.sitio_web}
              onChange={handleChange}
              className="rounded-xl border p-3"
            />

            <input
              name="estado"
              placeholder="Estado"
              value={form.estado}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            />

            <textarea
              name="descripcion"
              placeholder="Descripción"
              value={form.descripcion}
              onChange={handleChange}
              className="rounded-xl border p-3 md:col-span-2"
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
              <th className="p-3">Descripción</th>
              <th className="p-3">País</th>
              <th className="p-3">Sitio web</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {marcas.map((marca) => (
              <tr key={marca.id_marca} className="border-b hover:bg-slate-50">
                <td className="p-3">{marca.nombre}</td>
                <td className="p-3">{marca.descripcion}</td>
                <td className="p-3">{marca.pais_origen}</td>
                <td className="p-3">{marca.sitio_web}</td>
                <td className="p-3">{marca.estado}</td>
                <td className="flex gap-2 p-3">
                  <button
                    onClick={() => editarMarca(marca)}
                    className="rounded-lg bg-black px-3 py-2 text-sm text-white"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarMarca(marca.id_marca)}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {marcas.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-slate-500">
                  No hay marcas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}