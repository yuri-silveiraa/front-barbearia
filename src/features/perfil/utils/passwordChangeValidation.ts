import * as z from "zod";

export const passwordChangeSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Deve conter pelo menos um número"),
  confirmPassword: z.string().min(1, "Confirme a nova senha"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type PasswordChangeForm = z.infer<typeof passwordChangeSchema>;

export function needsCurrentPasswordError(hasPassword: boolean, currentPassword?: string) {
  return hasPassword && !currentPassword?.trim();
}
