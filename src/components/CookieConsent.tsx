import React, { useState, useEffect } from 'react';
import { X, Cookie, Settings } from 'lucide-react';

interface CookieConsentProps {
  onAccept: (preferences: CookiePreferences) => void;
}

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    functional: true,
    analytics: true,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consentGiven = localStorage.getItem('cookie-consent');
    if (!consentGiven) {
      // Show banner after legal maximum delay (30 seconds)
      const timer = setTimeout(() => setIsVisible(true), 30000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true,
    };
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    onAccept(allAccepted);
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    onAccept(preferences);
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    const essentialOnly = {
      essential: true,
      functional: false,
      analytics: false,
    };
    localStorage.setItem('cookie-consent', JSON.stringify(essentialOnly));
    onAccept(essentialOnly);
    setIsVisible(false);
  };

  const handlePreferenceChange = (type: keyof CookiePreferences, value: boolean) => {
    if (type === 'essential') return; // Essential cookies cannot be disabled
    setPreferences(prev => ({ ...prev, [type]: value }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="bg-background rounded-lg shadow-2xl border border-border max-w-md w-full pointer-events-auto transform transition-all duration-300 ease-in-out">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Cookie className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Cookie Preferences</h3>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <p className="text-muted-foreground text-sm mb-4">
            I use cookies to enhance your experience, provide personalized content, and analyze my traffic. 
            You can customize your preferences below.
          </p>
          
          {showDetails && (
            <div className="space-y-4 mb-6 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Essential Cookies</h4>
                  <p className="text-xs text-muted-foreground">Required for basic functionality</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.essential}
                  disabled
                  className="rounded border-input text-primary focus:ring-primary opacity-50"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Functional Cookies</h4>
                  <p className="text-xs text-muted-foreground">Remember your preferences</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) => handlePreferenceChange('functional', e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Analytics Cookies</h4>
                  <p className="text-xs text-muted-foreground">Help me improve my service</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary"
                />
              </div>
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            {!showDetails ? (
              <>
                <button
                  onClick={handleAcceptAll}
                  className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors font-medium"
                >
                  Accept All Cookies
                </button>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowDetails(true)}
                    className="flex-1 bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/80 transition-colors text-sm flex items-center justify-center space-x-1"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Customize</span>
                  </button>
                  
                  <button
                    onClick={handleRejectNonEssential}
                    className="flex-1 bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/80 transition-colors text-sm"
                  >
                    Reject All
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={handleAcceptSelected}
                  className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors font-medium"
                >
                  Save Preferences
                </button>
                
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-full bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/80 transition-colors text-sm"
                >
                  Back to Simple View
                </button>
              </>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Learn more in my{' '}
            <a href="/cookies" className="text-primary hover:text-primary/80 underline">
              Cookie Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;