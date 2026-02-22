// User type
export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type?: "BARBER" | "CLIENT";
};

// Auth Context type
export type AuthContextData = {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<User>;
  logout: () => Promise<void>;
  loadingAuth: boolean;
};

// Login Data type (imported from schema)
export type LoginData = {
  email: string;
  password: string;
};
