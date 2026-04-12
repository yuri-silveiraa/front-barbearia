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
