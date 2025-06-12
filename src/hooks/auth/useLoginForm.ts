import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginFormValues } from "@/schemas/auth";
import { authService } from "@/services/auth";

export function useLoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await authService.login(data);

      if (result.success) {
        toast.success("Zalogowano pomyślnie");

        if (result.redirectTo) {
          window.location.href = result.redirectTo;
        } else {
          window.location.href = "/flashcards";
        }
      } else {
        toast.error(result.message || "Nieprawidłowe dane logowania");
      }
    } catch (error) {
      if (error instanceof Error && error.message) {
        toast.error(error.message);
      } else {
        toast.error("Wystąpił błąd podczas logowania");
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
