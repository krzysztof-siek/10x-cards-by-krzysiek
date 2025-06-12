import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth";
import { authService } from "@/services/auth";

export function useRegisterForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await authService.register(data);

      if (result.success) {
        toast.success("Zarejestrowano pomyślnie");

        if (result.redirectTo) {
          window.location.href = result.redirectTo;
        } else {
          window.location.href = "/flashcards";
        }
      } else {
        toast.error(result.message || "Wystąpił błąd podczas rejestracji");
      }
    } catch (error) {
      if (error instanceof Error && error.message) {
        toast.error(error.message);
      } else {
        toast.error("Wystąpił błąd podczas rejestracji");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
