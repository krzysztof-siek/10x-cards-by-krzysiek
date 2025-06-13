import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon, FilterIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FlashcardsHeaderProps {
  searchQuery: string;
  onSearchChange: (search: string) => void;
  onAddFlashcard: () => void;
}

export function FlashcardsHeader({ searchQuery, onSearchChange, onAddFlashcard }: FlashcardsHeaderProps) {
  const [inputValue, setInputValue] = useState(searchQuery);
  const [isMobile, setIsMobile] = useState(false);

  // Wykrywanie urządzenia mobilnego
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Sprawdź przy pierwszym renderowaniu
    checkIfMobile();

    // Nasłuchuj zmian rozmiaru okna
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Reset input value when searchQuery prop changes (e.g. when filters are reset)
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchQuery) {
        onSearchChange(inputValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, onSearchChange, searchQuery]);

  return (
    <div className="mb-8 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="relative flex-grow w-full sm:max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Szukaj fiszek..."
          className="pl-9 w-full"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        {/* Dodatkowe filtry dla wersji mobilnej */}
        {isMobile && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <FilterIcon className="h-4 w-4" />
                  <span className="sr-only">Filtry</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onSelect={() => onSearchChange("")}>Wszystkie fiszki</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onSearchChange("source:ai")}>Tylko AI</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onSearchChange("source:manual")}>Tylko ręczne</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Przycisk dodawania widoczny tylko na większych ekranach */}
      <Button onClick={onAddFlashcard} className="px-5 sm:inline-flex hidden">
        <PlusIcon className="mr-2 h-4 w-4" />
        Dodaj fiszkę
      </Button>
    </div>
  );
}
