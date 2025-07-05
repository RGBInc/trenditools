# 🚀 TrendiTools

A modern web application for discovering and exploring trending tools and services. Built with React, TypeScript, Vite, and Convex.

## ✨ Features

- 🔍 **Smart Search**: Find tools by name, category, or functionality
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- ⚡ **Fast Performance**: Built with Vite for lightning-fast development and builds
- 🎨 **Modern UI**: Clean, intuitive interface with Tailwind CSS
- 📊 **Real-time Data**: Powered by Convex for real-time updates
- 🏷️ **Category Filtering**: Browse tools by specific categories
- 🔖 **Bookmarking**: Save your favorite tools for later
- 💬 **AI Chat**: Get personalized tool recommendations
- 📸 **Automated Screenshots**: AI-powered tool processing with screenshots
- 🤖 **Content Enrichment**: Automated tool data extraction and enhancement

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons
- **Backend**: Convex (real-time database and API)
- **UI Components**: Custom components with shadcn/ui patterns
- **State Management**: React hooks and Convex queries
- **Build Tool**: Vite with TypeScript
- **AI Services**: Firecrawl for content extraction
- **Automation**: Puppeteer for screenshots

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Convex account (free tier available)
- Firecrawl API key (for processing tools)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/trenditools.git
cd trenditools
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:
```env
VITE_CONVEX_URL=your-convex-deployment-url
FIRECRAWL_API_KEY=fc-your-api-key-here
OPENAI_API_KEY=sk-your-openai-key-here  # Optional
```

4. **Set up Convex:**
```bash
npx convex dev
```

5. **Start the development server:**
```bash
npm run dev
```

6. **Open [http://localhost:5173](http://localhost:5173) in your browser.**

## 📜 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Tool Processing
- `npm run process-tools` - Process tools from CSV file
- `npm run process-tools:dry` - Dry run (test without saving)

### Utilities
- `npm run check-urls` - Validate tool URLs
- `npm run fix-screenshots` - Fix malformed screenshot URLs

## 📁 Project Structure

```
trenditools/
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base UI components
│   │   ├── ToolCard.tsx   # Tool display component
│   │   ├── SearchEngine.tsx # Search functionality
│   │   └── ...
│   ├── lib/               # Utility functions
│   ├── App.tsx            # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── convex/                # Backend functions and schema
│   ├── schema.ts         # Database schema
│   ├── tools.ts          # Tool-related functions
│   ├── users.ts          # User management
│   └── ...
├── scripts/               # Automation scripts
│   ├── process-tools.js  # Main processing script
│   ├── fix-screenshots.js # Screenshot URL fixer
│   └── check-urls.js     # URL validator
├── docs/                  # Documentation
│   ├── DEPLOYMENT_GUIDE.md
│   ├── SECURITY_AUDIT.md
│   ├── PROCESSING_SCRIPT.md
│   └── ...
├── data/                  # Data files
│   └── Trendi Tools - Final.csv
└── screenshots/           # Generated screenshots
```

## 🤖 Automated Tool Processing

TrendiTools includes a powerful automation system for processing tool URLs:

1. **Add URLs** to `data/Trendi Tools - Final.csv`
2. **Run processing script**: `npm run process-tools`
3. **AI extracts** tool information automatically
4. **Screenshots** are captured and stored
5. **Data is enriched** and saved to database

See [Processing Script Documentation](docs/PROCESSING_SCRIPT.md) for details.

## 📚 Documentation

- [🏗️ Architecture Guide](docs/ARCHITECTURE.md)
- [🚀 Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [🔒 Security Audit](docs/SECURITY_AUDIT.md)
- [🤖 Processing Script](docs/PROCESSING_SCRIPT.md)
- [🖼️ Image System](docs/IMAGE_SYSTEM.md)
- [👨‍💻 Developer Guide](docs/DEVELOPER_GUIDE.md)
- [📊 Schema Documentation](docs/SCHEMA_DOCUMENTATION.md)

## 🌐 Deployment

This project is configured for deployment on Vercel with Convex backend:

1. **Deploy to Convex:**
```bash
npx convex deploy --prod
```

2. **Deploy to Vercel:**
```bash
vercel --prod
```

3. **Set environment variables** in Vercel dashboard

See [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) for complete instructions.

## 🔒 Security

- ✅ Environment variables properly configured
- ✅ Input validation and sanitization
- ✅ Secure file upload handling
- ✅ XSS and injection protection
- ✅ Security headers configured

See [Security Audit](docs/SECURITY_AUDIT.md) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm run lint && npm run type-check`
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Convex](https://convex.dev) for the backend
- UI components inspired by [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- AI-powered content extraction by [Firecrawl](https://firecrawl.dev)
- Screenshots captured with [Puppeteer](https://pptr.dev)

---

**Live Demo**: [Coming Soon]
**GitHub**: [Repository Link]
**Documentation**: [docs/](docs/)

### 📚 Documentation

- [Image System Overview](docs/IMAGE_SYSTEM.md) - Complete image processing and serving system
- [Image Performance Guide](docs/IMAGE_PERFORMANCE_GUIDE.md) - Performance optimizations for image loading
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Production deployment instructions
- [Security Audit](docs/SECURITY_AUDIT.md) - Security considerations and best practices

## App authentication

Chef apps use [Convex Auth](https://auth.convex.dev/) with Anonymous auth for easy sign in. You may wish to change this before deploying your app.

## HTTP API

User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.
