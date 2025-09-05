# UX Documentation

This folder contains user experience research, design decisions, and information architecture documentation for the ECE-AGENT application.

## Structure

- **design-decision-log.md** - Atomic design decisions with Mobbin research references
- **ia.md** - Information architecture and navigation model
- **mobbin-research-workflow.md** - Process for UX research and pattern selection
- **references.md** - Mobbin pattern references and implementation mapping

## Current Status (Updated 2025-09-04)

### Information Architecture

The current IA reflects a comprehensive AI agent platform with messaging at its core:

- **Primary Routes**: `/`, `/auth`, `/messages`, `/profile`, `/admin`, `/benchmark`, `/desktop`, `/observability`
- **Navigation Model**: Multi-panel layout with collapsible sidebars and responsive design
- **Layout Patterns**: Three-panel chat interface, admin dashboards, desktop app integration
- **Testing Interfaces**: Multiple test routes for API validation, MCP tools, LiveKit calls

### Design System Status

- **Components**: React + Tailwind CSS v4 with Radix UI primitives (66 UI components)
- **Tokens**: HSL-based design tokens with comprehensive dark/light theme support
- **Patterns**: Chat interfaces, agent sidebars, MCP tool panels, 3D headset views, glass morphism
- **Architecture**: Nx monorepo with web, mobile (Expo), and desktop (Electron) apps
- **State Management**: React Query, Supabase real-time, WebSocket connections

### Current UI Structure

**Core Layout Components:**

- `ChatApp` - Main 3-panel messaging interface
- `IntegratedChatLayout` - Embedded chat for other pages
- `WorkspaceSidebar` - Tool and settings panels
- `AgentSidebar` - AI agent management
- `MCPToolsPanel` - Model Context Protocol tools

**Feature Areas:**

- **Chat System**: 31 components (message bubbles, input, sidebars, calls)
- **Authentication**: Supabase + Google OAuth + Solana wallet integration
- **Admin Panel**: User management, health metrics, billing controls
- **Profile System**: Multi-tier user profiles (Personal/Team/Enterprise)
- **Agent Management**: AI agent creation, communication, MCP integration
- **Real-time Features**: LiveKit calls, WebSocket messaging, collaborative editing

### Technical Debt & Issues

1. **Component Sprawl**: 66 UI components with inconsistent patterns
2. **Layout Complexity**: Multiple overlapping layout systems
3. **State Management**: Mixed patterns across hooks and services
4. **Styling Inconsistency**: Mix of Tailwind utilities and custom CSS
5. **Mobile Experience**: Responsive but not mobile-optimized
6. **Performance**: Heavy component trees, no virtualization
7. **Accessibility**: Inconsistent ARIA patterns and keyboard navigation

## Recent Updates

### Test Interface (2025-01-30)
- Added comprehensive API testing interface at `/test`
- Real-time connection status for all endpoints
- Categorized by Auth, Data, Payment, Integration, Media APIs

### Authentication Flow
- Supabase-based authentication with OAuth support
- Responsive login forms with proper error handling
- Secure session management and redirects

## Next Steps

1. **Update IA documentation** to reflect current messaging-focused architecture
2. **Apply Mobbin research** to messaging interface patterns
3. **Document current component patterns** in design decision log
4. **Expand UX research** for admin and testing interfaces

## Implementation Notes

- All patterns follow accessibility guidelines with keyboard navigation
- Responsive design with mobile-first approach
- No proprietary assets copied; all designs are original
- Component library built on Radix UI primitives with Tailwind styling
