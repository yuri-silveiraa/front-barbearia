import { api } from "../http";
import type { Service, CreateServiceData, UpdateServiceData } from "../../features/servicos/types";

async function fileToBase64(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Falha ao ler imagem"));
        return;
      }
      const [, base64 = ""] = result.split(",");
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Falha ao ler imagem"));
    reader.readAsDataURL(file);
  });
}

function resolveImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;

  const baseUrl = import.meta.env.VITE_BASE_URL_API;
  if (baseUrl && baseUrl !== "/api") {
    return `${baseUrl.replace(/\/$/, "")}${imageUrl.replace(/^\/api/, "")}`;
  }

  return imageUrl;
}

export async function getServices(): Promise<Service[]> {
  const { data } = await api.get<Service[]>("/service/my-services");
  return data.map((service) => ({
    ...service,
    duration: Number(service.duration ?? service.durationMinutes ?? 0),
    imagemUrl: resolveImageUrl(service.imagemUrl),
  }));
}

export async function createService(data: CreateServiceData): Promise<Service> {
  const payload = {
    name: data.nome,
    description: data.descrição,
    price: Number(data.preço),
    durationMinutes: Number(data.duration),
    imageBase64: data.imagemArquivo ? await fileToBase64(data.imagemArquivo) : undefined,
    imageMimeType: data.imagemArquivo?.type || undefined,
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
  if (rest.duration !== undefined) body.durationMinutes = Number(rest.duration);
  if (rest.imagemArquivo) {
    body.imageBase64 = await fileToBase64(rest.imagemArquivo);
    body.imageMimeType = rest.imagemArquivo.type;
  }
  if (rest.removerImagem !== undefined) body.removeImage = rest.removerImagem;
  
  const { data: response } = await api.put<Service>(`/service/${id}`, body);
  return response;
}

export async function deleteService(id: string): Promise<void> {
  await api.delete(`/service/${id}`);
}
