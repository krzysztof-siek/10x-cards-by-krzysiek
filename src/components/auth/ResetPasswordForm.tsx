import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useResetPasswordForm } from "@/hooks/auth/useResetPasswordForm";

export function ResetPasswordForm() {
  const { form, isLoading, isSubmitted, onSubmit } = useResetPasswordForm();

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-4">
        <h2 className="text-xl font-semibold">Sprawdź swoją skrzynkę email</h2>
        <p className="text-muted-foreground">
          Wysłaliśmy link do resetowania hasła na adres {form.getValues().email}. Sprawdź swoją skrzynkę odbiorczą i
          kliknij w link, aby zresetować hasło.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => (window.location.href = "/auth/login")}>
          Powrót do logowania
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold">Resetowanie hasła</h2>
            <p className="text-muted-foreground">Podaj swój adres email, a wyślemy Ci link do resetowania hasła.</p>
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="twoj@email.com" type="email" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Wysyłanie..." : "Wyślij link resetujący"}
          </Button>
        </form>
      </Form>
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          <a href="/auth/login" className="text-primary hover:underline">
            Powrót do logowania
          </a>
        </p>
      </div>
    </div>
  );
}
