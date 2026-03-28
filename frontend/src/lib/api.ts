// En el servidor (SSR) usamos la URL completa del backend.
// En el cliente dejamos vacío porque el rewrite de Next.js lo resuelve.
const BASE_URL =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "")
    : "";

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export async function fetchApi<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
    throw new Error("No autenticado");
  }

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || json.error || "Error del servidor");
  }

  return json;
}
