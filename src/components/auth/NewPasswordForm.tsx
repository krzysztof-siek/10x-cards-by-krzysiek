import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useNewPasswordForm } from "@/hooks/auth/useNewPasswordForm";

export function NewPasswordForm() {
  const { form, isLoading, isSubmitted, onSubmit } = useNewPasswordForm();

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-4">
        <h2 className="text-xl font-semibold">Hasło zostało zmienione</h2>
        <p className="text-muted-foreground">
          Twoje hasło zostało pomyślnie zmienione. Możesz teraz zalogować się używając nowego hasła.
        </p>
        <Button className="mt-4" onClick={() => (window.location.href = "/auth/login")}>
          Przejdź do logowania
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold">Ustaw nowe hasło</h2>
            <p className="text-muted-foreground">Wprowadź swoje nowe hasło poniżej.</p>
          </div>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nowe hasło</FormLabel>
                <FormControl>
                  <Input placeholder="••••••••" type="password" {...field} disabled={isLoading} />
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
                  <Input placeholder="••••••••" type="password" {...field} disabled={isLoading} />
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
