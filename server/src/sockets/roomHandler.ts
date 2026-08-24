import { Server, Socket } from 'socket.io';
import { roomStore, RoomUser } from './roomStore.js';

export function setupRoomHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join room
    socket.on('join-room', (data: { roomId: string; user: { name: string; color: string; userId?: string }; initialLanguage?: string }) => {
      const { roomId, user, initialLanguage } = data;
      if (!roomId) return;

      socket.join(roomId);

      const roomUser: RoomUser = {
        socketId: socket.id,
        userId: user.userId,
        name: user.name || 'Anonymous Coder',
        color: user.color || '#6366f1'
      };

      const room = roomStore.addUser(roomId, roomUser);
      if (initialLanguage && !room.language) {
        room.language = initialLanguage;
      }

      console.log(`👤 User "${roomUser.name}" (${socket.id}) joined room: ${roomId}`);

      // Send initial room snapshot to joining user
      socket.emit('room-state', {
        roomId: room.roomId,
        title: room.title,
        language: room.language,
        code: room.code,
        version: room.version,
        users: Array.from(room.users.values())
      });

      // Notify others in room
      socket.to(roomId).emit('user-joined', {
        user: roomUser,
        users: Array.from(room.users.values())
      });

      // Broadcast updated presence list
      io.to(roomId).emit('presence-update', {
        users: Array.from(room.users.values())
      });
    });

    // Delta Code Synchronization
    socket.on('code-delta', (data: { roomId: string; changes: any[]; fullCode: string }) => {
      const { roomId, changes, fullCode } = data;
      if (!roomId) return;

      const newVersion = roomStore.updateCode(roomId, fullCode);

      // Broadcast delta to all other clients in the room
      socket.to(roomId).emit('remote-delta', {
        changes,
        fullCode,
        version: newVersion,
        senderSocketId: socket.id
      });
    });

    // Cursor & Selection Awareness
    socket.on('cursor-move', (data: { roomId: string; cursor?: { lineNumber: number; column: number }; selection?: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number } }) => {
      const { roomId, cursor, selection } = data;
      if (!roomId) return;

      roomStore.updateUserCursor(roomId, socket.id, cursor, selection);

      socket.to(roomId).emit('remote-cursor', {
        socketId: socket.id,
        cursor,
        selection
      });
    });

    // Language Change
    socket.on('language-change', (data: { roomId: string; language: string; newCode?: string }) => {
      const { roomId, language, newCode } = data;
      if (!roomId) return;

      const room = roomStore.updateLanguage(roomId, language);
      if (newCode) {
        roomStore.updateCode(roomId, newCode);
      }

      io.to(roomId).emit('language-changed', {
        language,
        code: newCode || room.code,
        senderSocketId: socket.id
      });
    });

    // Code Execution sync
    socket.on('execution-started', (data: { roomId: string; language: string; triggeredBy: string }) => {
      socket.to(data.roomId).emit('execution-started', data);
    });

    socket.on('execution-finished', (data: { roomId: string; result: any }) => {
      io.to(data.roomId).emit('execution-finished', data.result);
    });

    // AI Question & Feedback Sync
    socket.on('ai-question-selected', (data: { roomId: string; question: any }) => {
      io.to(data.roomId).emit('ai-question-updated', data.question);
    });

    socket.on('ai-feedback-generated', (data: { roomId: string; feedback: any }) => {
      io.to(data.roomId).emit('ai-feedback-updated', data.feedback);
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      const result = roomStore.removeUser(socket.id);
      if (result) {
        const { roomId, user, remainingUsers } = result;
        console.log(`👋 User "${user.name}" left room ${roomId}`);

        io.to(roomId).emit('user-left', {
          socketId: socket.id,
          user,
          users: remainingUsers
        });

        io.to(roomId).emit('presence-update', {
          users: remainingUsers
        });
      }
    });
  });
}
