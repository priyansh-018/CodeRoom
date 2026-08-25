# CodeRoom — Live Collaborative Coding & Mock Interview Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Anthropic Claude](https://img.shields.io/badge/Claude_3.5-D97706?style=for-the-badge&logo=anthropic&logoColor=white)](https://www.anthropic.com/)

A full-stack, real-time collaborative code editor and AI mock technical interview platform. Two users can share a live-synced Monaco editor with delta keystrokes and remote cursor presence, run code across 8+ languages in sandboxed containers, and practice with an AI Interviewer powered by Claude.

---

## 🌟 Key Features

1. **Delta-Based Real-Time Code Synchronization:**
   - Keystroke-level updates via Monaco Editor (`onDidChangeModelContent`) broadcasting `{ range, text }` deltas over WebSocket.
   - Built-in remote update loopback prevention guard.
   - Live presence indicator with colored remote cursors and selection highlight decorations.
   - Disconnect and reconnect resilience with live status pill.

2. **Sandboxed Multi-Language Code Execution:**
   - Multi-language support: **JavaScript, TypeScript, Python 3, Java, C++, Go, Rust, C#**.
   - Remote code execution offloaded to **Judge0 API** containers.
   - Shared execution console broadcasting stdout, stderr, compile output, memory usage, and execution timing.

3. **Claude AI Interviewer Mode:**
   - On-demand interview question generator by topic (*Arrays & Hashing, Two Pointers, Sliding Window, Trees & Graphs, Dynamic Programming, System Design*) and difficulty (*Easy, Medium, Hard*).
   - Real-time solution evaluator providing Big-O time and space complexity estimates, edge-case hints, code readability critiques, and candidate scorecards.

4. **Auth & Session Persistence:**
   - JWT authentication with bcrypt password hashing.
   - PostgreSQL schema via Prisma ORM for **Neon** database.
   - Session history tracking past mock interviews and AI evaluation scores.

5. **Session Replay:**
   - Timeline scrubber UI to step back and forward through interview keystrokes with variable playback speeds (1x, 2x, 4x).

---

## 🏗️ Architecture & System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│  - Monaco Editor (@monaco-editor/react)                     │
│  - TailwindCSS v4 + Dark Glassmorphic Design System        │
│  - Socket.io-client (Real-time delta sync + Presence)       │
│  - React Router DOM (Landing, Auth, Dashboard, Room)        │
└──────────────┬───────────────────────────────┬──────────────┘
               │ REST API (Auth, Sessions, AI) │ WebSocket (Deltas, Presence, Run)
┌──────────────▼───────────────────────────────▼──────────────┐
│                  Backend (Node.js + Express)                │
│  - Socket.io Server (Rooms, Keystroke Deltas, Cursors)      │
│  - JWT Authentication Middleware & Endpoints                │
│  - Judge0 Proxy / Execution Controller                      │
│  - Anthropic SDK (@anthropic-ai/sdk) AI Interviewer Engine   │
│  - Prisma ORM Client (Neon PostgreSQL)                      │
└──────────────┬──────────────────┬────────────┬──────────────┘
               │                  │            │
┌──────────────▼───┐     ┌────────▼───┐   ┌────▼─────────────┐
│ Neon PostgreSQL   │     │ Judge0 API │   │ Anthropic API    │
│ (Users, Sessions,│     │ (Sandboxed │   │ (Claude 3.5      │
│  Events, Rooms)  │     │ Execution) │   │  Interviewer)    │
└──────────────────┘     └────────────┘   └──────────────────┘
```

---

## 💡 Key Technical Decisions & Trade-offs

### 1. Delta-Based Synchronization vs. Full Document Broadcast vs. OT/CRDT
- **Trade-off:** Broadcasting the entire document string on every keystroke causes significant network overhead and cursor jumps. Full Operational Transformation (OT) or CRDT algorithms add architectural complexity.
- **Decision:** Implemented **Monaco delta-based event sync** (`{ range, text }`). When a local change occurs, deltas and the new buffer snapshot are transmitted. Receiving clients apply changes while disabling local event broadcasting to prevent infinite feedback loops. Documented limitation: simultaneous edits at identical index offsets will resolve to the latest server-acknowledged state.

### 2. Code Execution Security & Judge0 Offloading
- **Trade-off:** Running untrusted user-submitted code directly on the host application server risks Remote Code Execution (RCE), denial-of-service, and resource exhaustion.
- **Decision:** Offloaded code compilation and execution to **Judge0 API** running in isolated Linux cgroups/Docker containers with strict time and memory limits.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/CodeRoom.git
cd CodeRoom

# Install root, client, and server dependencies
npm install --prefix client
npm install --prefix server
```

### 2. Environment Configuration
Create a `.env` file in the `server/` directory:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
DATABASE_URL="postgresql://user:pass@ep-cool-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Optional: Claude AI API Key (falls back to built-in AI question bank if omitted)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional: Judge0 RapidAPI Key (falls back to public CE / sandbox runner)
RAPIDAPI_KEY=your_rapidapi_key_here
```

### 3. Run Locally (Development)
```bash
# Start backend server
npm --prefix server run dev

# Start frontend (in a new terminal)
npm --prefix client run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Testing

Run the automated multi-client socket delta sync and full API test suites:
```bash
# Run Socket.io multi-client delta sync test
npx --prefix server tsx test-socket.ts

# Run Full API route integration test (Auth, Judge0, Claude AI, Sessions)
npx --prefix server tsx test-api.ts
```

---

## 🎤 How to Describe This Project in Interviews

> *"I built CodeRoom, a real-time collaborative coding platform for technical mock interviews. I engineered keystroke delta synchronization over WebSockets with loopback prevention and live cursor presence. To guarantee host security against untrusted code execution, I integrated sandboxed execution via Judge0 across 8 languages. I also integrated Claude AI to generate structured interview questions and assess candidate solutions with Big-O complexity analysis and hint recommendations."*
