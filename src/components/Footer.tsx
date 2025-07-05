import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronUp } from "lucide-react";

// Twitter and Bluesky SVG icons
const TwitterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const BlueskyIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 2.104.139 3.25.139 5.233.139 5.233s.278 1.988 1.319 4.37C2.139 11.5 4.134 11.5 4.134 11.5s.902-1.988 2.319-3.125c1.417-1.137 3.125-1.137 3.125-1.137s1.708 0 3.125 1.137c1.417 1.137 2.319 3.125 2.319 3.125s1.995 0 2.676-1.897c1.041-2.382 1.319-4.37 1.319-4.37s0-1.983-.763-3.129c-.659-.838-1.664-1.16-4.3.701C15.046 4.747 13.087 8.686 12 10.8z"/>
    <path d="M12 13.2c1.087 2.114 4.046 6.053 6.798 7.995 2.636 1.861 3.641 1.539 4.3.701.763-1.146.763-3.129.763-3.129s-.278-1.988-1.319-4.37C21.861 12.5 19.866 12.5 19.866 12.5s-.902 1.988-2.319 3.125c-1.417 1.137-3.125 1.137-3.125 1.137s-1.708 0-3.125-1.137C10.88 14.488 9.978 12.5 9.978 12.5s-1.995 0-2.676 1.897c-1.041 2.382-1.319 4.37-1.319 4.37s0 1.983.763 3.129c.659.838 1.664 1.16 4.3-.701C13.954 19.253 15.913 15.314 12 13.2z"/>
  </svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background/50 backdrop-blur-sm">
      <div className="w-full px-3 sm:px-4 lg:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              © {currentYear} TrendiTools. All rights reserved.
            </span>
          </div>
          
          <div className="flex items-center space-x-6">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <span>Legal</span>
                <ChevronUp className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <a href="/terms" className="cursor-pointer">Terms of Service</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/privacy" className="cursor-pointer">Privacy Policy</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/cookies" className="cursor-pointer">Cookie Policy</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <a 
              href="https://twitter.com/trenditools" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Follow us on Twitter"
            >
              <TwitterIcon />
            </a>
            
            <a 
              href="https://bsky.app/profile/trenditools.bsky.social" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Follow us on Bluesky"
            >
              <BlueskyIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
