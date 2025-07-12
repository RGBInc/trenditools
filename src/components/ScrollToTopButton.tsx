import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * A floating scroll-to-top button that appears when the user scrolls down.
 * Provides smooth scrolling back to the top of the page.
 * 
 * Design principles:
 * - Appears only when needed (after scrolling down)
 * - Fixed position in bottom-right corner for easy thumb access
 * - Smooth animations for better UX
 * - Accessible with proper ARIA labels
 */
export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when user has scrolled down 300px
      // This threshold ensures the button appears when users have scrolled enough
      // to benefit from a quick return to top
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', toggleVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        // Base styles - minimal and sleek
        'fixed bottom-4 md:bottom-16 right-4 md:right-6 z-40',
        'w-10 h-10 rounded-full',
        'bg-background/80 backdrop-blur-sm border border-border/50',
        'text-muted-foreground hover:text-foreground',
        'shadow-sm hover:shadow-md',
        'transition-all duration-200 ease-out',
        'flex items-center justify-center',
        'hover:scale-105 active:scale-95',
        'hover:bg-background/90',
        // Focus styles for accessibility
        'focus:outline-none focus:ring-1 focus:ring-primary/50',
        // Visibility animation - subtle
        isVisible
          ? 'opacity-70 hover:opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-1 pointer-events-none'
      )}
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <ChevronUp className="w-4 h-4" strokeWidth={2.5} />
    </button>
  );
}

/**
 * Design rationale:
 * 
 * 1. **Visibility threshold (300px)**: This ensures the button only appears when users
 *    have scrolled enough to benefit from it, avoiding visual clutter on short pages.
 * 
 * 2. **Bottom-right positioning**: Follows mobile-first design principles where the
 *    bottom-right corner is easily accessible by the user's thumb.
 * 
 * 3. **Smooth animations**: The opacity and transform transitions provide visual
 *    feedback and make the interaction feel polished.
 * 
 * 4. **Hover effects**: Scale animations provide immediate feedback that the button
 *    is interactive.
 * 
 * 5. **Accessibility**: Proper ARIA labels and focus states ensure the button is
 *    usable by screen readers and keyboard navigation.
 * 
 * 6. **Performance**: Passive scroll listener prevents blocking the main thread
 *    during scroll events.
 */