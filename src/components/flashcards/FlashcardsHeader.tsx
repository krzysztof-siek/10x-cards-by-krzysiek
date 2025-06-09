import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon } from "lucide-react";

interface FlashcardsHeaderProps {
  searchQuery: string;
  onSearchChange: (search: string) => void;
  onAddFlashcard: () => void;
}

export function FlashcardsHeader({
  searchQuery,
  onSearchChange,
  onAddFlashcard,
}: FlashcardsHeaderProps) {
  const [inputValue, setInputValue] = useState(searchQuery);
  
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
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Szukaj fiszek..."
          className="pl-8"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>
      <Button onClick={onAddFlashcard}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Dodaj fiszkę
      </Button>
    </div>
  );
} 