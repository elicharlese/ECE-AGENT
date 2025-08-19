---
description: Configure Supabase for real-time messaging and authentication
---

# Supabase Setup Workflow

Complete setup for Supabase integration with real-time messaging and authentication.

## 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create new project
- Copy project URL and anon key

## 2. Configure Environment Variables
Add to `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

## 3. Create Database Schema
// turbo
Run in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'offline',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  type TEXT CHECK (type IN ('direct', 'group', 'agent')),
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation participants
CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message reactions
CREATE TABLE public.message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES public.messages ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  reaction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, reaction)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view conversations they're part of" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );
```

## 4. Set Up Real-time Subscriptions
// turbo
In your React components:

```typescript
const supabase = createClient()

// Subscribe to new messages
const channel = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => {
      // Handle new message
      console.log('New message:', payload.new)
    }
  )
  .subscribe()

// Clean up subscription
return () => {
  supabase.removeChannel(channel)
}
```

## 5. Configure Authentication
// turbo
Set up auth providers in Supabase Dashboard:
- Email/Password
- Google OAuth
- GitHub OAuth

## 6. Test Integration
// turbo
```bash
npm run dev
```
- Test signup/login
- Send messages
- Verify real-time updates
- Check RLS policies

## 7. Deploy
// turbo
```bash
npm run build
npm run deploy
```
