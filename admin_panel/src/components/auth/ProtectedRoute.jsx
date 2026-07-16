import { useEffect, useState } from "react";

export default function ProtectedRoute() {
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem("token");

    if (!token) {
      window.location.replace("/login");
      return;
    }

    setVerificando(false);
  }, []);

  if (verificando) {
    return null;
  }

  return null;
}