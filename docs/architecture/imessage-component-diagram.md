# iMessage Mirror - Component Architecture Diagram

## Visual Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                        AppLayout.tsx                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   TopBar.tsx                            │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │   │
│  │  │ UserProfile  │ │ ModeSelector │ │ SettingsBtn  │    │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────┐ ┌─────────────────────────────────────────┐  │
│  │              │ │            ChatContainer.tsx            │  │
│  │              │ │  ┌─────────────────────────────────────┐ │  │
│  │              │ │  │         MessageList.tsx            │ │  │
│  │   Sidebar    │ │  │  ┌─────────────────────────────┐   │ │  │
│  │   .tsx       │ │  │  │      MessageBubble.tsx     │   │ │  │
│  │              │ │  │  │  ┌─────────────────────┐   │   │ │  │
│  │ ┌──────────┐ │ │  │  │  │  MessageEffects   │   │   │ │  │
│  │ │Conversation│ │ │  │  │  │     .tsx        │   │   │ │  │
│  │ │List.tsx  │ │ │  │  │  └─────────────────────┘   │   │ │  │
│  │ └──────────┘ │ │  │  └─────────────────────────────┘   │ │  │
│  │              │ │  └─────────────────────────────────────┘ │  │
│  │ ┌──────────┐ │ │                                          │  │
│  │ │SearchBar │ │ │  ┌─────────────────────────────────────┐ │  │
│  │ │.tsx      │ │ │  │      TypingIndicator.tsx           │ │  │
│  │ └──────────┘ │ │  └─────────────────────────────────────┘ │  │
│  │              │ │                                          │  │
│  └──────────────┘ │  ┌─────────────────────────────────────┐ │  │
│                    │  │        MessageInput.tsx            │ │  │
│                    │  │  ┌─────────┐ ┌─────────┐ ┌───────┐ │ │  │
│                    │  │  │Effects  │ │Apps     │ │Send   │ │ │  │
│                    │  │  │Panel    │ │Panel    │ │Button │ │ │  │
│                    │  │  └─────────┘ └─────────┘ └───────┘ │ │  │
│                    │  └─────────────────────────────────────┘ │  │
│                    └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Data Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AuthService   │    │  WebSocketService│    │   APIClient     │
│                 │    │                 │    │                 │
│ - login()       │    │ - connect()     │    │ - query()       │
│ - logout()      │    │ - send()        │    │ - upload()      │
│ - getUser()     │    │ - onMessage()   │    │ - admin()       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AuthStore     │    │   ChatStore     │    │   UIStore       │
│                 │    │                 │    │                 │
│ - user          │    │ - messages      │    │ - theme         │
│ - token         │    │ - conversations │    │ - sidebar       │
│ - isAuth        │    │ - typing        │    │ - modals        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     React Components                           │
│                                                                 │
│  useAuth() ──► AuthStore ──► Login/Logout UI                   │
│  useChat() ──► ChatStore ──► Messages/Input UI                 │
│  useUI()   ──► UIStore   ──► Theme/Layout UI                   │
└─────────────────────────────────────────────────────────────────┘
```

## State Management Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Zustand Stores                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   AuthStore     │  │   ChatStore     │  │   UIStore       │ │
│  │                 │  │                 │  │                 │ │
│  │ State:          │  │ State:          │  │ State:          │ │
│  │ - user          │  │ - messages      │  │ - theme         │ │
│  │ - token         │  │ - conversations │  │ - sidebarOpen   │ │
│  │ - isLoading     │  │ - currentChat   │  │ - activeModal   │ │
│  │ - error         │  │ - typing        │  │ - notifications │ │
│  │                 │  │ - isConnected   │  │                 │ │
│  │ Actions:        │  │                 │  │ Actions:        │ │
│  │ - login()       │  │ Actions:        │  │ - setTheme()    │ │
│  │ - logout()      │  │ - sendMessage() │  │ - toggleSidebar │ │
│  │ - refreshToken()│  │ - addMessage()  │  │ - showModal()   │ │
│  └─────────────────┘  │ - setTyping()   │  │ - hideModal()   │ │
│                       │ - loadHistory() │  └─────────────────┘ │
│                       └─────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

## API Integration Layer

```
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  AuthService    │  │  ChatService    │  │  RAISEService   │ │
│  │                 │  │                 │  │                 │ │
│  │ - login()       │  │ - sendMessage() │  │ - queryAgent()  │ │
│  │ - logout()      │  │ - getHistory()  │  │ - switchMode()  │ │
│  │ - refreshToken()│  │ - uploadFile()  │  │ - getMetrics()  │ │
│  │ - getUser()     │  │ - searchChats() │  │ - startSession()│ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ WebSocketService│  │  FileService    │  │  AdminService   │ │
│  │                 │  │                 │  │                 │ │
│  │ - connect()     │  │ - upload()      │  │ - getStats()    │ │
│  │ - disconnect()  │  │ - download()    │  │ - executeCmd()  │ │
│  │ - send()        │  │ - delete()      │  │ - getUsers()    │ │
│  │ - onMessage()   │  │ - getFiles()    │  │ - manageDomains │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend APIs                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Authentication    │  Chat & WebSocket  │  RAISE Framework     │
│  - POST /login     │  - WS /ws/chat     │  - POST /query/raise │
│  - POST /logout    │  - GET /history    │  - GET /metrics      │
│  - GET /user/me    │  - POST /upload    │  - POST /session     │
│                    │                    │                      │
│  Admin & Security  │  File Management   │  Specialty Modes     │
│  - GET /admin/*    │  - POST /files     │  - GET /domains      │
│  - POST /commands  │  - DELETE /files   │  - POST /retrain     │
│  - GET /stats      │  - GET /files      │  - GET /performance  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Props & Interfaces

```typescript
// Core component interfaces
interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  onReaction: (emoji: string) => void;
  onReply: () => void;
}

interface MessageInputProps {
  onSend: (content: string, effect?: MessageEffect) => void;
  onTyping: (isTyping: boolean) => void;
  disabled: boolean;
  placeholder: string;
}

interface SidebarProps {
  conversations: Conversation[];
  activeConversation: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

interface ChatContainerProps {
  conversationId: string;
  messages: Message[];
  isLoading: boolean;
  onLoadMore: () => void;
}
```

This component architecture provides a clear separation of concerns, efficient state management, and seamless integration with your existing backend APIs while delivering an authentic iMessage experience.
