// User type
export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type?: "BARBER" | "CLIENT";
  isAdmin?: boolean;
};

// Auth Context type
export type AuthContextData = {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<User>;
  loginWithGoogle: (credential: string) => Promise<User>;
  verifyEmailAndLogin: (code: string) => Promise<User>;
  updateUser: (data: UpdateProfileData) => Promise<User>;
  deleteUser: () => Promise<void>;
  logout: () => Promise<void>;
  loadingAuth: boolean;
};

// Login Data type (imported from schema)
export type LoginData = {
  email: string;
  password: string;
};

export type UpdateProfileData = {
  name?: string;
  email?: string;
  telephone?: string;
};
