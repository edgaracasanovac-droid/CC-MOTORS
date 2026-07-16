export function verificarAuth() {
  if (typeof window === "undefined") return;

  const token = window.localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
  }
}