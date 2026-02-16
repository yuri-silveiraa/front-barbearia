import { useAuth as useAuthContext } from "../contexts/AuthContext";

export function useIsAuthenticated() {
  const { isAuthenticated, loadingAuth } = useAuthContext();
  return { isAuthenticated, loadingAuth };
}

export function useUser() {
  const { user } = useAuthContext();
  return user;
}