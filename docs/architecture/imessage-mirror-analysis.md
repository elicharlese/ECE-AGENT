# iMessage Mirror Frontend - Backend API Analysis & Component Architecture

## Backend API Integration Points Analysis

### 1. Authentication & User Management
- **Login/Logout**: `/login`, `/logout` endpoints with JWT token management
- **User Info**: `/user/me` for current user details and permissions
- **Session Management**: Header-based authentication with `Authorization` token

### 2. Real-time Chat System
- **WebSocket Endpoint**: `/ws/chat` for real-time messaging
- **Connection Manager**: Handles multiple connections, chat history, broadcasting
- **Message Types**: Support for different message types and domains
- **Chat History**: Per-domain message storage with 100-message limit

### 3. RAISE Framework Integration
- **Query Processing**: `/query/raise` for enhanced AI responses
- **Dialogue Sessions**: Start/end dialogue sessions with session management
- **Domain Switching**: Support for multiple AI domains (developer, trader, lawyer, etc.)
- **Reasoning Visualization**: `/reasoning/{chain_id}` for AI reasoning chains
- **Metrics & Health**: RAISE framework performance monitoring

### 4. Specialty Modes & Domains
- **Domain-specific Endpoints**: Developer, Trader, Lawyer, Researcher modes
- **Training Data**: Domain-specific model training and retraining
- **Performance Metrics**: Per-domain model performance tracking
- **Auto-retraining**: Monitoring and automatic model updates

### 5. Chrome Extension Integration
- **Job Applications**: Track, sync, and manage job applications
- **AI Proposals**: Generate cover letters and proposals
- **File Uploads**: Resume and cover letter management
- **Analytics**: Job application insights and statistics

### 6. Admin & Security Features
- **Admin Commands**: System administration and management
- **Security Tools**: Port scanning, threat detection, network monitoring
- **Container Orchestration**: Deploy and manage security containers
- **System Stats**: Real-time system performance monitoring

## iMessage Mirror Component Architecture

### Core Application Structure
```
apps/
├── imessage-mirror/           # New iMessage mirror app
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Core UI components
│   │   │   ├── pages/         # Main application pages
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── services/      # API integration services
│   │   │   ├── store/         # State management
│   │   │   ├── types/         # TypeScript type definitions
│   │   │   └── utils/         # Utility functions
│   │   ├── assets/            # Static assets
│   │   └── styles/            # Global styles
│   ├── public/                # Public assets
│   ├── index.html
│   ├── vite.config.ts
│   └── tailwind.config.js
```

### 1. Core Components (`src/app/components/`)

#### Chat Interface Components
- **`ChatContainer.tsx`** - Main chat interface wrapper
- **`MessageList.tsx`** - Scrollable message list with virtualization
- **`MessageBubble.tsx`** - Individual message bubble (sent/received)
- **`MessageInput.tsx`** - Input area with effects, attachments, apps
- **`TypingIndicator.tsx`** - Real-time typing indicator
- **`MessageEffects.tsx`** - Visual effects (confetti, balloons, etc.)

#### Sidebar Components
- **`Sidebar.tsx`** - Main sidebar container
- **`ConversationList.tsx`** - List of chat conversations
- **`ConversationItem.tsx`** - Individual conversation preview
- **`SearchBar.tsx`** - Search conversations and messages
- **`UserProfile.tsx`** - User avatar and status

#### Navigation & Layout
- **`AppLayout.tsx`** - Main application layout
- **`TopBar.tsx`** - Top navigation bar with controls
- **`ModeSelector.tsx`** - AI mode/domain switcher
- **`SettingsPanel.tsx`** - Settings and preferences

#### Specialty Mode Components
- **`DeveloperMode.tsx`** - Developer-specific tools and UI
- **`TraderMode.tsx`** - Trading-specific interface
- **`LawyerMode.tsx`** - Legal-specific tools
- **`ResearcherMode.tsx`** - Research-specific interface

#### UI Components (`src/app/components/ui/`)
- **`Button.tsx`** - iMessage-style buttons
- **`Avatar.tsx`** - User avatars with status indicators
- **`Switch.tsx`** - Toggle switches for settings
- **`Modal.tsx`** - Modal dialogs
- **`Tooltip.tsx`** - Contextual tooltips
- **`LoadingSpinner.tsx`** - Loading indicators

### 2. Pages (`src/app/pages/`)
- **`LoginPage.tsx`** - Authentication page
- **`ChatPage.tsx`** - Main chat interface
- **`SettingsPage.tsx`** - User settings and preferences
- **`AdminPage.tsx`** - Admin dashboard (if user has permissions)

### 3. Services (`src/app/services/`)
- **`apiClient.ts`** - Axios-based API client with auth
- **`websocketService.ts`** - WebSocket connection management
- **`authService.ts`** - Authentication and session management
- **`chatService.ts`** - Chat-related API calls
- **`raiseService.ts`** - RAISE framework integration
- **`fileService.ts`** - File upload and management

### 4. Hooks (`src/app/hooks/`)
- **`useAuth.ts`** - Authentication state and methods
- **`useWebSocket.ts`** - WebSocket connection and messaging
- **`useChat.ts`** - Chat state and message management
- **`useRaise.ts`** - RAISE framework integration
- **`useTheme.ts`** - Light/dark mode management
- **`useLocalStorage.ts`** - Local storage utilities

### 5. Store (`src/app/store/`)
- **`authStore.ts`** - Authentication state (Zustand)
- **`chatStore.ts`** - Chat messages and conversations
- **`uiStore.ts`** - UI state (sidebar, modals, etc.)
- **`settingsStore.ts`** - User preferences and settings

### 6. Types (`src/app/types/`)
- **`auth.types.ts`** - Authentication-related types
- **`chat.types.ts`** - Chat and message types
- **`api.types.ts`** - API request/response types
- **`ui.types.ts`** - UI component prop types

## Key Features to Implement

### 1. Authentic iMessage UI/UX
- **Message Bubbles**: Exact iMessage styling with proper spacing
- **Animations**: Smooth send/receive animations
- **Effects**: Message effects (confetti, balloons, love, fireworks)
- **Typing Indicators**: Real-time typing with dots animation
- **Read Receipts**: Message delivery and read status
- **Reactions**: Emoji reactions to messages

### 2. Real-time Communication
- **WebSocket Integration**: Persistent connection for real-time chat
- **Connection Management**: Auto-reconnect, connection status
- **Message Queuing**: Offline message queuing and sync
- **Presence Indicators**: Online/offline status

### 3. AI Integration
- **RAISE Framework**: Seamless integration with backend AI
- **Domain Switching**: Easy switching between AI modes
- **Context Awareness**: Maintain conversation context
- **Response Streaming**: Real-time AI response streaming

### 4. Modern Features
- **Dark/Light Mode**: System preference detection
- **Responsive Design**: Mobile-first responsive layout
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Virtualized lists, lazy loading
- **PWA Support**: Offline functionality, push notifications

### 5. Advanced Functionality
- **File Sharing**: Drag-and-drop file uploads
- **Search**: Full-text search across conversations
- **Export**: Export conversations and data
- **Backup**: Cloud backup and sync

## Implementation Strategy

### Phase 1: Core Infrastructure
1. Set up Nx workspace and project structure
2. Implement authentication and routing
3. Create basic layout and navigation
4. Set up state management and API services

### Phase 2: Chat Interface
1. Build core chat components
2. Implement WebSocket integration
3. Add message effects and animations
4. Create typing indicators and status

### Phase 3: AI Integration
1. Integrate RAISE framework
2. Implement domain switching
3. Add specialty mode interfaces
4. Create admin functionality

### Phase 4: Polish & Features
1. Add advanced features (search, export, etc.)
2. Implement PWA functionality
3. Performance optimization
4. Accessibility improvements
5. Comprehensive testing

This architecture provides a solid foundation for building an authentic iMessage mirror that seamlessly integrates with your existing backend while providing a superior user experience.
