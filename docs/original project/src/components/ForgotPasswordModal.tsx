import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Mail, X, CheckCircle } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const requestPasswordReset = useMutation(api.users.requestPasswordReset);

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await requestPasswordReset({ email });
      if (result.success) {
        setIsSubmitted(true);
        toast.success("Password reset instructions sent!");
      }
    } catch (error) {
      toast.error("Failed to send reset email");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setIsSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Reset Password</span>
            </DialogTitle>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </DialogHeader>

        {!isSubmitted ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your email address and we'll send you instructions to reset your password.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your email address"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !email}
                className="flex-1"
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Check Your Email</h3>
              <p className="text-sm text-muted-foreground">
                If an account with <strong>{email}</strong> exists, you will receive password reset instructions shortly.
              </p>
            </div>

            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <p>
                <strong>Note:</strong> This is a demo feature. In a production app, you would receive an actual email with reset instructions.
              </p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
