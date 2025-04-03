import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar = ({
  onSearch,
  placeholder = "Rechercher des articles...",
  className = "",
}: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex w-full max-w-md ${className}`}>
      <Input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="rounded-r-none"
      />
      <Button 
        type="submit" 
        variant="secondary" 
        className="rounded-l-none"
      >
        <Search className="h-4 w-4 mr-2" />
        Rechercher
      </Button>
    </form>
  );
}; 