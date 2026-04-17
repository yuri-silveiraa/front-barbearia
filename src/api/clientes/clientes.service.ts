import { api } from "../http";
import type { AdminCustomer } from "../../features/clientes/types";

type UnknownRecord = Record<string, unknown>;

function isObject(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function toRecordArray(value: unknown): UnknownRecord[] {
  if (Array.isArray(value)) return value.filter(isObject);
  if (!isObject(value)) return [];
  const nested = Object.values(value).find(Array.isArray);
  return Array.isArray(nested) ? nested.filter(isObject) : [];
}

function readString(source: UnknownRecord, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
  }
  return fallback;
}

function readOptionalString(source: UnknownRecord, keys: string[]): string | null {
  const value = readString(source, keys);
  return value || null;
}

function readNumber(source: UnknownRecord, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && Number.isFinite(Number(value))) return Number(value);
  }
  return fallback;
}

function normalizeCustomer(raw: UnknownRecord): AdminCustomer {
  return {
    id: readString(raw, ["id"]),
    name: readString(raw, ["name", "nome"], "Cliente sem nome"),
    whatsapp: readString(raw, ["whatsapp", "telefone", "phone"]),
    userId: readOptionalString(raw, ["userId"]),
    email: readOptionalString(raw, ["email"]),
    noShowCount: readNumber(raw, ["noShowCount", "faltas"]),
    totalAppointments: readNumber(raw, ["totalAppointments", "agendamentos"]),
    blockedAt: readOptionalString(raw, ["blockedAt"]),
    blockedReason: readOptionalString(raw, ["blockedReason"]),
    blockedByBarberId: readOptionalString(raw, ["blockedByBarberId"]),
    createdAt: readString(raw, ["createdAt"]),
    updatedAt: readString(raw, ["updatedAt"]),
  };
}

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  const { data } = await api.get("/barber/customers");
  return toRecordArray(data).map(normalizeCustomer);
}

export async function blockCustomer(customerId: string, reason?: string): Promise<void> {
  await api.patch(`/barber/customers/${customerId}/block`, { reason });
}

export async function unblockCustomer(customerId: string): Promise<void> {
  await api.patch(`/barber/customers/${customerId}/unblock`);
}
