# AGENT Chat Server

## Overview

This is the backend server for the AGENT chat application. It provides RESTful API endpoints for chat functionality with persistent storage using Supabase and PostgreSQL.

## Features

- RESTful API for chat interactions
- Persistent conversation storage with Supabase/PostgreSQL
- Support for multiple AI agents
- CORS enabled for frontend integration
- Environment-based configuration

## Prerequisites

- Node.js (v14 or higher)
- Supabase account and project
- PostgreSQL database (managed by Supabase)

## Setup

1. Install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Create a `.env` file in the server directory with your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   PORT=3001
   ```

3. Set up the database schema by running the SQL migration in `db/migrations/001_create_conversations_table.sql` in your Supabase SQL editor.

4. Test the database connection:
   ```bash
   npm run test:db
   ```

## API Endpoints

### Health Check

- `GET /api/health` - Server health status

### Agent Configuration

- `GET /api/agents` - Get all agent configurations
- `GET /api/agents/:agentId` - Get specific agent configuration

### Chat

- `POST /api/chat` - Send a message to an agent
  ```json
  {
    "message": "Hello, how are you?",
    "agentId": "gpt-4-agent",
    "conversationId": "optional-existing-conversation-id"
  }
  ```

### Conversations

- `GET /api/conversations/:conversationId` - Get conversation history
- `GET /api/conversations/agent/:agentId` - Get all conversations for an agent

## Development

Start the development server with auto-reload:
```bash
npm run dev
```

## Production

Start the production server:
```bash
npm start
```

## Testing

Run the database connection and CRUD tests:
```bash
npm run test:db
```
