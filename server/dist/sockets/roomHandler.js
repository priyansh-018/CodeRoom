"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoomHandlers = setupRoomHandlers;
const roomStore_js_1 = require("./roomStore.js");
function setupRoomHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);
        // Join room
        socket.on('join-room', (data) => {
            const { roomId, user, initialLanguage } = data;
            if (!roomId)
                return;
            socket.join(roomId);
            const roomUser = {
                socketId: socket.id,
                userId: user.userId,
                name: user.name || 'Anonymous Coder',
                color: user.color || '#6366f1'
            };
            const room = roomStore_js_1.roomStore.addUser(roomId, roomUser);
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
        socket.on('code-delta', (data) => {
            const { roomId, changes, fullCode } = data;
            if (!roomId)
                return;
            const newVersion = roomStore_js_1.roomStore.updateCode(roomId, fullCode);
            // Broadcast delta to all other clients in the room
            socket.to(roomId).emit('remote-delta', {
                changes,
                fullCode,
                version: newVersion,
                senderSocketId: socket.id
            });
        });
        // Cursor & Selection Awareness
        socket.on('cursor-move', (data) => {
            const { roomId, cursor, selection } = data;
            if (!roomId)
                return;
            roomStore_js_1.roomStore.updateUserCursor(roomId, socket.id, cursor, selection);
            socket.to(roomId).emit('remote-cursor', {
                socketId: socket.id,
                cursor,
                selection
            });
        });
        // Language Change
        socket.on('language-change', (data) => {
            const { roomId, language, newCode } = data;
            if (!roomId)
                return;
            const room = roomStore_js_1.roomStore.updateLanguage(roomId, language);
            if (newCode) {
                roomStore_js_1.roomStore.updateCode(roomId, newCode);
            }
            io.to(roomId).emit('language-changed', {
                language,
                code: newCode || room.code,
                senderSocketId: socket.id
            });
        });
        // Code Execution sync
        socket.on('execution-started', (data) => {
            socket.to(data.roomId).emit('execution-started', data);
        });
        socket.on('execution-finished', (data) => {
            io.to(data.roomId).emit('execution-finished', data.result);
        });
        // AI Question & Feedback Sync
        socket.on('ai-question-selected', (data) => {
            io.to(data.roomId).emit('ai-question-updated', data.question);
        });
        socket.on('ai-feedback-generated', (data) => {
            io.to(data.roomId).emit('ai-feedback-updated', data.feedback);
        });
        // Disconnect handling
        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
            const result = roomStore_js_1.roomStore.removeUser(socket.id);
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
