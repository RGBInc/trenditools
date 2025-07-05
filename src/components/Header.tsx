import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UserButton } from "./UserButton";
import { ThemeToggle } from "./ThemeToggle";
import { SignInForm } from "../SignInForm";
import { Doc } from "../../convex/_generated/dataModel";
import { Search, Bot, Wrench, Bookmark as BookmarkIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  mode?: 'search' | 'ai' | 'saved';
  onModeChange?: (mode: 'search' | 'ai' | 'saved') => void;
  onShowProfile?: () => void;
}

export function Header({ mode = 'search', onModeChange, onShowProfile }: HeaderProps) {
  const user = useQuery(api.users.get);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="bg-background/80 backdrop-blur-md">
      <div className="w-full px-3 sm:px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.button 
            onClick={handleLogoClick}
            className="flex items-center space-x-1 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              TrendiTools
            </h1>
          </motion.button>

          {/* Mode Toggle - Centered on desktop */}
          {user && onModeChange && (
            <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:flex items-center bg-muted rounded-lg p-1">
              <button
                onClick={() => onModeChange('search')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mode === 'search'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
              <button
                onClick={() => onModeChange('ai')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mode === 'ai'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>Assistant</span>
              </button>
              <button
                onClick={() => onModeChange('saved')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mode === 'saved'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BookmarkIcon className="w-4 h-4" />
                <span>Saved</span>
              </button>
            </div>
          )}

          {/* Mobile Mode Toggle */}
          {user && onModeChange && (
            <div className="flex lg:hidden items-center bg-muted rounded-lg p-1">
              <button
                onClick={() => onModeChange('search')}
                className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mode === 'search'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
              <button
                onClick={() => onModeChange('ai')}
                className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mode === 'ai'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span className="hidden sm:inline">Assistant</span>
              </button>
              <button
                onClick={() => onModeChange('saved')}
                className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mode === 'saved'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BookmarkIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Saved</span>
              </button>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {user ? (
              <UserButton onShowProfile={onShowProfile} />
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
