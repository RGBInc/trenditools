# Cookie Preferences Storage

## Overview

This document provides detailed technical information about how cookie preferences are stored and managed in TrendiTools.

## Storage Mechanism

### Browser localStorage

Cookie preferences are stored using the browser's `localStorage` API, which provides:

- **Persistence**: Data persists across browser sessions
- **Domain Isolation**: Data is isolated to the TrendiTools domain
- **Client-Side**: No server-side storage of preferences
- **User Control**: Users can clear preferences by clearing browser data

### Storage Key

```javascript
const STORAGE_KEY = 'cookie-consent';
```

### Data Structure

```typescript
interface CookiePreferences {
  essential: boolean;   // Always true, cannot be disabled
  functional: boolean;  // User controllable
  analytics: boolean;   // User controllable
}
```

### Example Stored Data

```json
{
  "essential": true,
  "functional": true,
  "analytics": false
}
```

## Implementation Details

### Setting Preferences

```javascript
const setPreferences = (preferences) => {
  localStorage.setItem('cookie-consent', JSON.stringify(preferences));
};
```

### Reading Preferences

```javascript
const getPreferences = () => {
  const stored = localStorage.getItem('cookie-consent');
  return stored ? JSON.parse(stored) : null;
};
```

### Checking Consent Status

```javascript
const hasConsent = () => {
  return localStorage.getItem('cookie-consent') !== null;
};
```

## Cookie Categories and Storage

### Essential Cookies

**Always Enabled**: Cannot be disabled by users

- Authentication tokens (Convex Auth)
- Session identifiers
- Security tokens
- CSRF protection

**Storage**: These cookies are set regardless of user preferences as they are necessary for basic functionality.

### Functional Cookies

**User Controllable**: Enabled/disabled based on user preference

- Theme preferences (dark/light mode)
- Language settings
- UI state (sidebar collapsed, view mode)
- User interface preferences

**Storage Logic**:
```javascript
if (preferences.functional) {
  // Set functional cookies
  localStorage.setItem('theme', currentTheme);
  localStorage.setItem('viewMode', currentViewMode);
}
```

### Analytics Cookies

**User Controllable**: Enabled/disabled based on user preference

- Usage analytics
- Performance monitoring
- Feature usage tracking
- Error reporting

**Storage Logic**:
```javascript
if (preferences.analytics) {
  // Initialize analytics
  // Set tracking cookies
  // Enable performance monitoring
}
```

## Privacy Considerations

### Data Minimization

- Only store necessary preference data
- No personal information in cookie preferences
- Minimal data structure

### User Control

- Users can change preferences at any time
- Clear mechanism to withdraw consent
- Granular control over cookie categories

### Transparency

- Clear documentation of what is stored
- Accessible privacy policy
- User-friendly consent interface

## Technical Implementation

### Component Integration

**File**: `src/components/CookieConsent.tsx`

```typescript
const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept }) => {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: true,
    analytics: true,
  });

  useEffect(() => {
    const consentGiven = localStorage.getItem('cookie-consent');
    if (!consentGiven) {
      setIsVisible(true);
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
  };
};
```

### App Integration

**File**: `src/App.tsx`

```typescript
const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences | null>(null);

useEffect(() => {
  const stored = localStorage.getItem('cookie-consent');
  if (stored) {
    setCookiePreferences(JSON.parse(stored));
  }
}, []);

const handleCookieConsent = (preferences: CookiePreferences) => {
  setCookiePreferences(preferences);
  // Apply preferences to app behavior
};
```

## Compliance Features

### GDPR Compliance

- **Explicit Consent**: Users must actively consent
- **Granular Control**: Category-level control
- **Withdrawal**: Easy to change preferences
- **Documentation**: Clear information about usage

### CCPA Compliance

- **Opt-Out**: Users can reject non-essential cookies
- **Transparency**: Clear information about data collection
- **User Rights**: Control over personal information

## Maintenance and Updates

### Regular Reviews

- Audit stored data structure
- Review cookie categories
- Update documentation
- Test consent flow

### Version Management

```javascript
const CONSENT_VERSION = '1.0';

const preferences = {
  version: CONSENT_VERSION,
  essential: true,
  functional: boolean,
  analytics: boolean,
  timestamp: Date.now()
};
```

### Migration Strategy

When updating the consent structure:

1. Check for existing consent
2. Migrate to new format if needed
3. Preserve user preferences where possible
4. Re-prompt if significant changes

## Security Considerations

### Data Protection

- No sensitive data in localStorage
- Domain isolation prevents cross-site access
- Regular cleanup of old preferences

### Validation

```javascript
const validatePreferences = (data) => {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.essential !== 'boolean') return false;
  if (typeof data.functional !== 'boolean') return false;
  if (typeof data.analytics !== 'boolean') return false;
  return true;
};
```

## Troubleshooting

### Common Issues

1. **Preferences Not Persisting**
   - Check localStorage availability
   - Verify domain consistency
   - Check for browser privacy settings

2. **Consent Banner Reappearing**
   - Verify localStorage data format
   - Check for data corruption
   - Validate JSON structure

3. **Preferences Not Applied**
   - Check component state updates
   - Verify preference reading logic
   - Test consent callback functions

### Debug Commands

```javascript
// Check current preferences
console.log(localStorage.getItem('cookie-consent'));

// Clear preferences (for testing)
localStorage.removeItem('cookie-consent');

// Set test preferences
localStorage.setItem('cookie-consent', JSON.stringify({
  essential: true,
  functional: false,
  analytics: false
}));
```