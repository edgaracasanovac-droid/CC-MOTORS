export function verificarAuth() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
  }
}