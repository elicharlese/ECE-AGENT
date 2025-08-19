# Testing Guide for ECE-AGENT

## Prerequisites
- Node.js and npm installed
- Supabase account with project configured
- Environment variables set in `.env.local`

## Testing Realtime Messaging & AI Chat

### 1. Start the Application
```bash
npm run dev
```
Visit http://localhost:3000

### 2. Authentication Testing
- Click "Sign in with Google" to authenticate
- Or use dev login: username `admin`, password `admin123` (dev only)

### 3. Messaging Test
1. Open the app in two different browsers/incognito windows
2. Sign in with different accounts
3. Navigate to `/messages`
4. Create a conversation between the two users
5. Send messages - they should appear in realtime for both users

### 4. AI Chat Test
1. In any conversation, type a message starting with `@ai`
   - Example: "@ai What is the weather today?"
2. The AI will respond (using mock responses if no OpenAI key is set)
3. To use real OpenAI responses:
   - Set your OpenAI API key in the app settings
   - The key will be stored in localStorage

### 5. MCP Gateway Test
1. Go to the Messages page
2. Open the MCP Tools panel on the right
3. Test GitHub integration:
   - Enter a GitHub personal access token
   - Click "Connect GitHub"
   - Once connected, the GitHub API tool will be enabled
4. Test other tools:
   - Calculator: Performs math operations
   - Web Search: Searches the web (mock response in demo)

### 6. User Profile Test
1. Click on your profile avatar
2. Test viewing your profile information
3. Click Edit to modify profile details:
   - Update name, bio, location, phone
   - Click Save to persist changes

## API Keys Required

### OpenAI API (Optional)
- For real AI responses instead of mocks
- Set in app or add to localStorage: `openai_api_key`

### GitHub Token (Optional)
- For MCP GitHub integration
- Create at: https://github.com/settings/tokens
- Scopes needed: `repo`, `user`

## Troubleshooting

### Messages not appearing in realtime
- Check WebSocket server is running (port 3002)
- Verify Supabase Realtime is enabled for your tables
- Check browser console for connection errors

### AI not responding
- Verify AI service is initialized
- Check if OpenAI key is set (optional)
- Look for errors in browser console

### Authentication issues
- Verify Supabase URL and anon key in `.env.local`
- Check Google OAuth is configured in Supabase
- For dev mode, use admin/admin123 login

## Development Notes
- All API keys are stored in localStorage for security
- Mock responses are provided for demo purposes
- The app uses Supabase for auth and realtime features
- MCP tools can be enabled/disabled individually
