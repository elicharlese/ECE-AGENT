# Database Setup and Schema

## Overview

This project uses Supabase with PostgreSQL for persistent storage of conversation history. The database schema is designed to efficiently store and retrieve conversation data with JSONB for flexible message storage.

## Schema

### conversations table

- `id` (UUID): Unique identifier for each conversation
- `title` (VARCHAR): Human-readable title for the conversation
- `agent_id` (VARCHAR): Identifier for the agent associated with the conversation
- `messages` (JSONB): Array of message objects containing role, content, and timestamp
- `created_at` (TIMESTAMPTZ): Timestamp when the conversation was created
- `updated_at` (TIMESTAMPTZ): Timestamp when the conversation was last updated

## Indexes

- `idx_conversations_agent_id`: For efficient querying of conversations by agent
- `idx_conversations_created_at`: For sorting conversations by creation time
- `idx_conversations_updated_at`: For sorting conversations by update time

## Setup

1. Create a Supabase project at https://supabase.com/
2. Obtain your Supabase URL and API key
3. Set these as environment variables in your `.env` file:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```
4. Run the SQL migration script in `migrations/001_create_conversations_table.sql` in your Supabase SQL editor

## Usage

The conversation model in `db/conversationModel.js` provides functions to:

- Get a conversation by ID
- Get all conversations for an agent
- Save a conversation (create or update)
- Delete a conversation

## Testing

Run the database connection test script to verify your setup:

```bash
node test-db-connection.js
```
