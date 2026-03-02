import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL_API || "/api",
  withCredentials: true,
  timeout: 10000,
});

let csrfToken: string | null = null;

export function clearCsrfToken(): void {
  csrfToken = null;
}

export async function fetchCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  
  try {
    const response = await api.get<{ csrfToken: string }>("/csrf-token");
    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch {
    return "";
  }
}

api.interceptors.request.use(
  async (config) => {
    if (["post", "put", "delete", "patch"].includes(config.method || "")) {
      if (!csrfToken) {
        await fetchCsrfToken();
      }
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403 && error.response?.data?.message === "Invalid CSRF token") {
      csrfToken = null;
      const newToken = await fetchCsrfToken();
      
      if (error.config && newToken) {
        error.config.headers["X-CSRF-Token"] = newToken;
        return api(error.config);
      }
    }

    if (error.response?.status === 401) {
      clearCsrfToken();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
