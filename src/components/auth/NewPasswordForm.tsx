import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
      .regex(/\d/, "Hasło musi zawierać co najmniej jedną cyfrę")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Hasło musi zawierać co najmniej jeden znak specjalny"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są zgodne",
    path: ["confirmPassword"],
  });

type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;

export function NewPasswordForm() {
  const form = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  async function onSubmit(data: NewPasswordFormValues) {
    setIsLoading(true);
    try {
      // This is just a placeholder for future backend implementation
      // We'll need to extract the token from the URL for the actual implementation
      console.log("New password data:", data);
      setIsSubmitted(true);
      toast.success("Hasło zostało zmienione");
    } catch (error) {
      console.error("New password error:", error);
      toast.error("Błąd podczas zmiany hasła");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-4">
        <h2 className="text-xl font-semibold">Hasło zostało zmienione</h2>
        <p className="text-muted-foreground">
          Twoje hasło zostało pomyślnie zmienione. Możesz teraz zalogować się
          używając nowego hasła.
        </p>
        <Button
          className="mt-4"
          onClick={() => window.location.href = "/auth/login"}
        >
          Przejdź do logowania
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold">Ustaw nowe hasło</h2>
            <p className="text-muted-foreground">
              Wprowadź swoje nowe hasło poniżej.
            </p>
          </div>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nowe hasło</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="••••••••" 
                    type="password" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Powtórz hasło</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="••••••••" 
                    type="password" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Zapisywanie..." : "Zapisz nowe hasło"}
          </Button>
        </form>
      </Form>
    </div>
  );
} 