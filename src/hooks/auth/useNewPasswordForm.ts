import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { newPasswordSchema, type NewPasswordFormValues } from "@/schemas/auth";
import { authService } from "@/services/auth";

export function useNewPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: NewPasswordFormValues) => {
    setIsLoading(true);
    try {
      const result = await authService.setNewPassword(data);

      if (result.success) {
        toast.success("Hasło zostało zmienione");
        setIsSubmitted(true);
      } else {
        toast.error(result.message || "Błąd podczas zmiany hasła");
      }
    } catch (error) {
      toast.error((error as Error).message || "Wystąpił błąd podczas zmiany hasła");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isSubmitted,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
