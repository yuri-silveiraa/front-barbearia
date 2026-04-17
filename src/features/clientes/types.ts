export interface AdminCustomer {
  id: string;
  name: string;
  whatsapp: string;
  userId?: string | null;
  email?: string | null;
  noShowCount: number;
  totalAppointments: number;
  blockedAt?: string | null;
  blockedReason?: string | null;
  blockedByBarberId?: string | null;
  createdAt: string;
  updatedAt: string;
}
