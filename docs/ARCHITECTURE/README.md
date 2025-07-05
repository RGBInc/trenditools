# 🏗️ Architecture

This section contains technical documentation about TrendiTools' system design, backend architecture, and data structures.

## 📚 Documentation in This Section

### [System Architecture](ARCHITECTURE.md)
**High-level system architecture overview**
- Application structure and components
- Technology stack decisions
- System boundaries and integrations
- Data flow diagrams

### [Convex Backend Guide](CONVEX_GUIDE.md)
**Comprehensive backend architecture documentation**
- Why Convex was chosen over alternatives
- Database design and real-time features
- Authentication system
- Search implementation
- Deployment and hosting

### [Schema Documentation](SCHEMA_DOCUMENTATION.md)
**Database schema and data structures**
- Complete tool data schema
- Field definitions and usage
- Database indexes and performance
- Making schema changes
- Data processing pipeline

## 🎯 Architecture Overview

### Technology Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: Convex (Backend-as-a-Service)
- **Database**: Convex Real-time Database
- **Authentication**: Convex Auth
- **Search**: Convex Full-text Search
- **Storage**: Convex Cloud Storage
- **Deployment**: Vercel (Frontend) + Convex (Backend)

### Key Architectural Decisions

#### Why Convex?
- **Type Safety**: TypeScript-first with auto-generated APIs
- **Real-time**: Built-in real-time updates
- **Simplicity**: Single deployment target
- **Developer Experience**: Hot reloading and integrated tooling

#### Search Architecture
- Multi-index search strategy
- Separate indexes for names, content, and tags
- Category filtering capabilities
- Deduplication and ranking

#### Image System
- Automated screenshot capture with Puppeteer
- Cloud storage with Convex
- URL transformation for serving
- Performance optimizations

## 🔄 Data Flow

```
CSV Data → Processing Scripts → Convex Database → React Frontend
    ↓              ↓                ↓              ↓
Tool URLs → AI Extraction → Real-time DB → User Interface
    ↓              ↓                ↓              ↓
Screenshots → Cloud Storage → Image URLs → Optimized Display
```

## 🎯 Quick Navigation

### For Backend Developers
1. [Convex Backend Guide](CONVEX_GUIDE.md) - Complete backend overview
2. [Schema Documentation](SCHEMA_DOCUMENTATION.md) - Database structure
3. [System Architecture](ARCHITECTURE.md) - High-level design

### For Frontend Developers
1. [System Architecture](ARCHITECTURE.md) - Component structure
2. [Schema Documentation](SCHEMA_DOCUMENTATION.md) - Data models
3. [Convex Backend Guide](CONVEX_GUIDE.md) - API understanding

### For DevOps/Infrastructure
1. [Convex Backend Guide](CONVEX_GUIDE.md) - Deployment architecture
2. [System Architecture](ARCHITECTURE.md) - Infrastructure overview
3. [Getting Started](../GETTING_STARTED/DEPLOYMENT_GUIDE.md) - Deployment guide

## 🔗 Related Documentation

- **Getting Started**: [Developer Setup](../GETTING_STARTED/README.md)
- **Features**: [System Capabilities](../FEATURES/README.md)
- **Automation**: [Data Processing](../AUTOMATION/README.md)
- **Security**: [Security Architecture](../SECURITY/README.md)

## 🚀 Performance Considerations

- **Search Performance**: Multi-index strategy with efficient pagination
- **Image Loading**: Preloading and lazy loading strategies
- **Real-time Updates**: Optimistic updates and conflict resolution
- **Scalability**: Serverless architecture with automatic scaling

---

**Deep Dive**: Start with the [System Architecture](ARCHITECTURE.md) for a high-level overview, then explore specific components based on your needs.