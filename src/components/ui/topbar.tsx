import React from "react";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { MainNav } from "@/components/navigation/MainNav";

interface TopbarProps {
  user?: {
    email: string;
  } | null;
}

export function Topbar({ user }: TopbarProps) {
  return (
    <div className="border-b bg-background">
      <div className="container max-w-8xl mx-auto px-2 py-3 flex items-center justify-between">
        <a href="/" className="text-xl font-bold hover:opacity-80 transition-opacity">
          10x-cards-by-Krzysiek
        </a>
        <div className="flex items-center gap-4">
          {user && <MainNav />}
          <AuthStatus user={user} />
        </div>
      </div>
    </div>
  );
}
