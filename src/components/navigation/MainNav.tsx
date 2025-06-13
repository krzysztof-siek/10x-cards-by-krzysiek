import { Button } from "@/components/ui/button";
import { tryIsFeatureEnabled } from "@/features/featureFlags";
import { BookOpen, Plus, Brain } from "lucide-react";

export function MainNav() {
  const isPracticeEnabled = tryIsFeatureEnabled("practice.view");
  const isGenerateEnabled = tryIsFeatureEnabled("generate.view");
  const isFlashcardsEnabled = tryIsFeatureEnabled("flashcards.view");

  return (
    <nav className="flex items-center space-x-4">
      {isFlashcardsEnabled && (
        <Button variant="ghost" asChild>
          <a href="/flashcards">
            <BookOpen className="h-4 w-4 mr-2" />
            Fiszki
          </a>
        </Button>
      )}

      {isPracticeEnabled && (
        <Button variant="ghost" asChild>
          <a href="/practice">
            <Brain className="h-4 w-4 mr-2" />
            Ćwiczenia
          </a>
        </Button>
      )}

      {isGenerateEnabled && (
        <Button variant="ghost" asChild>
          <a href="/generate">
            <Plus className="h-4 w-4 mr-2" />
            Generuj
          </a>
        </Button>
      )}
    </nav>
  );
}
