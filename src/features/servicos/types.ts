export interface Service {
  id: string;
  nome: string;
  descrição?: string;
  preço: number | string;
}

export interface CreateServiceData {
  nome: string;
  descrição?: string;
  preço: number;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  id: string;
}
