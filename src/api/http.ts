import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL_API,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.authorization = token;
  }
  return config;
});
