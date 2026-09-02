import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupRoomHandlers } from './sockets/roomHandler.js';
import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import codeRoutes from './routes/codeRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import webrtcRoutes from './routes/webrtcRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Root status endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'CodeRoom API & WebSocket Server',
    status: 'online',
    frontendUrl: 'http://localhost:5173',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      sessions: '/api/sessions',
      ai: '/api/ai',
      execute: '/api/execute',
      support: '/api/support/contact'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/webrtc', webrtcRoutes);
app.use('/api', codeRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Initialize socket handlers
setupRoomHandlers(io);

server.listen(PORT, () => {
  console.log(`🚀 CodeRoom Server listening on http://localhost:${PORT}`);
});