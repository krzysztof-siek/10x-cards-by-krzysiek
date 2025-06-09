import React from "react";
import { Button } from "./button";

export function Topbar() {
  return (
    <div className="border-b bg-background">
      <div className="container max-w-8xl mx-auto px-2 py-3 flex items-center justify-between">
        <a href="/" className="text-xl font-bold hover:opacity-80 transition-opacity">
          10x-cards
        </a>
        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <a href="/generate">Generator</a>
          </Button>
          <Button variant="ghost" asChild>
            <a href="/flashcards">Fiszki</a>
          </Button>
        </div>
      </div>
    </div>
  );
} 