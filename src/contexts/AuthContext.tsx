import { createContext, useContext, useEffect, useState, useRef } from "react";
import {
  loginService,
  getMe,
  logoutService,
  updateMe,
  deleteMe,
  verifyEmail,
  changePasswordMe,
} from "../api/auth/auth.service";
import { googleAuthService } from "../api/auth/googleAuth";
import { fetchCsrfToken, clearCsrfToken } from "../api/http";
import type { User, AuthContextData, ChangePasswordData, UpdateProfileData } from "../features/auth/types";
import type { LoginData } from "../api/auth/schema";

export const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const hasFetched = useRef(false);
  const logoutInFlight = useRef<Promise<void> | null>(null);

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

  async function loginWithGoogle(credential: string) {
    const result = await googleAuthService(credential);
    setUser(result.user);
    await fetchCsrfToken();
    return result.user;
  }

  async function verifyEmailAndLogin(code: string) {
    const result = await verifyEmail(code);
    setUser(result.user);
    await fetchCsrfToken();
    return result.user;
  }

  async function logout() {
    if (logoutInFlight.current) {
      return logoutInFlight.current;
    }

    const run = (async () => {
      try {
        await logoutService();
      } finally {
        clearCsrfToken();
        setUser(null);
        logoutInFlight.current = null;
      }
    })();

    logoutInFlight.current = run;
    return run;
  }

  async function updateUser(data: UpdateProfileData) {
    const result = await updateMe(data);
    setUser(result.user);
    return result.user;
  }

  async function changePassword(data: ChangePasswordData) {
    const result = await changePasswordMe(data);
    setUser(result.user);
    return result.user;
  }

  async function deleteUser() {
    await deleteMe();
    clearCsrfToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      loginWithGoogle,
      verifyEmailAndLogin,
      updateUser,
      changePassword,
      deleteUser,
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
