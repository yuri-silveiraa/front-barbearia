import { api } from "../http";
import type { Service, CreateServiceData, UpdateServiceData } from "../../features/servicos/types";

export async function getServices(): Promise<Service[]> {
  const { data } = await api.get<Service[]>("/service");
  return data;
}

export async function createService(data: CreateServiceData): Promise<Service> {
  const payload = {
    name: data.nome,
    description: data.descrição,
    price: Number(data.preço),
  };
  const { data: response } = await api.post<Service>("/service/create", payload);
  return response;
}

export async function updateService(data: UpdateServiceData): Promise<Service> {
  const { id, ...rest } = data;
  const body: Record<string, unknown> = {};
  if (rest.nome !== undefined) body.name = rest.nome;
  if (rest.descrição !== undefined) body.description = rest.descrição;
  if (rest.preço !== undefined) body.price = Number(rest.preço);
  
  const { data: response } = await api.put<Service>(`/service/${id}`, body);
  return response;
}

export async function deleteService(id: string): Promise<void> {
  await api.delete(`/service/${id}`);
}
