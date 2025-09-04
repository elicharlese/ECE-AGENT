# AGENT - Multi-Platform AI Assistant

A comprehensive AI-powered assistant application built for web, mobile, and desktop platforms using modern technologies and best practices.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- For mobile: Expo CLI
- For desktop: Electron

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd AGENT

# Install dependencies
npm install

# Install mobile dependencies
cd mobile && npm install && cd ..

# Install desktop dependencies
cd apps/desktop && npm install && cd ../..
```

## 📱 Platform-Specific Commands

### 🌐 Web Application (Next.js)
```bash
# Development server
npm run dev
# or
nx next:dev

# Production build
npm run build
# or
nx next:build

# Start production server
npm run start
# or
nx next:start

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

### 📱 Mobile Application (Expo/React Native)
```bash
# Start development server
nx start mobile
# or
nx serve mobile

# Run on iOS simulator
nx run-ios mobile

# Run on Android emulator
nx run-android mobile

# Prebuild for native development
nx prebuild mobile

# Build for production
nx build mobile

# Submit to app stores
nx submit mobile
```

### 💻 Desktop Application (Electron)
```bash
# Development mode
nx serve desktop

# Build application
nx build desktop

# Package for distribution
nx package desktop

# Create distributable
npm run dist (from apps/desktop/)
```

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### E2E Tests (Playwright)
```bash
# Run E2E tests
npx playwright test

# Run tests in UI mode
npx playwright test --ui

# Run specific test file
npx playwright test tests/example.spec.ts
```

### Component Tests
```bash
# Run component tests
npm test -- __tests__/components/

# Run with specific pattern
npm test -- --testPathPattern=Chat
```

## 🏗️ Build & Deployment

### Web Deployment (Vercel)
```bash
# Deploy to Vercel (automatic on main branch push)
# Manual deployment
npx vercel --prod

# Preview deployment
npx vercel

# Check deployment status
npx vercel ls
```

### Mobile Deployment
```bash
# Build for EAS (Expo Application Services)
cd mobile
npx eas build --platform ios
npx eas build --platform android

# Submit to stores
npx eas submit --platform ios
npx eas submit --platform android
```

### Desktop Deployment
```bash
cd apps/desktop

# Build for current platform
npm run dist

# Build for specific platforms
npm run dist:mac
npm run dist:win
npm run dist:linux
```

## 🛠️ Development Scripts

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npx prettier --write .

# Type check
npx tsc --noEmit

# Run all quality checks
npm run quality
```

### Database & Migrations
```bash
# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# View database
npx prisma studio
```

### Environment Setup
```bash
# Validate environment variables
npm run env:validate

# Setup development environment
npm run setup:dev

# Clean all caches
npm run clean
```

## 📁 Project Structure

```
AGENT/
├── app/                    # Next.js web application
├── mobile/                 # Expo React Native mobile app
├── apps/
│   ├── desktop/           # Electron desktop application
│   └── visionos/          # VisionOS application
├── components/            # Shared React components
├── lib/                   # Shared utilities and libraries
├── hooks/                 # Custom React hooks
├── services/              # API services and integrations
├── __tests__/             # Test files
├── docs/                  # Documentation
├── scripts/               # Build and utility scripts
└── prisma/               # Database schema and migrations
```

## 🔧 Configuration Files

- `package.json` - Main project dependencies and scripts
- `nx.json` - NX workspace configuration
- `tsconfig.json` - TypeScript configuration
- `jest.config.ts` - Jest testing configuration
- `playwright.config.ts` - E2E testing configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `vercel.json` - Vercel deployment configuration

## 🌍 Environment Variables

Create `.env.local` file with:

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# External APIs
SUPABASE_URL="..."
SUPABASE_ANON_KEY="..."

# AI/ML Services
OPENAI_API_KEY="..."

# Payment Processing
STRIPE_SECRET_KEY="..."
STRIPE_PUBLISHABLE_KEY="..."
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Commit Convention
Follow [Conventional Commits](https://conventionalcommits.org/):
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Testing
- `chore:` - Maintenance

## 📚 Documentation

- [Architecture Overview](./docs/architecture/)
- [API Documentation](./docs/api/)
- [Component Library](./docs/ui/)
- [Testing Guide](./docs/testing/)
- [Deployment Guide](./docs/deployment/)

## 🔒 Security

- Environment variables are validated on startup
- Authentication handled via NextAuth.js
- API routes protected with middleware
- Database queries use parameterized statements

## 📈 Performance

- Code splitting enabled
- Image optimization with Next.js
- Caching strategies implemented
- Bundle analysis available

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 3000
npx kill-port 3000
```

**Metro bundler issues:**
```bash
# Clear Metro cache
npx react-native start --reset-cache
```

**Electron build issues:**
```bash
# Clear Electron cache
cd apps/desktop && rm -rf node_modules/.cache && npm install
```

## 📞 Support

- [Issues](https://github.com/your-org/AGENT/issues)
- [Discussions](https://github.com/your-org/AGENT/discussions)
- [Documentation](./docs/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using Next.js, Expo, Electron, and modern web technologies.
