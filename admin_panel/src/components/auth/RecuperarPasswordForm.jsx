import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { esCorreoValido, obtenerMensajeError } from "../../lib/validaciones";

export default function RecuperarContrasenaForm() {
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviarSolicitud = async (e) => {
    e.preventDefault();
    const correoNormalizado = correo.trim();

    if (!correoNormalizado) {
      const mensaje = "El correo es obligatorio";
      setError(mensaje);
      toast.error(mensaje);
      return;
    }

    if (!esCorreoValido(correoNormalizado)) {
      const mensaje = "Ingresa un correo electrónico válido";
      setError(mensaje);
      toast.error(mensaje);
      return;
    }

    setMensaje("");
    setError("");
    setCargando(true);

    try {
      const respuesta = await api.post("/auth/recuperar-contrasena", {
        correo: correoNormalizado,
      });

      setMensaje(respuesta.data.mensaje || "Solicitud enviada correctamente");
      setCorreo("");
      toast.success("Solicitud enviada correctamente");
    } catch (error) {
      const mensaje = obtenerMensajeError(error, "Error al recuperar la contraseña");
      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <div className="mb-4 flex justify-center">
          <img
            src="/logo-cc-motors.png"
            alt="CC Motors"
            className="h-20 w-20 object-contain sm:h-24 sm:w-24"
          />
        </div>

        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-red-600 sm:text-sm">
          Recuperación de acceso
        </p>

        <h1 className="text-2xl font-bold text-black sm:text-3xl">
          Recuperar contraseña
        </h1>

        <p className="mt-3 text-sm text-slate-500">
          Ingresa tu correo electrónico y recibirás las instrucciones de recuperación.
        </p>
      </div>

      <form onSubmit={enviarSolicitud} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Correo electrónico
          </label>

          <input
            type="email"
            name="correo"
            placeholder="correo@empresa.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-red-600"
            required
          />
        </div>

        {mensaje && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="h-12 w-full rounded-xl bg-red-600 px-4 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {cargando ? "Enviando..." : "Enviar recuperación"}
        </button>

        <a
          href="/login"
          className="block text-center text-sm text-slate-500 transition hover:text-red-600"
        >
          Volver al login
        </a>
      </form>
    </div>
  );
}