import { useState } from "react";
import api from "../../lib/api";
import { guardarToken } from "../../lib/auth";

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

    setError("");
    setCargando(true);

    try {
      const respuesta = await api.post("/auth/login", form);

      guardarToken(respuesta.data.token);

      window.location.href = "/dashboard";
    } catch (error) {
      console.error(error);

      setError("Correo o contraseña incorrectos");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Card className="w-full border-0 bg-white shadow-2xl">
      <CardHeader className="pb-2 text-center">
       <div className="mb-6 flex justify-center">
  <img
    src="/logo-cc-motors.png"
    alt="CC Motors"
    className="h-24 w-24 object-contain"
  />
</div>

        <CardTitle className="text-3xl font-bold text-black">
          Bienvenido
        </CardTitle>

        <p className="mt-2 text-sm text-slate-500">
          Inicia sesión para acceder al panel administrativo
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="mb-2 block font-medium">
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
            />
          </div>

          <div>
            <Label className="mb-2 block font-medium">
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
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={cargando}
            className="h-12 w-full rounded-xl bg-red-600 text-base font-semibold text-white hover:bg-red-700"
          >
            {cargando ? "Ingresando..." : "Entrar al sistema"}
          </Button>

          <a
            href="/recuperar-contrasena"
            className="block text-center text-sm text-slate-500 transition hover:text-red-600"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </form>
      </CardContent>
    </Card>
  );
}