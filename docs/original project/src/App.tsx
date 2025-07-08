import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { Toaster } from "sonner";
import { SearchEngine } from "./components/SearchEngine";
import { ThemeProvider } from "./components/ThemeProvider";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <main className="flex-1">
          <Content />
        </main>
        <Toaster position="top-center" theme="system" richColors />
      </div>
    </ThemeProvider>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground animate-pulse" />
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
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
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Welcome to TrendiTools
                </h1>
                <p className="text-base md:text-lg text-muted-foreground">
                  Discover and search thousands of digital tools with AI assistance.
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
