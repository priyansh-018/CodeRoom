"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoomHandlers = setupRoomHandlers;
const roomStore_js_1 = require("./roomStore.js");
const db_js_1 = require("../db.js");
function setupRoomHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);
        // Join room with authenticated credentials and role
        socket.on('join-room', async (data) => {
            const { roomId, user, initialLanguage } = data;
            if (!roomId)
                return;
            // Check if room has ended (in-memory or in database)
            if (roomStore_js_1.roomStore.isRoomEnded(roomId)) {
                console.log(`🚫 Blocked join to ended room ${roomId} by user ${user.name}`);
                socket.emit('room-ended', roomStore_js_1.roomStore.getEndedSessionData(roomId));
                return;
            }
            try {
                const endedSession = await db_js_1.prisma.session.findFirst({
                    where: { roomId, endedAt: { not: null } }
                });
                if (endedSession) {
                    console.log(`🚫 Database indicates room ${roomId} has ended. Blocking entry.`);
                    const endedData = {
                        roomId,
                        sessionId: endedSession.id,
                        score: endedSession.score,
                        summary: endedSession.summary,
                        problemName: endedSession.problemName,
                        violationCount: endedSession.violationCount,
                        endedAt: endedSession.endedAt ? endedSession.endedAt.toISOString() : new Date().toISOString()
                    };
                    roomStore_js_1.roomStore.endRoom(roomId, endedData);
                    socket.emit('room-ended', endedData);
                    return;
                }
            }
            catch (dbErr) {
                // Continue if DB check fails
            }
            // For collaborative live interviews, candidates cannot join non-existent phantom rooms
            const isAiRoom = roomId.startsWith('ai-mock');
            const isHost = user.role === 'HOST';
            if (!isAiRoom && !isHost && !roomStore_js_1.roomStore.hasRoom(roomId)) {
                console.log(`🚫 Candidate ${user.name} attempted to join non-existent room: ${roomId}`);
                socket.emit('room-error', {
                    error: 'ROOM_NOT_FOUND',
                    message: `Room "${roomId}" does not exist. Please check your room code with your interviewer.`
                });
                return;
            }
            socket.join(roomId);
            const roomUser = {
                socketId: socket.id,
                userId: user.userId,
                name: user.name || 'Anonymous Coder',
                role: user.role || 'CANDIDATE',
                avatarUrl: user.avatarUrl,
                color: user.color || '#6366f1'
            };
            const room = roomStore_js_1.roomStore.addUser(roomId, roomUser);
            if (initialLanguage && !room.language) {
                room.language = initialLanguage;
            }
            console.log(`👤 User "${roomUser.name}" [${roomUser.role}] (${socket.id}) joined room: ${roomId}`);
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
        // WebRTC Peer Signaling (Offer / Answer / ICE Candidates for live video/audio)
        socket.on('webrtc-signal', (data) => {
            const payload = {
                fromSocketId: socket.id,
                signal: data.signal,
                senderName: data.senderName,
                senderRole: data.senderRole
            };
            if (data.targetSocketId && data.targetSocketId !== 'broadcast') {
                io.to(data.targetSocketId).emit('webrtc-signal', payload);
            }
            else if (data.roomId) {
                socket.to(data.roomId).emit('webrtc-signal', payload);
            }
        });
        // Notify room that participant is ready for WebRTC stream
        socket.on('webrtc-ready', (data) => {
            socket.to(data.roomId).emit('webrtc-peer-ready', {
                socketId: socket.id,
                role: data.role,
                name: data.name
            });
        });
        // Notify room of media state changes (camera / microphone toggled)
        socket.on('media-state-changed', (data) => {
            socket.to(data.roomId).emit('user-media-state', {
                socketId: socket.id,
                videoEnabled: data.videoEnabled,
                audioEnabled: data.audioEnabled,
                senderRole: data.senderRole,
                senderName: data.senderName
            });
        });
        // Anti-Cheating & Proctoring Event
        socket.on('proctoring-violation', async (data) => {
            console.warn(`🚨 PROCTORING VIOLATION in room ${data.roomId} by ${data.candidateName}: ${data.eventType}`);
            // Broadcast high-priority alert to all users (especially Hosts) in the room
            io.to(data.roomId).emit('proctor-alert', {
                ...data,
                message: `Candidate ${data.candidateName} switched away from the interview screen! (${data.eventType})`
            });
            // Persist event to database under active session
            try {
                const activeSession = await db_js_1.prisma.session.findFirst({
                    where: { roomId: data.roomId },
                    orderBy: { startedAt: 'desc' }
                });
                if (activeSession) {
                    await db_js_1.prisma.sessionEvent.create({
                        data: {
                            sessionId: activeSession.id,
                            type: 'PROCTOR_VIOLATION',
                            payload: {
                                candidateName: data.candidateName,
                                candidateId: data.candidateId,
                                eventType: data.eventType,
                                violationCount: data.violationCount
                            },
                            timestamp: new Date(data.timestamp)
                        }
                    });
                    await db_js_1.prisma.session.update({
                        where: { id: activeSession.id },
                        data: {
                            violationCount: { increment: 1 }
                        }
                    });
                }
            }
            catch (dbErr) {
                console.error('Failed to log proctoring event to database', dbErr);
            }
        });
        // End Interview Room by Host
        socket.on('end-room', (data) => {
            console.log(`🏁 Room ${data.roomId} ended by host. Broadcasting completion...`);
            const endedData = {
                roomId: data.roomId,
                sessionId: data.sessionId,
                score: data.score,
                summary: data.summary,
                problemName: data.problemName,
                violationCount: data.violationCount,
                endedAt: new Date().toISOString()
            };
            roomStore_js_1.roomStore.endRoom(data.roomId, endedData);
            io.to(data.roomId).emit('room-ended', endedData);
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
        // Room Title Update (Renaming by Host)
        socket.on('update-room-title', (data) => {
            const { roomId, title } = data;
            if (!roomId || !title)
                return;
            roomStore_js_1.roomStore.updateTitle(roomId, title);
            console.log(`📝 Room ${roomId} title updated to: "${title}" by ${socket.id}`);
            io.to(roomId).emit('room-title-updated', { title });
        });
        // SQL Schema Sync
        socket.on('update-sql-schema', (data) => {
            socket.to(data.roomId).emit('sql-schema-updated', { schema: data.schema });
        });
        // Code Execution sync
        socket.on('execution-started', (data) => {
            socket.to(data.roomId).emit('execution-started', data);
        });
        socket.on('code-run-result', (data) => {
            console.log(`💻 Code execution finished in room: ${data.roomId}`);
            io.to(data.roomId).emit('execution-finished', data.result);
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
