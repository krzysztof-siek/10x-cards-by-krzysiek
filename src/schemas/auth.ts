import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Hasło musi mieć minimum 8 znaków")
  .regex(/[A-Z]/, "Hasło musi zawierać przynajmniej jedną wielką literę")
  .regex(/[0-9]/, "Hasło musi zawierać przynajmniej jedną cyfrę")
  .regex(/[^A-Za-z0-9]/, "Hasło musi zawierać przynajmniej jeden znak specjalny");

export const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Nieprawidłowy format adresu email"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email"),
});

export const newPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;
