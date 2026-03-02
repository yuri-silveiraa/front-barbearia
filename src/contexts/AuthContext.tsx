import { createContext, useContext, useEffect, useState, useRef } from "react";
import { loginService, getMe, logoutService } from "../api/auth/auth.service";
import { fetchCsrfToken, clearCsrfToken } from "../api/http";
import type { User, AuthContextData } from "../features/auth/types";
import type { LoginData } from "../api/auth/schema";

export const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchUser = async () => {
      try {
        const response = await getMe();
        setUser(response.user);
      } catch {
        setUser(null);
      } finally {
        setLoadingAuth(false);
      }
    };
    fetchUser();
  }, []);

  async function login(data: LoginData) {
    const result = await loginService(data);
    setUser(result.user);
    await fetchCsrfToken();
    return result.user;
  }

  async function logout() {
    try {
      await logoutService();
    } finally {
      clearCsrfToken();
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      loadingAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}
