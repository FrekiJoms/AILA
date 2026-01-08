# AILA - AI Learning Assistant

**Build a Fully Functional AI Chat Assistant from Scratch**

Welcome to the AILA Build Guide. This comprehensive tutorial guides you through building a complete, custom-built AI chat application with intelligent automation, real-time responses, and robust fallback systems.

## Quick Overview

AILA is a sophisticated system that integrates:
- **Supabase** - Secure backend, database, and authentication
- **N8N** - Live automation workflows and AI responses
- **Google Apps Script** - Serverless offline-first fallback system
- **Pinecone** - Vector storage for advanced AI context (RAG)
- **HTML/CSS/JavaScript** - Clean, responsive frontend without heavy 
refer here to dive deeper ➡️ [AILA LEARNING MATERIALS](https://docs.google.com/document/d/1YElDF8WmDN3FyIrCwaitXKDU6qZyIr31dVGysxANtKw/edit?usp=sharing)
frameworks

---

## ✨ Complete Feature List (48+ Features)

### 💬 Chat & Messaging
- Real-time AI responses via N8N webhooks
- Typing indicator animation
- Message history with role distinction (user/assistant)
- Auto-save every 500ms (debounced)
- Offline fallback responses from Google Sheets
- Suggestion system (AI-generated follow-up questions)

### 📚 Conversation Management
- Create new conversations automatically
- List conversations in collapsible sidebar
- Load previous conversations to continue
- Search conversations by title (real-time, case-insensitive)
- Rename conversations with custom titles
- Delete conversations with confirmation
- Auto-generate titles from first user message
- Persistent storage across browser sessions and devices

### 🔐 Authentication & Security
- Google OAuth login
- PIN-based authentication
- JWT token validation
- Row-Level Security (RLS) at database level
- Users only see their own data
- CORS protection
- SQL injection prevention
- DevTools blocking before login

### 👤 User Management
- User profile/account information
- Trial period management
- User ban capability
- Admin impersonation (test as user)
- Recovery link sending
- Gmail notifications

### 👨‍💼 Admin Dashboard
- Sortable user table (name, email, created date, trial status)
- User search and filtering
- Column visibility toggle
- Pagination (configurable users per page)
- User row click for detailed actions
- Ban users
- Set/manage trial dates
- Impersonate users for testing
- Send recovery emails
- Send Gmail notifications

### 🎨 UI/UX Features
- Professional Original-style design
- Responsive on mobile/tablet/desktop
- Dark mode optimized interface
- Smooth animations and transitions
- Hover effects (reveal action buttons)
- Active conversation indicator
- Floating input expander
- Loading overlay with status messages
- Welcome screen with personalized greeting
- Modal dialogs for authentication
- Professional scrollbar styling

### 🔊 Audio & Notifications
- Sound effects playback (customizable volume)
- SFX for messages and events
- Typing indicators with animation

### 📊 Content Rendering
- Safe markdown rendering (DOMPurify protection)
- Link detection and icon display
- HTML sanitization
- Code block formatting
- Emoji support

### ⚡ Performance Optimizations
- Debounced auto-save (500ms)
- Database indexes on critical fields
- Loads max 50 conversations (prevents lag)
- <500ms history load time
- <100ms search time
- <200ms rename/delete operations
- Optimized for 1000+ conversations
- <5MB memory usage

### 📱 Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### ♿ Accessibility
- Keyboard navigation (Tab/Enter)
- Screen reader friendly labels
- Focus indicators
- WCAG AA color contrast
- Touch-friendly button sizes

---

## 🚀 Platform Setup Order (REQUIRED SEQUENCE)

You **MUST** set up platforms in this exact order as they are interconnected:

### 1. Google Cloud Console
**Purpose**: Configure API keys for AI models and Google authentication

Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Go to [Google AI Studio](https://aistudio.google.com/)
4. Click **Get API key** in the lower left corner
5. Create a new API key and import your GCP project
6. Name and create your API key
7. **Save this key** - you'll need it for N8N

**What you get**: API key for Gemini AI models used in N8N workflows

---

### 2. GitHub
**Purpose**: Version control, file storage, and code collaboration

Steps:
1. [Sign up or log in to GitHub](https://github.com/signup)
2. Sign in with Google (optional)
3. Navigate to the [AILA Repository](https://github.com/FrekiJoms/AILA)
4. Click **Fork** to copy it to your account
5. Clone your forked repository to your local machine

**What you get**: Your own copy of the AILA codebase ready for customization

---

### 3. Tencent Cloud
**Purpose**: Cloud hosting and deployment of your AILA application

Steps:
1. Create a Tencent Cloud account
2. Set up a new project
3. Configure your cloud instance or serverless deployment
4. Obtain your hosting URL for testing

**What you get**: A live web address to test your AILA application

---

### 4. Firebase Studio
**Purpose**: Online code editor and workspace management

Steps:
1. Create a Firebase account
2. Set up Firebase Studio workspace
3. Import your GitHub repository
4. Configure your coding environment
5. Set up build and deployment pipelines

**What you get**: Cloud-based editor for managing your code without local setup

---

### 5. N8N - Visual Automation Workflow

#### 5.1 N8N Setup
**Purpose**: Automate workflows, integrate services, and power AI responses

Steps:
1. Sign up for [N8N Cloud](https://n8n.cloud/) or self-host N8N
2. Create a new workflow
3. Set up API credentials for:
   - Google Gemini (paste your GCP API key from Step 1)
   - Google Drive (for file uploads in RAG)
   - Supabase (will configure in next step)

**What you get**: Your automation engine ready for workflow configuration

#### 5.2 Main AI Chatbot Workflow
**Purpose**: Handle chat requests and generate AI responses

Key workflow components:
1. **Webhook** - Receives chat messages from your frontend
2. **Merge** - Combines request data
3. **Supabase** - Retrieves conversation history
4. **Aggregate** - Combines data into list format
5. **AI Agent** - Generates intelligent responses
6. **Google Gemini** - AI model for natural language processing
7. **Simple Memory** - Session memory management
8. **Tools**:
   - **Supabase** - Save conversation context
   - **Google Sheets** - Offline fallback database
   - **Pinecone** - Advanced RAG retrieval (optional)
9. **Respond to Webhook** - Send response back to frontend
10. **Google Sheets** - Log message history

**System Message Configuration**:
```
You are AILA (Artificial Intelligence Learning Assistant), 
a friendly and helpful AI guide.

RULES:
- Respond only to valid and relevant user input
- Use provided tools to retrieve context
- If information unavailable, state clearly
- Maintain a helpful and respectful tone

TOOLS:
- offline_response: For simple greetings and general info
- ict_files: For technical knowledge and detailed answers
- save_memory: For user preferences (use discreetly)
```

**Nodes Configuration Summary**:
- **AI Agent**: Set "Define below" for prompt, use `{{ $json.body.message }}`
- **Chat Model**: Google Gemini (recommended) or OpenRouter
- **Memory**: Simple memory with Session ID and 20+ context window
- **Response Format**: JSON with `{ "reply": {{ JSON.stringify($json.output) }} }`

#### 5.3 RAG Workflow (Optional Advanced Feature)
**Purpose**: Enable semantic search in uploaded files

Components:
1. **Google Drive Trigger** - Watches folder for new files
2. **Google Drive Download** - Retrieves file content
3. **Document Loader** - Converts to binary format
4. **Text Splitter** - Chunks content (500-1500 char chunks recommended)
5. **Pinecone Vector Store** - Stores embeddings
6. **Google Gemini Embeddings** - Creates vector representations

**Configuration**:
- Chunk size: 500-1500 (adjust based on file size)
- Chunk overlap: 100-200
- Include metadata: filename, file ID, timestamp
- Handle shortcuts with IF nodes for robustness

**What you get**: AI-powered semantic search across your documents

---

### 6. Supabase
**Purpose**: Secure database, user authentication, and data storage

#### Setup Steps:
1. Create [Supabase](https://supabase.com/) account
2. Create new project
3. Go to **SQL Editor** and create tables

#### Downloading Table Schemas:
Use Supabase CLI snippets to download pre-configured table schemas:

**Admins Table**:
```bash
supabase snippets download ce850bac-d2af-48d4-b487-13003960f80f > administrators_table.sql
```

**Conversation History Table**:
```bash
supabase snippets download 8741d876-a080-40e0-8aa2-5d6db40562b6 > conversation_history.sql
```

Run these SQL files in your SQL Editor to set up the tables.

#### Required Secret Keys:
After project creation, generate these keys in **Settings > API**:

```env
# Supabase Connection Keys
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=your-database-url
SERVICE_ROLE_KEY=your-service-role-key

# Webhook & API URLs
PROJECT_URL=https://your-project.supabase.co
CHAT_WEBHOOK_URL=your-n8n-chat-webhook-url
OFFLINE_DATA_URL=your-offline-data-api-url
SCRIPT_API_URL=your-apps-script-api-url
```

4. **Authentication Setup**:
   - Enable Email/Password auth
   - Enable Google OAuth (use GCP credentials from Step 1)
   - Enable PIN-based login (custom implementation)

5. **Set CORS Policy**:
   - Settings > CORS
   - Add your Tencent Cloud domain

**What you get**: Secure backend with user authentication and data persistence

---

### 7. Pinecone (Optional)
**Purpose**: Vector storage for semantic search and advanced RAG

Steps:
1. Create [Pinecone](https://www.pinecone.io/) account
2. Create new index (e.g., "aila-documents")
3. Set dimensions to match your embedding model (1536 for most models)
4. Copy API key
5. Configure in N8N RAG workflow (see section 5.3)

**What you get**: Advanced vector database for intelligent document search

---

### 8. Google Sheets & Apps Script
**Purpose**: Offline fallback database and automation

#### Google Sheets Setup:
1. Create new Google Sheet
2. Create these sheets:
   - **message_history** - Store all chat messages
   - **offline_response** - Predefined responses when N8N is unavailable
   - **user_logs** - Track user logins and sessions

**Column Headers**:
- message_history: Date | SESSION ID | INPUT | RESPONSE
- offline_response: keyword | response | category
- user_logs: timestamp | user_email | action | status

#### Apps Script Setup:
1. Open Google Sheet
2. Extensions > Apps Script
3. Create custom functions for:
   - User authentication fallback
   - Message retrieval when N8N down
   - Logging and analytics

**What you get**: Reliable offline fallback when primary services unavailable

---

### 9. Frontend & Backend Coding

#### Frontend (HTML/CSS/JavaScript):
Key features to implement:
- **Login Screen**: Google OAuth + PIN-based authentication
- **Chat Interface**: Message input, conversation history, real-time responses
- **Conversation History**: Load, switch, create new conversations
- **Admin Dashboard** (optional): Manage users, view analytics

**Important Implementation Details**:
```javascript
// After new message send:
- Clear input field
- Move conversation to top of history
- Don't reload full conversation history
- Only update active state indicator

// Authentication:
- Check JWT token before showing chat
- Block DevTools before login
- Handle session timeouts gracefully
```

#### Backend Integration:
1. **Supabase Edge Functions** - Serverless functions for:
   - User authentication verification
   - Message history retrieval
   - Conversation management

2. **Environment Variables** (.env):
   ```
   SUPABASE_URL=your-project-url
   SUPABASE_ANON_KEY=your-anon-key
   N8N_WEBHOOK_URL=your-webhook-url
   GOOGLE_API_KEY=your-gcp-api-key
   ```

3. **API Endpoints**:
   - POST /chat - Send message and get AI response
   - GET /conversations - List user conversations
   - POST /conversations - Create new conversation
   - DELETE /conversations/:id - Delete conversation

**What you get**: Complete working AILA application

---

## 📋 Testing & Debugging Checklist

- [ ] Test Google OAuth login
- [ ] Test PIN-based login
- [ ] Test new message sending and clearing
- [ ] Verify conversation history loads correctly
- [ ] Test conversation switching
- [ ] Verify new conversations move to top
- [ ] Test N8N webhook receives messages
- [ ] Verify AI responses appear in chat
- [ ] Test offline mode (disable N8N, verify fallback)
- [ ] Check Google Sheets logging
- [ ] Test admin dashboard functionality
- [ ] Verify DevTools blocking
- [ ] Test on multiple browsers

---

## 🔑 Key Configuration Reference

### Environment Variables Needed:
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=your-database-url
SERVICE_ROLE_KEY=your-service-role-key

# Webhook URLs
CHAT_WEBHOOK_URL=https://your-n8n-instance/webhook/chat
OFFLINE_DATA_URL=https://your-offline-data-api-url
SCRIPT_API_URL=https://your-apps-script-api-url
PROJECT_URL=https://your-project.supabase.co

# Google & AI Services
GOOGLE_API_KEY=your-gcp-gemini-api-key
PINECONE_API_KEY=your-pinecone-key (optional)
PINECONE_INDEX=aila-documents (optional)
```

### N8N Tool Names (Must Match System Message):
- `offline_response` - Predefined responses from Google Sheets
- `ict_files` - Knowledge base from Pinecone RAG
- `save_memory` - Store user preferences

### Database Tables:
- **admins** - Admin user management
- **conversation_history** - Chat message history and conversations

---

## 🛠️ Supabase Edge Functions Setup

Located in `supabase/functions/`:

### Deployed Functions (9 total):

| Function | Purpose | Deployments |
|----------|---------|-------------|
| **conversation-history** | Retrieve and manage conversation history | 7 |
| **get-offline-data** | Fetch offline response data from Google Sheets | 7 |
| **get-users** | Admin function to list and retrieve users | 1 |
| **impersonate-user** | Admin function to test as another user | 12 |
| **log-event** | Log user actions and events | 7 |
| **manage-admins** | Manage admin user roles and permissions | 1 |
| **send-chat-message** | Send messages to N8N webhook | 7 |
| **set-trial-days** | Set trial period for users | 16 |
| **smooth-endpoint** | Utility endpoint for smooth operations | 11 |

### Function Base URL:
```
https://woqlvcgryahmcejdlcqz.supabase.co/functions/v1/[function-name]
```

### CORS Configuration:
All functions use shared CORS handler in `_shared/cors.ts` to allow requests from your Tencent Cloud domain.

### Deployment:
```bash
# Deploy a specific function
supabase functions deploy conversation-history

# Deploy all functions
supabase functions deploy
```

### Testing Functions Locally:
```bash
supabase functions serve conversation-history
```

---

## 💡 Important Notes

1. **Order Matters**: Set up platforms in the exact order listed. Each builds on the previous.

2. **API Keys**: Store all keys in environment variables, never commit to git.

3. **Testing Webhooks**: Use tools like Postman to test N8N webhooks before frontend integration.

4. **Conversation History Bug Fixes**:
   - Clearing input after send: Called automatically in `appendMessage()`
   - Moving to top: Only happens on message save, not on history click
   - Use `updateConversationPosition()` after `saveConversation()`

5. **DevTools Security**: Block DevTools before user login to prevent unauthorized access.

6. **Fallback Strategy**: Google Sheets should always contain offline responses for when N8N is unavailable.

---

## 📚 Additional Resources

- [N8N Documentation](https://docs.n8n.io/)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Cloud Console Guide](https://cloud.google.com/docs)
- [Pinecone RAG Guide](https://docs.pinecone.io/)
- [GitHub Workflow Guide](https://guides.github.com/)

---

## ✅ Setup Complete

Once you've completed all 9 platform setups:
1. Your frontend will communicate with N8N webhooks
2. N8N will use Supabase for history and Google Sheets for fallback
3. Pinecone (optional) will enable semantic document search
4. Users can authenticate via Google or PIN
5. Chat history persists and conversations appear in correct order
6. Offline mode gracefully falls back to predefined responses

**Happy building! 🚀**
