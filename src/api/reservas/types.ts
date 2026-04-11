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
  imagemUrl?: string | null;
}

export interface TimeSlot {
  id: string;
  data: string;
  date?: string;
}

export interface ReservaPayload {
  clientId: string;
  barberId: string;
  serviceId: string;
  timeId: string;
}
