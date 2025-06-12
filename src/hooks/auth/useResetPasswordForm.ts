import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/schemas/auth";
import { authService } from "@/services/auth";

export function useResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      const result = await authService.resetPassword(data);

      if (result.success) {
        toast.success("Link do resetowania hasła został wysłany");
        setIsSubmitted(true);
      } else {
        toast.error(result.message || "Błąd podczas wysyłania linku resetującego");
      }
    } catch (error) {
      toast.error((error as Error).message || "Wystąpił błąd podczas resetowania hasła");
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
