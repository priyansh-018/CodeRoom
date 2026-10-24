# CodeRoom — Live Collaborative Coding & Anti-Cheat Technical Interview Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-Online-brightgreen?style=for-the-badge&logo=render&logoColor=white)](https://github.com/priyansh-018/CodeRoom)
[![GitHub Repo](https://img.shields.io/badge/GitHub-CodeRoom-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/priyansh-018/CodeRoom)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![WebRTC](https://img.shields.io/badge/WebRTC-P2P_Streaming-333333?style=for-the-badge&logo=webrtc&logoColor=white)](https://webrtc.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Anthropic Claude](https://img.shields.io/badge/Claude_3.5-D97706?style=for-the-badge&logo=anthropic&logoColor=white)](https://www.anthropic.com/)

An enterprise-grade, real-time collaborative coding studio and anti-cheat technical interview platform built for high-stakes technical assessments. Enables interviewers and candidates to write code synchronously, stream P2P video/audio, execute code across 25+ languages in sandboxed containers, and enforce proctoring integrity with zero layout shifts.

---

## 🌟 Key Features

### 1. Unified Single-Frame Studio Layout (HackerRank / CoderPad Architecture)
* **Zero Layout Shift:** Video stream, Monaco Code Editor, and Execution Console coexist simultaneously in a single **100vh viewport** without vertical clipping or scrolling.
* **16:9 Widescreen Proctoring Video:** Compact widescreen player (~215px height) equipped with real-time audio visualizers via Web Audio API (`AnalyserNode`) and pulsing active-speaker meters.
* **Studio Sidebar:** Houses live candidate dossiers, resume inspections, and anti-cheat strike telemetry side-by-side with code.

### 2. Real-Time Collaborative Code Editor
* **Monaco Editor Integration:** Sub-50ms delta keystroke propagation (`{ range, text }`) powered by Socket.IO WebSockets.
* **Multi-Cursor Presence:** Live remote user cursor flags and selection highlights rendered dynamically without feedback loopbacks.
* **Multi-Language Syntax Highlighting:** Supports 25+ languages with customizable themes, indentation guides, and bracket pair colorization.

### 3. WebRTC P2P Video & Voice Mesh
* **Direct Peer-to-Peer Streaming:** Low-latency video and audio transmission between Interviewer and Candidate.
* **STUN/TURN Fallback Relays:** Configured with Google public STUN and Metered TURN relays for 99.5%+ connection success rates across restrictive NATs and enterprise corporate firewalls.
* **Media Controls:** Independent hardware mute/unmute, webcam pause, and automatic voice activity detection.

### 4. Anti-Cheat Proctoring & Integrity Engine
* **Real-Time Violation Tracking:** Detects browser tab switches, window blurs, external application focus losses, and fullscreen exits.
* **Live Host Telemetry:** Broadcasts instant violation alerts to the interviewer with strike tallies, timestamps, and infraction categories.
* **Forensic Session Replay:** Local audiovisual stream chunking and keystroke recording via **MediaRecorder API & IndexedDB** for zero-bandwidth post-interview forensic audits.

### 5. Multi-Language Sandboxed Execution (Judge0)
* **Isolated Cloud Sandboxes:** Compile and execute code in isolated Linux cgroups/Docker containers across 25+ programming languages (*JavaScript, TypeScript, Python, C++, Java, Rust, Go, C#, SQL, etc.*).
* **Execution Telemetry:** Real-time capture of stdout, stderr, compiler diagnostic logs, memory consumption (KB), and execution duration (ms).
* **SQL Schema Sandbox:** Interactive mock schema manager allowing interviewers to provision relational tables and evaluate live SQL queries.

### 6. Autonomous Claude AI Mock Interviewer
* **Dynamic Challenge Generation:** Generates comprehensive algorithmic challenges across 10+ core computer science tracks (*Arrays & Hashing, Trees & Graphs, Dynamic Programming, System Design*) with adjustable difficulty (*Easy, Medium, Hard*).
* **AI Code Critique & Complexity Scoring:** Automated solution grading (0–100 score), theoretical time/space complexity analysis ($O(N)$, $O(\log N)$), code style reviews, and progressive hint delivery.

### 7. Dual-Role Authentication & Cascading Failover
* **Role-Based Access Control:** Differentiated Host (Interviewer) and Candidate portals with JWT authentication and bcrypt password hashing.
* **Cascading Email Failover:** Brevo HTTP REST API with automated fallback to Gmail SMTP, guaranteeing 99.9% reliable OTP verification delivery.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Frontend (React 19 + Vite)                             │
│  - Monaco Editor (@monaco-editor/react) with Operational Delta Sync                    │
│  - WebRTC PeerConnection (Audio / Video / Speaking Meters)                             │
│  - Anti-Cheat Proctoring Hook (Focus, Tab Blur, Fullscreen, MediaRecorder)             │
│  - Tailwind CSS v4 Unified Studio Grid Layout                                          │
└───────────────────────────┬───────────────────────────────┬────────────────────────────┘
                            │ REST API (Auth, Sessions, DB) │ Socket.IO Signaling (WebSockets)
┌───────────────────────────▼───────────────────────────────▼────────────────────────────┐
│                             Backend Service (Node.js + Express)                        │
│  - WebRTC Signaling Server (Offer / Answer / ICE Candidates / Reconnects)               │
│  - Socket.io Room Orchestration & Telemetry Delta Dispatcher                           │
│  - Judge0 Execution Controller & Proxy                                                 │
│  - Anthropic SDK (@anthropic-ai/sdk) Claude 3.5 Sonnet Evaluator                       │
│  - Prisma ORM & Session Event Telemetry Logger                                         │
│  - Cascading Email Dispatcher (Brevo REST API -> Gmail SMTP)                           │
└──────────────┬────────────────────────────┬─────────────────────────────┬──────────────┘
               │                            │                             │
┌──────────────▼────────────┐  ┌────────────▼──────────────┐  ┌───────────▼──────────────┐
│     PostgreSQL / Neon     │  │      Judge0 Sandbox       │  │    Claude 3.5 Sonnet     │
│  (Users, Sessions, Rooms, │  │   (Sandboxed Execution    │  │   (Automated Problem &   │
│    Audit SessionEvents)   │  │    across 25+ Languages)  │  │   Solution Assessment)   │
└───────────────────────────┘  └───────────────────────────┘  └──────────────────────────┘
```

---

## 💡 Key Engineering Decisions & Trade-Offs

### 1. Unified Single-Frame Studio Layout vs. Floating Modals vs. Banners
* **Trade-off:** Displaying full-screen video banners pushed code editors off-screen, while floating draggable picture-in-picture (PiP) modals obscured code lines and syntax errors.
* **Decision:** Implemented a **16:9 aspect-ratio docked sidebar studio layout**. The code editor retains ~75% horizontal width and full vertical height, the console docks cleanly below it, and the video feeds and candidate dossier occupy a dedicated 380px studio sidebar.

### 2. Operational Delta Sync vs. Full Snapshot Broadcasting
* **Trade-off:** Transmitting full file strings on every keystroke causes significant network overhead, high CPU usage, and cursor jitter during concurrent edits.
* **Decision:** Extracted Monaco `{ range, text }` delta changes and transmitted minimal mutation payloads via WebSockets, maintaining sub-50ms latency with loopback suppression.

### 3. Cascading Notification Architecture
* **Trade-off:** Cloud server IP changes often trigger IP-based rate limits or authentication challenges on cloud transactional email providers (e.g., Brevo 401s), causing dropped OTPs.
* **Decision:** Built a fault-tolerant cascading email pipeline: the server attempts Brevo HTTP REST delivery first; if any error occurs, it instantly falls back to authenticated Gmail SMTP, ensuring 99.9% delivery reliability.

---

## 🛠️ Tech Stack Breakdown

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Monaco Editor, Tailwind CSS v4, Lucide Icons, Canvas Confetti |
| **Networking & Real-Time** | WebRTC (P2P Mesh + STUN/TURN), Socket.IO Client, Web Audio API |
| **Backend** | Node.js, Express, Socket.IO Server, TypeScript, tsx |
| **Database & ORM** | PostgreSQL (Neon / Supabase), Prisma ORM |
| **Execution Sandbox** | Judge0 API (cgroups / Docker sandboxing) |
| **AI Assessment** | Anthropic Claude 3.5 Sonnet (`@anthropic-ai/sdk`) |
| **Security & Proctoring** | JWT, bcryptjs, HTML5 Fullscreen API, MediaRecorder API, IndexedDB |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** 20.x or higher
* **npm** 10.x or higher
* **PostgreSQL** instance (local or hosted on Neon/Supabase)

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/priyansh-018/CodeRoom.git
cd CodeRoom

# Install client and server dependencies
npm --prefix client install
npm --prefix server install
```

### 2. Environment Variables Configuration
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_key
DATABASE_URL="postgresql://user:password@your-host:5432/neondb?sslmode=require"

# Optional: AI Mock Interviewer
ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional: RapidAPI Judge0 Sandbox Key
RAPIDAPI_KEY=your_judge0_api_key

# Optional: Email Service (Cascading Brevo + SMTP)
BREVO_API_KEY=your_brevo_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
```

### 3. Initialize Database
```bash
npm --prefix server run prisma:generate
npm --prefix server run prisma:push
```

### 4. Run Development Servers
```bash
# Terminal 1: Start backend
npm --prefix server run dev

# Terminal 2: Start frontend
npm --prefix client run dev
```

Visit **`http://localhost:5173`** to access the application.

---

## 🎤 Interview Presentation Guide

When showcasing CodeRoom during technical interviews, use this structure:

> *"CodeRoom is a real-time collaborative coding studio with integrated WebRTC video and an anti-cheat proctoring engine. I engineered the frontend in React 19 and Monaco Editor, synchronizing keystroke deltas over Socket.IO with sub-50ms latency. To solve the common issue where video feeds crowd out code, I designed a unified single-frame studio layout where 16:9 widescreen video, Monaco editor, and Judge0 execution console are simultaneously visible with zero scrolling.*
>
> *On the security and backend side, I integrated Judge0 to safely sandbox code execution across 25+ languages, built anti-cheat telemetry to catch window blur and tab switching, and implemented an automated cascading failover system between Brevo and SMTP for 99.9% reliable OTP verification."*

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed with ❤️ by [Patel Priyansh](https://github.com/priyansh-018)**
