import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

export function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <p>Carregando...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
