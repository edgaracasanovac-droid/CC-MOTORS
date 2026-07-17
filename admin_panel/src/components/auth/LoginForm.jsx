import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { guardarToken, guardarUsuario } from "../../lib/auth";
import { esCorreoValido, obtenerMensajeError } from "../../lib/validaciones";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";

export default function LoginForm() {
  const [form, setForm] = useState({
    correo: "",
    contrasena: "",
  });

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cargando) return;

    const correo = form.correo.trim();
    const contrasena = form.contrasena;

    if (!correo || !contrasena) {
      const mensaje = "Correo y contraseña son obligatorios";
      setError(mensaje);
      toast.error(mensaje);
      return;
    }

    if (!esCorreoValido(correo)) {
      const mensaje = "Ingresa un correo electrónico válido";
      setError(mensaje);
      toast.error(mensaje);
      return;
    }

    setError("");
    setCargando(true);

    try {
      const datosLogin = {
        correo,
        contrasena,
      };

      const respuesta = await api.post("/auth/login", datosLogin);

      const token = respuesta.data?.token;
      const usuario = respuesta.data?.usuario;

      if (!token) {
        throw new Error("El backend no devolvió un token válido");
      }

      guardarToken(token);

      if (usuario) {
        guardarUsuario(usuario);
      }

      toast.success("Inicio de sesión correcto");

      const idRol = usuario?.id_rol;

      if (idRol === undefined || idRol === null || idRol === 2) {
        const mensaje = "No tienes permisos para acceder al panel administrativo.";
        setError(mensaje);
        toast.error(mensaje);
        guardarToken(null);
        guardarUsuario(null);
        setCargando(false);
        return;
      }

      setTimeout(() => {
        window.location.replace("/dashboard");
      }, 500);
    } catch (error) {
      const mensaje = obtenerMensajeError(error, "Correo o contraseña incorrectos");

      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Card className="w-full border-0 bg-white shadow-none">
      <CardHeader className="pb-2 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-black shadow-xl">
            <img
              src="/logo-cc-motors.png"
              alt="CC Motors"
              className="h-24 w-24 object-contain"
            />
          </div>
        </div>

        <p className="text-sm font-bold uppercase tracking-widest text-red-600">
          Panel administrativo
        </p>

        <CardTitle className="mt-2 text-3xl font-black text-black">
          Bienvenido
        </CardTitle>

        <p className="mt-2 text-sm text-slate-500">
          Inicia sesión para acceder al sistema administrativo de CC Motors.
        </p>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="mb-2 block font-semibold text-slate-700">
              Correo electrónico
            </Label>

            <Input
              type="email"
              name="correo"
              placeholder="correo@empresa.com"
              value={form.correo}
              onChange={handleChange}
              className="h-12 rounded-xl border-slate-300 focus:border-red-600 focus:ring-red-600"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <Label className="mb-2 block font-semibold text-slate-700">
              Contraseña
            </Label>

            <Input
              type="password"
              name="contrasena"
              placeholder="********"
              value={form.contrasena}
              onChange={handleChange}
              className="h-12 rounded-xl border-slate-300 focus:border-red-600 focus:ring-red-600"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={cargando}
            className="h-12 w-full rounded-xl bg-red-600 text-base font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {cargando ? "Ingresando..." : "Entrar al sistema"}
          </Button>

          <a
            href="/recuperar-contrasena"
            className="block text-center text-sm font-semibold text-slate-500 transition hover:text-red-600"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </form>
      </CardContent>
    </Card>
  );
}