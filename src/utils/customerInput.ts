import { formatName } from "./formatName";

export function onlyLettersAndSpaces(value: string): string {
  return value.replace(/[^\p{L}\s.'-]/gu, "").replace(/\s+/g, " ");
}

export function normalizeCustomerName(value: string): string {
  return formatName(onlyLettersAndSpaces(value));
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatWhatsapp(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  const ddd = digits.slice(0, 2);
  const prefix = digits.slice(2, 7);
  const suffix = digits.slice(7, 11);

  if (digits.length <= 2) return ddd ? `(${ddd}` : "";
  if (digits.length <= 7) return `(${ddd}) ${prefix}`;
  return `(${ddd}) ${prefix}-${suffix}`;
}

export function formatWhatsappDisplay(value?: string | null): string {
  const digits = onlyDigits(value ?? "");
  const nationalDigits = digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits;
  return formatWhatsapp(nationalDigits);
}

export function buildWhatsappUrl(value?: string | null): string | null {
  const digits = onlyDigits(value ?? "");
  if (digits.length < 10) return null;
  const phone = digits.startsWith("55") && digits.length > 11 ? digits : `55${digits}`;
  return `https://wa.me/${phone}`;
}
