import { describe, expect, it } from "vitest";
import { needsCurrentPasswordError, passwordChangeSchema } from "../passwordChangeValidation";

describe("passwordChangeValidation", () => {
  it("aceita senha forte com confirmação igual", () => {
    const result = passwordChangeSchema.safeParse({
      currentPassword: "Senha123",
      newPassword: "Nova123",
      confirmPassword: "Nova123",
    });

    expect(result.success).toBe(true);
  });

  it("rejeita senha fraca", () => {
    const result = passwordChangeSchema.safeParse({
      currentPassword: "Senha123",
      newPassword: "fraca",
      confirmPassword: "fraca",
    });

    expect(result.success).toBe(false);
  });

  it("rejeita confirmação diferente da nova senha", () => {
    const result = passwordChangeSchema.safeParse({
      currentPassword: "Senha123",
      newPassword: "Nova123",
      confirmPassword: "Outra123",
    });

    expect(result.success).toBe(false);
  });

  it("exige senha atual apenas quando o usuário já tem senha local", () => {
    expect(needsCurrentPasswordError(true, "")).toBe(true);
    expect(needsCurrentPasswordError(true, "Senha123")).toBe(false);
    expect(needsCurrentPasswordError(false, "")).toBe(false);
  });
});
