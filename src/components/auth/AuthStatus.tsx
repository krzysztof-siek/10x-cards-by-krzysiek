import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { AuthResponseDTO } from "@/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { tryIsFeatureEnabled } from "@/features/featureFlags";

interface AuthStatusProps {
  user?: {
    email: string;
  } | null;
}

export function AuthStatus({ user }: AuthStatusProps) {
  const isLoginEnabled = tryIsFeatureEnabled("auth.login");
  const isRegisterEnabled = tryIsFeatureEnabled("auth.register");

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = (await response.json()) as AuthResponseDTO;

      if (response.ok && result.success) {
        toast.success("Wylogowano pomyślnie");

        // Przekierowanie na stronę główną
        if (result.redirectTo) {
          window.location.href = result.redirectTo;
        } else {
          window.location.href = "/";
        }
      } else {
        toast.error(result.message || "Wystąpił błąd podczas wylogowywania");
      }
    } catch {
      toast.error("Wystąpił błąd podczas wylogowywania");
    }
  };

  if (!user) {
    if (!isLoginEnabled) {
      return null;
    }
    return (
      <div className="flex gap-2">
        <Button variant="ghost" asChild>
          <a href="/auth/login">Zaloguj się</a>
        </Button>
        {isRegisterEnabled && (
          <Button asChild>
            <a href="/auth/register">Zarejestruj się</a>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{user.email}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="sr-only">Wyloguj się</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Wyloguj się</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
