export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  price: number;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  id: string;
}
