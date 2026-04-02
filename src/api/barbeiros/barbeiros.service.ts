import { api } from "../http";
import type { BarberAdmin, CreateBarberPayload } from "../../features/barbeiros/types";

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

function readBoolean(source: UnknownRecord, paths: string[], fallback = false): boolean {
  const value = readFromPaths(source, paths);

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "sim"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no", "nao", "não"].includes(normalized)) {
      return false;
    }
  }

  return fallback;
}

function normalizeBarberAdmin(raw: UnknownRecord): BarberAdmin {
  return {
    id: readString(raw, ["id", "barberId", "_id", "uuid"]),
    userId: readString(raw, ["userId", "user_id", "user.id"]),
    nome: readString(raw, ["nome", "name", "user.name"], "Barbeiro sem nome"),
    isAdmin: readBoolean(raw, ["isAdmin", "admin"], false),
    isActive: readBoolean(raw, ["isActive", "active"], true),
    createdAt: readString(raw, ["createdAt", "created_at"]),
  };
}

export async function getBarbersAdmin(): Promise<BarberAdmin[]> {
  const { data } = await api.get("/barber");
  return toRecordArray(data).map(normalizeBarberAdmin);
}

export async function createBarber(payload: CreateBarberPayload): Promise<void> {
  await api.post("/barber", {
    name: payload.nome,
    email: payload.email,
    password: payload.senha,
    telephone: payload.telefone,
    isAdmin: payload.isAdmin ?? false,
  });
}

export async function deactivateBarber(userId: string): Promise<void> {
  await api.delete(`/barber/${userId}`);
}
