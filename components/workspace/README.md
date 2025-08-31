# Workspace Mode

The Workspace Mode transforms the traditional chat interface into an active collaborative environment where users can seamlessly integrate video calls, phone calls, messages, and real-time tool execution in a unified interface.

## Features

### 🎯 Unified Communication
- **Video Calls**: Integrated LiveKit video conferencing directly in the workspace
- **Phone Calls**: Voice-only communication with the same LiveKit infrastructure
- **Messages**: Traditional chat messaging with real-time typing indicators
- **Seamless Switching**: Toggle between communication modes without losing context

### 🛠️ Real-Time Tool Execution
- **Code Interpreter**: Run Python, JavaScript, SQL queries with live output
- **Media Generation**: Create images, audio, and video content with AI
- **Data Analysis**: Process datasets and generate visualizations
- **3D Modeling**: Generate and manipulate 3D scenes
- **Web Search**: Real-time web search integration

### 🎨 Media Creation & Interaction
- **Image Generation**: AI-powered image creation with prompts
- **Audio Generation**: Create music, sound effects, and voice content
- **Video Generation**: Generate short animations and video content
- **Interactive Preview**: View, play, and interact with generated media
- **Export & Share**: Download and share workspace creations

### 📊 Workspace Canvas
- **Visual Organization**: Grid-based layout for workspace items
- **Multi-Selection**: Select and manipulate multiple items at once
- **Drag & Drop**: Reorganize workspace items intuitively
- **Real-Time Updates**: See changes as they happen across all participants

## Components

### WorkspaceMode
Main component that orchestrates the workspace experience.

**Props:**
- `chatId`: Unique identifier for the workspace session
- `messages`: Array of chat messages
- `onSendMessage`: Handler for sending new messages
- `onEditMessage`: Handler for editing existing messages
- `typingUsers`: Object of currently typing users
- `isConnected`: WebSocket connection status

### WorkspaceToolbar
Top toolbar with mode switching and quick actions.

**Features:**
- Mode toggle (Chat ↔ Workspace)
- Layout switching (Unified ↔ Split)
- Quick tool access dropdowns
- Communication controls
- Active participant count

### WorkspaceCanvas
Visual canvas for displaying and interacting with workspace items.

**Features:**
- Grid layout for workspace items
- Multi-selection with Ctrl/Cmd+click
- Bulk actions (copy, share, delete)
- Item-specific actions (run, download, view)
- Empty state guidance

## Usage

### Basic Integration

```tsx
import { WorkspaceMode } from '@/components/workspace/workspace-mode'
import { useWorkspace } from '@/hooks/use-workspace'

function ChatWindow({ chatId }) {
  const [workspaceState, workspaceActions] = useWorkspace(chatId)
  
  return (
    <WorkspaceMode
      chatId={chatId}
      messages={messages}
      onSendMessage={handleSendMessage}
      onEditMessage={handleEditMessage}
      typingUsers={typingUsers}
      isConnected={isConnected}
    />
  )
}
```

### Workspace State Management

```tsx
const [workspaceState, workspaceActions] = useWorkspace(chatId)

// Switch to workspace mode
workspaceActions.setMode('workspace')

// Execute a tool
await workspaceActions.executeToolAction('python_interpreter', {
  code: 'print("Hello, World!")'
})

// Generate media
await workspaceActions.generateMedia('image', 'A beautiful sunset')
```

## Layouts

### Unified Layout
Single tabbed interface with:
- **Chat & Tools**: Messages and tool executions combined
- **Media**: Generated images, audio, and video content
- **AI Tools**: Available tools and their outputs

### Split Layout
Two-panel interface with:
- **Left Panel**: Traditional chat messages
- **Right Panel**: Workspace items (tools, media, etc.)

## Tool Integration

### Code Execution
```tsx
// Python interpreter
workspaceActions.executeToolAction('python_interpreter', {
  code: `
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)
plt.plot(x, y)
plt.title('Sine Wave')
plt.show()
  `
})
```

### Media Generation
```tsx
// Generate an image
workspaceActions.generateMedia('image', 'A futuristic cityscape at sunset')

// Generate audio
workspaceActions.generateMedia('audio', 'Relaxing ambient music for focus')

// Generate video
workspaceActions.generateMedia('video', 'Short animation of a bouncing ball')
```

## Analytics Events

The workspace mode tracks several analytics events:

- `workspace_mode_change`: When switching between chat and workspace modes
- `workspace_layout_change`: When changing between unified and split layouts
- `workspace_tool_execution`: When executing any tool
- `workspace_media_generation`: When generating media content
- `workspace_video_call_start/end`: Video call events
- `workspace_phone_call_start/end`: Phone call events

## State Persistence

Workspace state is automatically persisted to localStorage:

- **Mode preference**: Chat vs Workspace mode
- **Layout preference**: Unified vs Split layout
- **Active tab**: Current tab in unified mode
- **Generated content**: Media and tool outputs (session-scoped)

## Accessibility

- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: ARIA labels and descriptions
- **High Contrast**: Respects system color preferences
- **Focus Management**: Proper focus handling for modals and interactions

## Performance

- **Lazy Loading**: Heavy components loaded on demand
- **Virtual Scrolling**: Efficient rendering of large workspace item lists
- **Debounced Updates**: Optimized real-time updates
- **Memory Management**: Automatic cleanup of unused resources

## Future Enhancements

- **Collaborative Cursors**: See where other users are working
- **Version History**: Track changes to workspace items
- **Templates**: Pre-built workspace configurations
- **Plugins**: Extensible tool system
- **Cloud Sync**: Cross-device workspace synchronization
