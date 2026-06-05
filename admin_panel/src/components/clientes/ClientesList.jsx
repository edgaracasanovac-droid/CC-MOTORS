import { useEffect, useState } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";

export default function ClientesList() {
  const [clientes, setClientes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    telefono: "",
    correo: "",
    direccion: "",
  });

  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const obtenerClientes = async () => {
    try {
      const respuesta = await api.get("/clientes");
      setClientes(respuesta.data);
    } catch {
      setError("Error al cargar los clientes");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      apellido: "",
      documento: "",
      telefono: "",
      correo: "",
      direccion: "",
    });
    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const abrirNuevo = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const guardarCliente = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editandoId) {
        await api.put(`/clientes/${editandoId}`, form);
      } else {
        await api.post("/clientes", form);
      }

      limpiarFormulario();
      obtenerClientes();
      toast.success("Cliente guardado correctamente");
    } catch (error) {
      console.error(error.response?.data || error);
      setError("Error al guardar el cliente");
      toast.error("Error al guardar el cliente");
    }
  };

  const editarCliente = (cliente) => {
    setEditandoId(cliente.id_cliente || cliente.id);
    setMostrarFormulario(true);

    setForm({
      nombre: cliente.nombre || "",
      apellido: cliente.apellido || "",
      documento: cliente.documento || "",
      telefono: cliente.telefono || "",
      correo: cliente.correo || "",
      direccion: cliente.direccion || "",
    });
  };

  const eliminarCliente = async (id) => {
    const confirmar = confirm("¿Seguro que deseas eliminar este cliente?");
    if (!confirmar) return;

    try {
      await api.delete(`/clientes/${id}`);
      obtenerClientes();
    } catch {
      setError("Error al eliminar el cliente");
      toast.error("Error al eliminar el cliente");
    }
  };

  if (cargando) return <p>Cargando clientes...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow">
        <div>
          <h2 className="text-2xl font-bold">Clientes registrados</h2>
          <p className="text-sm text-slate-500">
            Gestiona la información de los clientes.
          </p>
        </div>

        <button
          onClick={abrirNuevo}
          className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
        >
          + Nuevo cliente
        </button>
      </div>

      {mostrarFormulario && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">
            {editandoId ? "Editar cliente" : "Registrar cliente"}
          </h2>

          <form onSubmit={guardarCliente} className="grid gap-4 md:grid-cols-2">
            <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} className="rounded-xl border p-3" required />
            <input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} className="rounded-xl border p-3" required />
            <input name="documento" placeholder="Documento" value={form.documento} onChange={handleChange} className="rounded-xl border p-3" required />
            <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} className="rounded-xl border p-3" required />
            <input name="correo" placeholder="Correo" value={form.correo} onChange={handleChange} className="rounded-xl border p-3" required />
            <input name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} className="rounded-xl border p-3" required />

            <div className="flex gap-3 md:col-span-2">
              <button type="submit" className="rounded-xl bg-black px-5 py-3 text-white">
                {editandoId ? "Actualizar" : "Guardar"}
              </button>

              <button type="button" onClick={limpiarFormulario} className="rounded-xl bg-slate-200 px-5 py-3">
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
              <th className="p-3">Documento</th>
              <th className="p-3">Teléfono</th>
              <th className="p-3">Correo</th>
              <th className="p-3">Dirección</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {clientes.map((cliente) => {
              const id = cliente.id_cliente || cliente.id;

              return (
                <tr key={id} className="border-b hover:bg-slate-50">
                  <td className="p-3">{cliente.nombre}</td>
                  <td className="p-3">{cliente.apellido}</td>
                  <td className="p-3">{cliente.documento}</td>
                  <td className="p-3">{cliente.telefono}</td>
                  <td className="p-3">{cliente.correo}</td>
                  <td className="p-3">{cliente.direccion}</td>
                  <td className="flex gap-2 p-3">
                    <button onClick={() => editarCliente(cliente)} className="rounded-lg bg-black px-3 py-2 text-sm text-white">
                      Editar
                    </button>

                    <button onClick={() => eliminarCliente(id)} className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700">
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}

            {clientes.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-slate-500">
                  No hay clientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}