import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook that scrolls to the top of the page whenever the route changes.
 * This ensures a consistent user experience where each new page starts from the top.
 */
export function useScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname, search]);
}

/**
 * Hook for manual scroll to top with smooth animation
 */
export function useScrollToTopManual() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  return scrollToTop;
}