import { api } from "../http";
import type { Reserva } from "../../features/reservas/types";
import type { Barber, Service, TimeSlot, ReservaPayload } from "./types";
import { resolveApiImageUrl } from "../../utils/apiImage";

type UnknownRecord = Record<string, unknown>;

const LIST_WRAPPER_KEYS = ["items", "results", "content"] as const;

function isObject(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function toRecordArray(value: unknown): UnknownRecord[] {
  if (Array.isArray(value)) {
    return value.filter(isObject);
  }

  if (!isObject(value)) {
    return [];
  }

  for (const key of LIST_WRAPPER_KEYS) {
    const nested = value[key];
    if (Array.isArray(nested)) {
      return nested.filter(isObject);
    }
  }

  for (const nested of Object.values(value)) {
    if (Array.isArray(nested)) {
      return nested.filter(isObject);
    }
  }

  return [];
}

function readFromPaths(source: UnknownRecord, paths: string[]): unknown {
  for (const path of paths) {
    const segments = path.split(".");
    let current: unknown = source;

    for (const segment of segments) {
      if (!isObject(current) || !(segment in current)) {
        current = undefined;
        break;
      }
      current = current[segment];
    }

    if (current !== undefined && current !== null) {
      return current;
    }
  }

  return undefined;
}

function readString(source: UnknownRecord, paths: string[], fallback = ""): string {
  const value = readFromPaths(source, paths);
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number") {
    return String(value);
  }
  return fallback;
}

function readOptionalString(source: UnknownRecord, paths: string[]): string | undefined {
  const value = readFromPaths(source, paths);
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return undefined;
}

function readNumber(source: UnknownRecord, paths: string[], fallback = 0): number {
  const value = readFromPaths(source, paths);
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.replace(",", ".");
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function readBoolean(source: UnknownRecord, paths: string[], fallback = true): boolean {
  const value = readFromPaths(source, paths);

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "available", "disponivel"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "unavailable", "indisponivel", "blocked"].includes(normalized)) {
      return false;
    }
  }

  return fallback;
}

function normalizeBarber(raw: UnknownRecord): Barber {
  const profileImageUrl = readOptionalString(raw, [
    "profileImageUrl",
    "fotoPerfilUrl",
    "avatarUrl",
    "user.profileImageUrl",
  ]);

  return {
    id: readString(raw, ["id", "_id", "uuid", "barberId"]),
    name: readString(raw, ["name", "nome", "fullName", "full_name", "user.name"], "Barbeiro sem nome"),
    email: readString(raw, ["email", "user.email"]),
    phone: readOptionalString(raw, ["phone", "telefone", "user.phone"]),
    profileImageUrl: resolveApiImageUrl(profileImageUrl),
    specialties: Array.isArray(raw.specialties)
      ? raw.specialties.filter((item): item is string => typeof item === "string")
      : undefined,
    available: readBoolean(raw, ["available", "isAvailable", "disponivel"], true),
  };
}

function normalizeService(raw: UnknownRecord): Service {
  const description = readOptionalString(raw, [
    "description",
    "descricao",
    "descrição",
    "details",
  ]);
  const imagemUrl = readOptionalString(raw, ["imageUrl", "imagemUrl", "imagem_url"]);

  return {
    id: readString(raw, ["id", "_id", "uuid", "serviceId"]),
    barberId: readOptionalString(raw, ["barberId"]),
    name: readString(raw, ["name", "nome", "title", "serviceName"], "Serviço sem nome"),
    description,
    price: readNumber(raw, ["price", "preco", "preço", "valor", "amount"]),
    duration: readNumber(raw, ["duration", "duracao", "minutes"], 0),
    category: readOptionalString(raw, ["category", "categoria"]),
    imagemUrl: resolveApiImageUrl(imagemUrl),
  };
}

function normalizeTimeSlot(raw: UnknownRecord): TimeSlot {
  const dateTime = readString(raw, [
    "startAt",
    "data",
    "date",
    "datetime",
    "dateTime",
    "startAt",
    "start_at",
    "start",
  ]);

  return {
    id: readString(raw, ["id", "_id", "uuid", "timeId"]),
    data: dateTime,
    date: readOptionalString(raw, ["startAt", "date", "data", "datetime", "dateTime", "start_at", "start"]),
    startAt: readOptionalString(raw, ["startAt", "date", "data", "datetime", "dateTime", "start_at", "start"]),
    endAt: readOptionalString(raw, ["endAt", "end", "finishAt"]),
  };
}

export async function getReservas(page = 1, limit = 10): Promise<PaginatedReservas> {
  const { data } = await api.get("/appointment/client-appointments", { 
    params: { page, limit } 
  });
  
  const rawReservas = Array.isArray(data.data) ? data.data : [];
  const reservas = rawReservas.map(normalizeReserva);
  
  return {
    data: reservas,
    total: data.total || 0,
    page: data.page || 1,
    totalPages: data.totalPages || 1,
  };
}

function normalizeReserva(raw: UnknownRecord): Reserva {
  const time = readString(raw, ["time", "scheduledAt", "startAt"], "");
  const endTime = readString(raw, ["endTime", "scheduledEndAt", "endAt"], "");
  const price = readNumber(raw, ["price", "preco"], 0);
  const duration = readNumber(raw, ["duration", "serviceDurationMinutes", "duracao"], 0);
  const serviceNames = Array.isArray(raw.serviceNames) 
    ? raw.serviceNames.filter((n): n is string => typeof n === "string")
    : undefined;

  return {
    id: readString(raw, ["id", "_id"]),
    client: readString(raw, ["client", "clientName", "customerName"]),
    barber: readString(raw, ["barber", "barberName"]),
    barberTelephone: readOptionalString(raw, ["barberTelephone", "barberPhone"]),
    service: readString(raw, ["service", "serviceName"]),
    serviceNames,
    time,
    endTime: endTime || undefined,
    status: (raw.status as ReservaStatus) || "SCHEDULED",
    price: price || undefined,
    duration: duration || undefined,
  };
}

export async function criarReserva(payload: ReservaPayload): Promise<Reserva> {
  try {
    const { data } = await api.post("/appointment/create", payload);
    return data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || "Erro ao criar reserva";
      throw new Error(message);
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}

export async function cancelarReserva(reservaId: string): Promise<void> {
  await api.patch(`/appointment/cancel/${reservaId}`);
}

export async function getBarbers(): Promise<Barber[]> {
  const { data } = await api.get("/barber");
  return toRecordArray(data).map(normalizeBarber);
}

export async function getServices(barberId?: string): Promise<Service[]> {
  const { data } = await api.get("/service", { params: barberId ? { barberId } : undefined });
  return toRecordArray(data).map(normalizeService);
}

export async function getTimesByBarber(barberId: string, serviceIds: string | string[]): Promise<TimeSlot[]> {
  const params: Record<string, string | string[]> = { barberId };
  if (Array.isArray(serviceIds)) {
    params.serviceIds = serviceIds.join(",");
  } else {
    params.serviceIds = serviceIds;
  }
  const { data } = await api.get("/time/", { params });
  return toRecordArray(data).map(normalizeTimeSlot);
}
