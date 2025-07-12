import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UserButton } from "./UserButton";
import { ThemeToggle } from "./ThemeToggle";
import { SignInForm } from "../SignInForm";
import { Doc } from "../../convex/_generated/dataModel";
import { Search, Wrench, Bookmark as BookmarkIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Chatter } from "./Chatter";

interface HeaderProps {
  mode?: 'search' | 'saved';
  onModeChange?: (mode: 'search' | 'saved') => void;
  onShowProfile?: () => void;
}

export function Header({ mode = 'search', onModeChange, onShowProfile }: HeaderProps) {
  const user = useQuery(api.users.get);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <header className="bg-background/80 backdrop-blur-md">
      <div className="w-full px-3 sm:px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <motion.button 
              onClick={handleLogoClick}
              className="cursor-pointer flex-shrink-0"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <motion.div
                  animate={{
                    rotate: [0, 15, -10, 12, -8, 10, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut"
                  }}
                >
                  <Wrench className="w-6 h-6 text-foreground" />
                </motion.div>
              </div>
            </motion.button>
            <Chatter className="flex-1 min-w-0" />
          </div>

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

          <div className="flex items-center space-x-1 sm:space-x-3">
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
