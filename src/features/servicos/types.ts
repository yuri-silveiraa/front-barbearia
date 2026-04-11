export interface Service {
  id: string;
  nome: string;
  descrição?: string;
  preço: number | string;
  imagemUrl?: string | null;
}

export interface CreateServiceData {
  nome: string;
  descrição?: string;
  preço: number;
  imagemArquivo?: File | null;
  removerImagem?: boolean;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  id: string;
}
