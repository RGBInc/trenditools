import { Search, Bot } from "lucide-react";
import { Button } from "./ui/button";

interface ModeToggleProps {
  mode: 'search' | 'ai';
  onModeChange: (mode: 'search' | 'ai') => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex items-center bg-muted p-1 rounded-lg">
      <Button
        variant={mode === 'search' ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange('search')}
        className="flex items-center space-x-2"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search</span>
      </Button>
      <Button
        variant={mode === 'ai' ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange('ai')}
        className="flex items-center space-x-2"
      >
        <Bot className="w-4 h-4" />
        <span className="hidden sm:inline">AI Assistant</span>
      </Button>
    </div>
  );
}
