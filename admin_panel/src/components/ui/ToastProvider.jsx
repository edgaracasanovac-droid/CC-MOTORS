import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#000",
          color: "#fff",
          border: "1px solid #dc2626",
        },
      }}
    />
  );
}