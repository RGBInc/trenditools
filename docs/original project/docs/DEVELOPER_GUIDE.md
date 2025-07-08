# TrendiTools Developer Guide

**Essential guide for developers working on TrendiTools**

This comprehensive guide will help you understand, modify, and extend the TrendiTools application effectively. Read this document thoroughly before making any changes.

## 🎯 Project Overview

TrendiTools is a modern web application for discovering and managing digital tools, built with:
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Convex (real-time database + serverless functions)
- **Authentication**: Convex Auth with email/password and anonymous options
- **AI**: OpenAI GPT-4 integration for tool recommendations
- **Deployment**: Convex hosting with Vite development server

## 🏗️ Architecture Overview

### Frontend Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (buttons, dialogs, etc.)
│   ├── prompt-kit/      # AI chat interface components
│   └── *.tsx            # Feature-specific components
├── lib/                 # Utility functions
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles and Tailwind config
```

### Backend Structure
```
convex/
├── _generated/          # Auto-generated Convex files (DO NOT EDIT)
├── auth.config.ts       # Auth configuration (DO NOT EDIT)
├── auth.ts              # Auth functions (DO NOT EDIT)
├── http.ts              # HTTP handlers (DO NOT EDIT)
├── schema.ts            # Database schema
├── tools.ts             # Tool-related functions
├── users.ts             # User-related functions
├── chat.ts              # AI chat functions
└── router.ts            # Custom HTTP routes
```

## 🚨 Critical Rules & Constraints

### Files You MUST NOT Modify
1. **`convex/auth.config.ts`** - Convex Auth configuration
2. **`convex/auth.ts`** - Authentication functions
3. **`convex/http.ts`** - HTTP handlers (unless explicitly needed)
4. **`src/SignInForm.tsx`** - Authentication form
5. **`src/SignOutButton.tsx`** - Sign out functionality
6. **`src/main.tsx`** - Application entry point
7. **`convex/_generated/`** - Auto-generated files

### Schema Modification Rules
- **ONLY modify `applicationTables`** in `convex/schema.ts`
- **NEVER modify `authTables`** - this will break authentication
- **Always include `...authTables`** in the `defineSchema` call
- **Use proper validators** for all fields (see Convex guidelines)

### Convex Function Guidelines
- **Always use argument validators** - Every function needs `args: { ... }`
- **Use new function syntax** - `export const func = query({ args: {}, handler: async (ctx, args) => {} })`
- **Proper function references** - Use `api.module.function` or `internal.module.function`
- **Authentication checks** - Use `getAuthUserId(ctx)` for user identification

## 🔧 Development Workflow

### 1. Setting Up Development Environment
```bash
# Install dependencies
npm install

# Start Convex development server
npx convex dev

# In another terminal, start Vite
npm run dev
```

### 2. Making Changes
1. **Always read current code** before modifying
2. **Use the `view` tool** to understand existing implementations
3. **Test changes locally** before deploying
4. **Update documentation** when adding features

### 3. Deployment Process
1. **Deploy Convex functions** - `npx convex deploy`
2. **Deploy frontend** - Handled automatically by the deploy tool
3. **Test in production** - Verify all features work correctly

## 🎨 UI/UX Guidelines

### Design System
- **Colors**: Uses CSS custom properties for theming
- **Typography**: Tailwind's default font stack
- **Spacing**: Consistent spacing using Tailwind classes
- **Components**: Reusable components in `src/components/ui/`

### Animation Guidelines
- **Use Framer Motion** for all animations
- **Keep animations subtle** - enhance UX, don't distract
- **Consistent timing** - Use similar duration/easing across components
- **Respect user preferences** - Consider `prefers-reduced-motion`

### Responsive Design
- **Mobile-first approach** - Design for mobile, enhance for desktop
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch targets** - Minimum 44px for interactive elements
- **Content hierarchy** - Clear visual hierarchy on all screen sizes

## 🔍 Key Features & Implementation

### Search System
- **Full-text search** via Convex search indexes
- **Category filtering** with database indexes
- **Debounced input** to prevent excessive API calls
- **Pagination** using Convex's paginated queries

### AI Integration
- **OpenAI GPT-4** for tool recommendations
- **Context management** for conversation flow
- **Tool matching** based on user queries
- **Session-based chat history**

### Bookmark System
- **User-specific bookmarks** linked to user ID
- **Real-time updates** via Convex reactivity
- **Optimistic UI updates** for better UX
- **Bookmark status tracking** across components

### Authentication Flow
- **Convex Auth** handles all authentication
- **User profiles** stored separately from auth data
- **Anonymous users** supported with limited features
- **Profile images** stored in Convex file storage

## 🗄️ Database Schema Understanding

### Core Tables
```typescript
// Tools table
tools: {
  name: string,
  url: string,
  tagline: string,
  summary: string,
  descriptor?: string,
  category: string,
  tags?: string[],
  screenshot?: string,
}

// User profiles (separate from auth)
userProfiles: {
  userId: Id<"users">,
  points: number,
  profileImageUrl?: string,
}

// Bookmarks (many-to-many relationship)
bookmarks: {
  userId: Id<"users">,
  toolId: Id<"tools">,
}

// Chat history
chatHistory: {
  sessionId: string,
  message: string,
  response: string,
  recommendedTools?: Doc<"tools">[],
}
```

### Index Strategy
- **Search indexes** for full-text search on tools
- **User indexes** for efficient user data queries
- **Composite indexes** for complex queries (user + tool relationships)

## 🤖 AI Implementation Details

### OpenAI Integration
```typescript
// AI chat function structure
export const sendMessage = action({
  args: { message: v.string(), sessionId: v.string() },
  handler: async (ctx, args) => {
    // 1. Get conversation context
    // 2. Call OpenAI API
    // 3. Process response
    // 4. Find matching tools
    // 5. Store chat history
    // 6. Return response + tools
  }
});
```

### Tool Matching Algorithm
- **Keyword extraction** from user queries
- **Semantic matching** using tool descriptions
- **Category-based filtering** for relevant results
- **Ranking algorithm** for best matches

## 🎯 Common Development Tasks

### Adding a New Feature
1. **Plan the feature** - Define requirements and user flow
2. **Update schema** if database changes needed
3. **Create Convex functions** for backend logic
4. **Build UI components** for frontend
5. **Integrate with existing features** (search, bookmarks, etc.)
6. **Test thoroughly** across different user states
7. **Update documentation** (Feature Log, User Flows, etc.)

### Modifying Search Functionality
1. **Understand current search** - Review `tools.ts` functions
2. **Update search indexes** if needed in schema
3. **Modify search functions** with proper validation
4. **Update UI components** to handle new search features
5. **Test search performance** with large datasets

### Adding New Tool Categories
1. **Update category list** in relevant components
2. **Modify auto-categorization logic** in upload script
3. **Update category filters** in UI
4. **Test category-based searches**

### Integrating New AI Features
1. **Extend chat functions** in `convex/chat.ts`
2. **Update AI prompts** for better responses
3. **Modify tool matching logic** if needed
4. **Update chat UI** for new features
5. **Test AI responses** thoroughly

## 🐛 Debugging & Troubleshooting

### Common Issues
1. **Schema validation errors** - Check validator syntax
2. **Authentication issues** - Verify user context in functions
3. **Search not working** - Check search indexes in schema
4. **Real-time updates failing** - Verify Convex query usage
5. **AI responses empty** - Check OpenAI API key and prompts

### Debugging Tools
- **Convex Dashboard** - Monitor database and function calls
- **Browser DevTools** - Debug frontend issues
- **Console logs** - Add logging to Convex functions
- **Network tab** - Monitor API calls and responses

### Performance Monitoring
- **Query performance** - Monitor slow database queries
- **Bundle size** - Keep JavaScript bundles optimized
- **Image optimization** - Ensure images are properly sized
- **API rate limits** - Monitor OpenAI usage

## 📦 Dependencies & Updates

### Key Dependencies
```json
{
  "convex": "^1.0.0",           // Backend platform
  "react": "^18.0.0",           // Frontend framework
  "framer-motion": "^10.0.0",   // Animations
  "tailwindcss": "^3.0.0",     // Styling
  "openai": "^4.0.0",          // AI integration
  "sonner": "^1.0.0"           // Toast notifications
}
```

### Update Strategy
1. **Test updates locally** before deploying
2. **Check breaking changes** in dependency changelogs
3. **Update gradually** - one major dependency at a time
4. **Monitor for issues** after updates
5. **Have rollback plan** ready

## 🚀 Deployment & Production

### Environment Variables
```bash
# Required for development
CONVEX_URL=your-convex-deployment-url
VITE_CONVEX_URL=your-convex-deployment-url

# Required for AI features
OPENAI_API_KEY=your-openai-api-key
CONVEX_OPENAI_API_KEY=your-openai-api-key
CONVEX_OPENAI_BASE_URL=your-openai-base-url
```

### Production Checklist
- [ ] All environment variables set
- [ ] Database schema deployed
- [ ] Functions deployed and tested
- [ ] Frontend built and deployed
- [ ] Authentication working
- [ ] Search functionality working
- [ ] AI features working
- [ ] File uploads working
- [ ] Error handling tested

## 📚 Learning Resources

### Convex Documentation
- [Convex Docs](https://docs.convex.dev/) - Official documentation
- [Convex Auth](https://docs.convex.dev/auth) - Authentication guide
- [Database Queries](https://docs.convex.dev/database/queries) - Query patterns

### React & TypeScript
- [React Docs](https://react.dev/) - Official React documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript guide

### Styling & Animation
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) - Animation library

## 🔄 Maintenance Guidelines

### Regular Tasks
1. **Update dependencies** monthly
2. **Monitor error logs** weekly
3. **Review performance metrics** weekly
4. **Update documentation** with every feature change
5. **Backup database** regularly (Convex handles this automatically)

### Code Quality
- **Use TypeScript strictly** - No `any` types
- **Follow naming conventions** - Clear, descriptive names
- **Write comments** for complex logic
- **Keep functions small** - Single responsibility principle
- **Test edge cases** - Handle errors gracefully

## 📝 Documentation Requirements

### ALWAYS Update These When Making Changes:
1. **[Feature Log](./FEATURE_LOG.md)** - Mark completed features, add new ones
2. **[User Flows](./USER_FLOWS.md)** - Update if UX changes
3. **[API Reference](./API_REFERENCE.md)** - Document new functions
4. **This Developer Guide** - Update if architecture changes

### Documentation Standards
- **Be specific** - Include exact steps and code examples
- **Stay current** - Update immediately when making changes
- **Think of future developers** - Explain the "why" not just the "what"
- **Include examples** - Show actual code snippets
- **Note breaking changes** - Highlight anything that affects existing functionality

## 🎯 Success Metrics

### Code Quality Metrics
- **TypeScript coverage** - 100% (no `any` types)
- **Component reusability** - High reuse of UI components
- **Function complexity** - Keep functions simple and focused
- **Error handling** - Comprehensive error boundaries

### Performance Metrics
- **Page load time** - < 3 seconds
- **Search response time** - < 500ms
- **AI response time** - < 5 seconds
- **Mobile performance** - Lighthouse score > 90

### User Experience Metrics
- **Feature adoption** - Track usage of new features
- **Error rates** - Monitor and minimize user-facing errors
- **Search success rate** - Users finding relevant tools
- **Bookmark usage** - Users saving and returning to tools

---

## 🚨 CRITICAL REMINDER

**Before making ANY changes:**

1. **Read this guide completely**
2. **Review the Feature Log** to understand current state
3. **Check User Flows** to understand impact
4. **Use the `view` tool** to understand existing code
5. **Test changes thoroughly**
6. **Update ALL relevant documentation**

**After making changes:**

1. **Update Feature Log** with new/modified features
2. **Update User Flows** if UX changed
3. **Update this Developer Guide** if architecture changed
4. **Test everything** - don't assume it works
5. **Deploy carefully** - monitor for issues

**Remember**: Future developers (including yourself in 6 months) will thank you for maintaining accurate, comprehensive documentation!

---

*This guide is a living document. Keep it updated with every significant change to the codebase.*
