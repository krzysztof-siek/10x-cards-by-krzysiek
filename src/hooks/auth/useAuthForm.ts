import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ZodType } from "zod";
import type { UseFormReturn, FieldValues } from "react-hook-form";
import type { AuthResponseDTO } from "@/types";

interface UseAuthFormOptions<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<AuthResponseDTO>;
  successMessage?: string;
  redirectTo?: string;
}

interface UseAuthFormReturn<T extends FieldValues> {
  form: UseFormReturn<T>;
  isLoading: boolean;
  isSubmitted: boolean;
  handleSubmit: (data: T) => Promise<void>;
}

export function useAuthForm<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  successMessage = "Operacja zakończona pomyślnie",
  redirectTo,
}: UseAuthFormOptions<T>): UseAuthFormReturn<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = async (data: T) => {
    setIsLoading(true);
    try {
      const result = await onSubmit(data);

      if (result.success) {
        toast.success(successMessage);
        setIsSubmitted(true);

        if (redirectTo || result.redirectTo) {
          window.location.href = redirectTo || result.redirectTo || "/";
        }
      } else {
        toast.error(result.message || "Wystąpił błąd");
      }
    } catch (error) {
      toast.error((error as Error).message || "Wystąpił nieoczekiwany błąd");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isSubmitted,
    handleSubmit: form.handleSubmit(handleSubmit),
  };
}
