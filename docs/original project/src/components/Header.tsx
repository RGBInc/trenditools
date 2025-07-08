import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UserButton } from "./UserButton";
import { ThemeToggle } from "./ThemeToggle";
import { SignInForm } from "../SignInForm";
import { Doc } from "../../convex/_generated/dataModel";
import { Search, Bot, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface HeaderProps {
  mode?: 'search' | 'ai';
  onModeChange?: (mode: 'search' | 'ai') => void;
  onViewDetails?: (tool: Doc<"tools">) => void;
  onShowProfile?: () => void;
}

export function Header({ mode = 'search', onModeChange, onViewDetails, onShowProfile }: HeaderProps) {
  const user = useQuery(api.users.get);

  return (
    <header className="bg-background/80 backdrop-blur-md border-b">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                TrendiTools
              </h1>
            </motion.div>

            {/* Mode Toggle - Always visible when user is logged in */}
            {user && onModeChange && (
              <div className="flex items-center bg-muted rounded-lg p-1">
                <button
                  onClick={() => onModeChange('search')}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    mode === 'search'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden md:inline">Search</span>
                </button>
                <button
                  onClick={() => onModeChange('ai')}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    mode === 'ai'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  <span className="hidden md:inline">AI Assistant</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {user ? (
              <UserButton onViewDetails={onViewDetails} onShowProfile={onShowProfile} />
            ) : (
              <div className="text-sm text-muted-foreground">
                Please sign in
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
