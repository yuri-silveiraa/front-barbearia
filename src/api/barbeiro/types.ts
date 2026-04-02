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

export interface BarberPayment {
  id: string;
  amount: number;
  createdAt: string;
}

export interface BarberFinanceResponse {
  balance: number;
  payments: BarberPayment[];
  services?: Array<{
    serviceId: string;
    service: string;
    count: number;
    total: number;
  }>;
}
