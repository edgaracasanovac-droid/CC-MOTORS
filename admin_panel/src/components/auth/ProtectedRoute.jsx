import { useEffect } from "react";

export default function ProtectedRoute() {
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  return null;
}