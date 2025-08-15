"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ForgotPasswordModal } from "./components/ForgotPasswordModal";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);
    formData.set("flow", flow);
    
    try {
      await signIn("password", formData);
    } catch (error: any) {
      let toastTitle = "";
      if (error.message.includes("Invalid password")) {
        toastTitle = "Invalid password. Please try again.";
      } else {
        toastTitle =
          flow === "signIn"
            ? "Could not sign in, did you mean to sign up?"
            : "Could not sign up, did you mean to sign in?";
      }
      toast.error(toastTitle);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">
            {flow === "signIn" ? "Sign In" : "Sign Up"}
          </h2>
        </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium" 
                disabled={submitting || !email || !password}
              >
                {submitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>{flow === "signIn" ? "Signing in..." : "Creating account..."}</span>
                  </div>
                ) : (
                  flow === "signIn" ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>

            {/* Toggle Flow */}
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                {flow === "signIn"
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                  className="ml-1 text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
                >
                  {flow === "signIn" ? "Sign up" : "Sign in"}
                </button>
              </p>
              
              {/* Forgot Password Link */}
              {flow === "signIn" && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  Forgot your password?
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Anonymous Sign In */}
            <Button 
              variant="outline" 
              onClick={() => void signIn("anonymous")}
              className="w-full h-11 text-base font-medium"
            >
              Continue as Guest
            </Button>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link 
              to="/terms" 
              className="text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              Terms of Service
            </Link>
            {" "}and{" "}
            <Link 
              to="/privacy" 
              className="text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              Privacy Policy
            </Link>
          </p>

        {/* Forgot Password Modal */}
        <ForgotPasswordModal
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
        />
      </div>
    </div>
  );
}
