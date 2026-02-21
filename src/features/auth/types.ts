// User type
export type User = {
  id: string;
  name: string;
  email: string;
};

// Auth Context type
export type AuthContextData = {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  loadingAuth: boolean;
};

// Login Data type (imported from schema)
export type LoginData = {
  email: string;
  password: string;
};
