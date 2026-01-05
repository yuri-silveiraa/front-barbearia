import { createContext, useContext, useEffect, useState } from "react";
import { loginService } from "../api/auth/auth.service";
import { type LoginData } from "../features/auth/types";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextData = {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  loadingAuth: boolean;
};

const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
  try {
    const storagedUser = localStorage.getItem("user");

    if (storagedUser && storagedUser !== "undefined") {
      setUser(JSON.parse(storagedUser));
    }
  } catch (error) {
    console.error("Erro ao ler usuário do localStorage:", error);
    localStorage.removeItem("user");
  }

  setLoadingAuth(false);
}, []);


  async function login(data: LoginData) {
    const result = await loginService(data);

    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
    console.log("RESULT DO LOGIN:", result);

    setUser(result.user);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
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
