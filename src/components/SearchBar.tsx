import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, TrendingUp, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export function SearchBar({ onSearch, initialQuery = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const popularSearches = useQuery(api.tools.getPopularSearches);

  // Update local query when initialQuery changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Real-time search as user types (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
      // Update URL for SEO
      const url = new URL(window.location.href);
      if (query.trim()) {
        url.searchParams.set('q', query);
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
    // Update URL for SEO
    const url = new URL(window.location.href);
    if (suggestion.trim()) {
      url.searchParams.set('q', suggestion);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url.toString());
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
    // Update URL for SEO
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    window.history.replaceState({}, '', url.toString());
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
            onFocus={() => {
              setShowSuggestions(true);
              setIsFocused(true);
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 200);
              setIsFocused(false);
            }}
            placeholder="Search for tools..."
            className={`w-full pl-12 pr-12 py-4 text-base bg-background rounded-xl border border-border/40 focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none transition-all duration-300 ease-out dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] ${
              isFocused || query ? 'shadow-lg bg-background/95 border-border/60 dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.08)]' : 'hover:shadow-md hover:border-border/50 dark:hover:shadow-[inset_0_1px_3px_rgba(255,255,255,0.06)]'
            } ${query ? 'ring-1 ring-ring/30' : ''}`}
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {showSuggestions && popularSearches && popularSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover rounded-lg shadow-lg z-10">
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
