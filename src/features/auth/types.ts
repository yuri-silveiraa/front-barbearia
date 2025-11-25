import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(4, "A senha deve ter pelo menos 4 caracteres"),
});

export type LoginData = z.infer<typeof loginSchema>;
