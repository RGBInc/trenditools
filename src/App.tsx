import { useQuery } from "convex/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { Routes, Route, useLocation } from "react-router-dom";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { Toaster } from "sonner";
import { SearchEngine } from "./components/SearchEngine";
import { ThemeProvider } from "./components/ThemeProvider";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import CookieConsent from "./components/CookieConsent";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import { useScrollToTop } from "./hooks/useScrollToTop";
import { ScrollToTopButton } from "./components/ScrollToTopButton";
import { Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function App() {
  const [cookiePreferences, setCookiePreferences] = useState(null);
  
  // Enable scroll-to-top on route changes
  useScrollToTop();
  
  const handleCookieConsent = (preferences: any) => {
    setCookiePreferences(preferences);
    // Here you can implement analytics tracking based on preferences
    if (preferences.analytics) {
      // Initialize analytics
      console.log('Analytics enabled');
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Content />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/cookies" element={<CookiePolicy />} />
          </Routes>
        </main>
        <CookieConsent onAccept={handleCookieConsent} />
        <ScrollToTopButton />
        <Toaster position="top-center" theme="system" richColors />
      </div>
    </ThemeProvider>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  // Loading state while checking user authentication
  // Shows an animated wrench icon that simulates unscrewing motion
  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center space-y-4">
          {/* Tool icon container with gradient background */}
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
            {/* Animated wrench that rotates counter-clockwise with scaling effect */}
            {/* Simulates the motion of unscrewing a bolt or component */}
            <motion.div
              animate={{
                // Counter-clockwise rotation in 45-degree increments
                rotate: [0, -45, -90, -135, -180, -225, -270, -315, -360],
                // Subtle scaling effect to simulate pressure/release during unscrewing
                scale: [1, 1.1, 1, 1.1, 1, 1.1, 1, 1.1, 1]
              }}
              transition={{
                duration: 2, // Complete rotation cycle takes 2 seconds
                repeat: Infinity, // Continuous animation
                ease: "easeInOut" // Smooth acceleration/deceleration
              }}
            >
              <Wrench className="w-8 h-8 text-muted-foreground" />
            </motion.div>
          </div>
          <p className="text-muted-foreground">Loading TrendiTools...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Authenticated>
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">
            <SearchEngine />
          </div>
          <Footer />
        </div>
      </Authenticated>

      <Unauthenticated>
        <div className="min-h-screen flex flex-col">
          <Header />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex items-center justify-center px-4 py-12"
          >
            <div className="max-w-md w-full space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center space-y-2"
              >
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Welcome to TrendiTools
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Discover and search thousands of digital tools with intelligent assistance.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-card border rounded-xl p-6 md:p-8 shadow-lg"
              >
                <SignInForm />
              </motion.div>
            </div>
          </motion.div>
          <Footer />
        </div>
      </Unauthenticated>
    </>
  );
}
