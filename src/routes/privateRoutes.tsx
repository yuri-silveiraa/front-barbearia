import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";
import type { User } from "../features/auth/types";

type UserType = NonNullable<User["type"]>;

function defaultPathForUser(user: User | null) {
  if (user?.type === "BARBER") {
    return "/agenda";
  }

  return "/home";
}

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

export function RoleRoute({
  children,
  allowedTypes,
  requireAdmin = false,
}: {
  children: ReactNode;
  allowedTypes: UserType[];
  requireAdmin?: boolean;
}) {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <p>Carregando...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasAllowedType = user.type ? allowedTypes.includes(user.type) : false;
  const hasAdminPermission = !requireAdmin || user.isAdmin === true;

  if (!hasAllowedType || !hasAdminPermission) {
    return <Navigate to={defaultPathForUser(user)} replace />;
  }

  return children;
}

export function IndexRedirect() {
  const { user } = useAuth();
  
  if (user?.type === "BARBER") {
    return <Navigate to="/agenda" replace />;
  }
  
  return <Navigate to="/home" replace />;
}
