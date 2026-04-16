export interface Service {
  id: string;
  barberId?: string;
  nome: string;
  descrição?: string;
  preço: number | string;
  duration: number;
  durationMinutes?: number;
  imagemUrl?: string | null;
}

export interface CreateServiceData {
  nome: string;
  descrição?: string;
  preço: number;
  duration: number;
  imagemArquivo?: File | null;
  removerImagem?: boolean;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  id: string;
}
