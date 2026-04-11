export interface BarberAppointment {
  id: string;
  clientId: string;
  client: string;
  barberId: string;
  barber: string;
  serviceId: string;
  service: string;
  time: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELED";
}

export interface TimeSlot {
  id: string;
  date: string;
  disponible: boolean;
}

export interface BarberRevenueAppointment {
  id: string;
  serviceId: string;
  service: string;
  amount: number;
  completedAt: string;
}

export interface BarberFinanceResponse {
  totalRevenue: number;
  appointments: BarberRevenueAppointment[];
  services?: Array<{
    serviceId: string;
    service: string;
    count: number;
    total: number;
  }>;
}
