import { describe, expect, it } from "vitest";
import { registerSchema } from "../schema";

describe("registerSchema", () => {
  it("rejects names with numbers", () => {
    const result = registerSchema.safeParse({
      name: "Yuri 123",
      email: "yuri@example.com",
      password: "Senha123",
      confirmPassword: "Senha123",
      telephone: "11999999999"
    });
    expect(result.success).toBe(false);
  });

  it("accepts masked whatsapp and normalizes digits", () => {
    const result = registerSchema.safeParse({
      name: "Yuri Pires",
      email: "yuri@example.com",
      password: "Senha123",
      confirmPassword: "Senha123",
      telephone: "(11) 91234-5678"
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.telephone).toBe("11912345678");
    }
  });
});
