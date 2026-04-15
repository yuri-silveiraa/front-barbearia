import type { ReactNode } from "react";
import { Box, Paper, Skeleton } from "@mui/material";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { User } from "../features/auth/types";

type UserType = NonNullable<User["type"]>;

function defaultPathForUser(user: User | null) {
  if (user?.type === "BARBER") {
    return "/agenda";
  }

  return "/home";
}

function RouteLoadingSkeleton() {
  return (
    <Box sx={{ width: "100%", maxWidth: 980, mx: "auto", p: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Skeleton width={110} height={20} />
        <Skeleton width={260} height={42} />
        <Skeleton width="64%" height={22} />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1, mb: 2 }}>
        {[0, 1, 2, 3].map((item) => (
          <Paper
            key={item}
            elevation={0}
            sx={{
              p: { xs: 1.25, sm: 1.75 },
              minHeight: 92,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "8px",
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Skeleton variant="circular" width={22} height={22} />
            <Box>
              <Skeleton width="48%" height={28} />
              <Skeleton width="72%" height={18} />
            </Box>
          </Paper>
        ))}
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: "8px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        {[0, 1, 2, 3].map((item) => (
          <Box
            key={item}
            sx={{
              p: { xs: 2, sm: 2.5 },
              display: "grid",
              gridTemplateColumns: "64px minmax(0, 1fr) auto",
              gap: { xs: 1.5, sm: 2 },
              alignItems: "center",
              borderTop: item === 0 ? 0 : "1px solid",
              borderColor: "divider",
            }}
          >
            <Box>
              <Skeleton width={48} height={28} />
              <Skeleton width={42} height={16} />
            </Box>
            <Box>
              <Skeleton width="72%" height={24} />
              <Skeleton width="54%" height={18} />
            </Box>
            <Skeleton width={72} height={28} sx={{ borderRadius: 999 }} />
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

export function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <RouteLoadingSkeleton />;
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
    return <RouteLoadingSkeleton />;
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
