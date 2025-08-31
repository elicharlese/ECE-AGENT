# ECE-AGENT Architecture Documentation

This folder contains comprehensive architecture diagrams and documentation for the ECE-AGENT platform, featuring a custom LLM with specialized agent modes and self-learning capabilities.

## Core Architecture Documents

### System Overview
- **overview.md**: Complete system architecture with Next.js frontend, Supabase backend, and custom AGENT model
- **custom_llm_architecture.md**: Detailed custom LLM architecture with specialized agent modes
- **self_learning_pipeline.md**: Continuous learning and training pipeline architecture

### Specialized Components
- **domain_agents.md**: Five specialized agent modes (Smart Assistant, Code Companion, Creative Writer, Legal Assistant, Designer Agent)
- **knowledge_base.md**: Knowledge management and retrieval systems
- **llm_self_care.md**: Model monitoring and self-improvement mechanisms

### Implementation Details
- **admin_dashboard.md**: Administrative interface and monitoring systems
- **maintenance_agents.md**: System maintenance and performance monitoring
- **specialty_mode_layouts.md**: UI/UX designs for specialized agent modes

### Legacy Components
- **components.md**: Component-level architecture diagrams
- **containers.md**: Container and deployment architecture
- **context.md**: System context and external integrations
- **imessage-component-diagram.md**: Messaging interface component structure
- **imessage-mirror-analysis.md**: Chat interface design analysis

## Architecture Highlights

### Custom AGENT Model
- **Five Specialized Modes**: Each with domain-specific training and capabilities
- **Self-Learning Pipeline**: Continuous improvement through user interactions
- **Context Switching**: Seamless mode transitions while preserving conversation context
- **Quality Assurance**: Automated testing and validation of model outputs

### Technology Stack
- **Frontend**: Next.js with TypeScript, React, and Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage) with Next.js API routes
- **Real-time**: LiveKit for video/audio communication
- **Payments**: Stripe integration for credits and subscriptions
- **Integrations**: MCP (Model Context Protocol) for external tools

### Key Features
- **Multi-modal Interface**: Chat, voice, and video communication
- **API Testing**: Comprehensive testing interface at `/test`
- **Authentication**: Supabase Auth with OAuth providers
- **Responsive Design**: Mobile-first approach with desktop optimization

All diagrams use Mermaid for visualization and follow consistent formatting standards.
