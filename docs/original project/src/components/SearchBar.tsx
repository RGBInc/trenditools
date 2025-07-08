import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, TrendingUp } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const popularSearches = useQuery(api.tools.getPopularSearches);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search for tools..."
            className="w-full pl-12 pr-4 py-4 text-base border bg-background rounded-xl focus:ring-2 focus:ring-ring focus:outline-none transition-shadow"
          />
        </div>
      </form>

      {showSuggestions && popularSearches && popularSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover rounded-lg shadow-lg border z-10">
          <div className="p-3">
            <h4 className="text-xs font-semibold text-muted-foreground px-2 py-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-2" />
              Popular Searches
            </h4>
            <div className="mt-2 space-y-1">
              {popularSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="w-full text-left px-2 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
