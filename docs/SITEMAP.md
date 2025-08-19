# ECE-AGENT Application Sitemap

## 🏠 Public Routes

### `/` (Home)
- **Description**: Landing page with app overview
- **Auth Required**: No
- **Redirects**: To `/messages` if authenticated

### `/auth` (Authentication)
- **Description**: Login/Signup page
- **Auth Required**: No
- **Components**: 
  - `LoginForm`: Email/password and OAuth authentication
  - Supabase Auth integration

## 🔒 Protected Routes

### `/messages` (Messages Hub)
- **Description**: Main messaging interface
- **Auth Required**: Yes
- **Features**:
  - Direct messages
  - Group chats
  - AI agent conversations
  - Real-time messaging
- **Components**:
  - `ChatWindow`: Main chat interface
  - `ConversationsList`: Active conversations
  - `AgentChatWindow`: AI agent interactions
  - `GroupChatManager`: Group management

### `/calls` (Voice/Video Calls)
- **Description**: Audio and video calling interface
- **Auth Required**: Yes
- **Features**:
  - 1:1 voice calls
  - 1:1 video calls
  - Group calls (planned)
- **Components**:
  - `PhoneCallUI`: Voice call interface
  - `VideoCallUI`: Video call interface

### `/agents` (AI Agents)
- **Description**: AI agent management and configuration
- **Auth Required**: Yes
- **Features**:
  - View available agents
  - Configure agent capabilities
  - MCP tool management
- **Components**:
  - `AgentList`: Available agents
  - `AgentMCPIntegration`: MCP tools interface
  - `AgentConfiguration`: Agent settings

### `/apps` (Mini Apps)
- **Description**: Integrated mini applications
- **Auth Required**: Yes
- **Features**:
  - App launcher
  - App marketplace
  - Analytics dashboard
- **Components**:
  - `AppLauncher`: Launch mini apps
  - `AppMarketplace`: Browse available apps
  - `AppAnalyticsDashboard`: Usage analytics

### `/profile` (User Profile)
- **Description**: User profile and settings
- **Auth Required**: Yes
- **Features**:
  - Profile information
  - Account settings
  - Privacy preferences
- **Components**:
  - `UserProfile`: Profile display/edit
  - `SettingsPanel`: User preferences

## 🤖 AI Agent Routes

### `/agents/[agentId]`
- **Description**: Individual agent conversation
- **Auth Required**: Yes
- **Dynamic**: Yes
- **Parameters**: `agentId` - Unique agent identifier

## 📱 API Routes

### `/api/auth/*`
- **Description**: Authentication endpoints
- **Methods**: POST, GET
- **Endpoints**:
  - `/api/auth/login`: User login
  - `/api/auth/logout`: User logout
  - `/api/auth/signup`: User registration
  - `/api/auth/session`: Session validation

### `/api/messages/*`
- **Description**: Messaging endpoints
- **Methods**: GET, POST, DELETE
- **Endpoints**:
  - `/api/messages/send`: Send message
  - `/api/messages/[conversationId]`: Get conversation messages
  - `/api/messages/delete/[messageId]`: Delete message

### `/api/agents/*`
- **Description**: AI agent endpoints
- **Methods**: GET, POST
- **Endpoints**:
  - `/api/agents/list`: Get available agents
  - `/api/agents/[agentId]/message`: Send message to agent
  - `/api/agents/[agentId]/execute`: Execute MCP tool

### `/api/conversations/*`
- **Description**: Conversation management
- **Methods**: GET, POST, PUT, DELETE
- **Endpoints**:
  - `/api/conversations/create`: Create conversation
  - `/api/conversations/[id]`: Get/update conversation
  - `/api/conversations/[id]/participants`: Manage participants

## 🗄️ Database Schema

### Tables
1. **profiles**: User profiles
2. **conversations**: All conversations
3. **conversation_participants**: Chat participants
4. **messages**: All messages
5. **message_reactions**: Message reactions
6. **agents**: AI agent configurations
7. **agent_messages**: Agent conversation history

## 🔧 MCP Tool Integrations

### Available Tools
1. **brave-search**: Web and local search
2. **linear**: Project management
3. **git**: Version control
4. **stripe**: Payment processing
5. **puppeteer**: Browser automation
6. **sequential-thinking**: Problem solving
7. **memory**: Knowledge graph
8. **supabase**: Database operations

## 🚀 Deployment Routes

### Production
- **URL**: `https://ece-agent.vercel.app`
- **Provider**: Vercel
- **SSL**: Enabled
- **CDN**: Cloudflare

### Staging
- **URL**: `https://staging.ece-agent.vercel.app`
- **Provider**: Vercel
- **SSL**: Enabled

## 📊 Analytics & Monitoring

### Routes
- `/analytics`: Usage analytics dashboard
- `/monitoring`: System health monitoring
- `/logs`: Application logs

## 🔐 Middleware

### Authentication Middleware
- **Path**: All protected routes
- **Function**: Validates Supabase session
- **Redirect**: To `/auth` if unauthenticated

### Rate Limiting
- **API Routes**: 100 requests/minute
- **WebSocket**: 50 messages/minute

## 📱 Mobile App Routes (React Native/Expo)

### Screens
- `HomeScreen`: App landing
- `AuthScreen`: Login/signup
- `MessagesScreen`: Chat interface
- `AgentsScreen`: AI agents
- `ProfileScreen`: User profile
- `SettingsScreen`: App settings

## 🎯 Future Routes (Planned)

- `/marketplace`: App marketplace
- `/workspace`: Collaborative workspace
- `/calendar`: Integrated calendar
- `/files`: File management
- `/tasks`: Task management
- `/notes`: Note-taking interface
