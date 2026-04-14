export interface BarberAdmin {
  id: string;
  userId: string;
  nome: string;
  email?: string;
  telefone?: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface CreateBarberPayload {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
}
