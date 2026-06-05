import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function ModelosList() {
  const [modelos, setModelos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    id_marca: "",
    estado: "activo",
  });

  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const obtenerModelos = async () => {
    try {
      const respuesta = await api.get("/modelos");
      setModelos(respuesta.data);
    } catch {
      setError("Error al cargar los modelos");
    } finally {
      setCargando(false);
    }
  };

  const obtenerMarcas = async () => {
    try {
      const respuesta = await api.get("/marcas");
      setMarcas(respuesta.data);
    } catch (error) {
      console.error(error.response?.data || error);
    }
  };

  useEffect(() => {
    obtenerModelos();
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
      id_marca: "",
      estado: "activo",
    });

    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const abrirNuevo = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const guardarModelo = async (e) => {
    e.preventDefault();
    setError("");

    const datosModelo = {
      ...form,
      id_marca: Number(form.id_marca),
    };

    try {
      if (editandoId) {
        await api.put(`/modelos/${editandoId}`, datosModelo);
      } else {
        await api.post("/modelos", datosModelo);
      }

      limpiarFormulario();
      obtenerModelos();
    } catch (error) {
      console.error(error.response?.data || error);
      setError(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          "Error al guardar el modelo"
      );
    }
  };

  const editarModelo = (modelo) => {
    setEditandoId(modelo.id_modelo);
    setMostrarFormulario(true);

    setForm({
      nombre: modelo.nombre || "",
      descripcion: modelo.descripcion || "",
      id_marca: modelo.id_marca || "",
      estado: modelo.estado || "activo",
    });
  };

  const eliminarModelo = async (id) => {
    const confirmar = confirm("¿Seguro que deseas eliminar este modelo?");
    if (!confirmar) return;

    try {
      await api.delete(`/modelos/${id}`);
      obtenerModelos();
    } catch (error) {
      console.error(error.response?.data || error);
      setError(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          "Error al eliminar el modelo"
      );
    }
  };

  if (cargando) return <p>Cargando modelos...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow">
        <div>
          <h2 className="text-2xl font-bold">Modelos registrados</h2>
          <p className="text-sm text-slate-500">
            Gestiona los modelos asociados a cada marca.
          </p>
        </div>

        <button
          onClick={abrirNuevo}
          className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
        >
          + Nuevo modelo
        </button>
      </div>

      {mostrarFormulario && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">
            {editandoId ? "Editar modelo" : "Registrar modelo"}
          </h2>

          <form onSubmit={guardarModelo} className="grid gap-4 md:grid-cols-2">
            <input
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            />

            <select
              name="id_marca"
              value={form.id_marca}
              onChange={handleChange}
              className="rounded-xl border p-3"
              required
            >
              <option value="">Selecciona una marca</option>

              {marcas.map((marca) => (
                <option key={marca.id_marca} value={marca.id_marca}>
                  {marca.nombre}
                </option>
              ))}
            </select>

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
              <th className="p-3">Marca</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {modelos.map((modelo) => (
              <tr key={modelo.id_modelo} className="border-b hover:bg-slate-50">
                <td className="p-3">{modelo.nombre}</td>
                <td className="p-3">{modelo.descripcion}</td>
                <td className="p-3">{modelo.marca || modelo.id_marca}</td>
                <td className="p-3">{modelo.estado}</td>

                <td className="flex gap-2 p-3">
                  <button
                    onClick={() => editarModelo(modelo)}
                    className="rounded-lg bg-black px-3 py-2 text-sm text-white"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarModelo(modelo.id_modelo)}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {modelos.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-slate-500">
                  No hay modelos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}