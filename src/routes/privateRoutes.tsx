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

export function IndexRedirect() {
  const { user } = useAuth();
  
  if (user?.type === "BARBER") {
    return <Navigate to="/agenda" replace />;
  }
  
  return <Navigate to="/reservas" replace />;
}
