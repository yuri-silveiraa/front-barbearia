export interface Barber {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialties?: string[];
  available?: boolean;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category?: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  data: string;
  available: boolean;
  barberId: string;
}

export interface ReservaPayload {
  clientId: string;
  barberId: string;
  serviceId: string;
  timeId: string;
}