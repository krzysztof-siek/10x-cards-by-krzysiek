import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLoginForm } from "@/hooks/auth/useLoginForm";

export function LoginForm() {
  const { form, isLoading, onSubmit } = useLoginForm();

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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logowanie..." : "Zaloguj się"}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Nie masz jeszcze konta?{" "}
          <a href="/auth/register" className="text-primary hover:underline">
            Zarejestruj się
          </a>
        </p>
      </div>
    </div>
  );
}
