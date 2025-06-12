import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRegisterForm } from "@/hooks/auth/useRegisterForm";

export function RegisterForm() {
  const { form, isLoading, onSubmit } = useRegisterForm();

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel data-error={!!fieldState.error}>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="twoj@email.com"
                    type="email"
                    {...field}
                    disabled={isLoading}
                    aria-invalid={!!fieldState.error}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel data-error={!!fieldState.error}>Hasło</FormLabel>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    {...field}
                    disabled={isLoading}
                    aria-invalid={!!fieldState.error}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel data-error={!!fieldState.error}>Powtórz hasło</FormLabel>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    {...field}
                    disabled={isLoading}
                    aria-invalid={!!fieldState.error}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Rejestracja..." : "Zarejestruj się"}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Masz już konto?{" "}
          <a href="/auth/login" className="text-primary hover:underline">
            Zaloguj się
          </a>
        </p>
      </div>
    </div>
  );
}
