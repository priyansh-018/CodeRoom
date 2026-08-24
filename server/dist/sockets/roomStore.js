"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomStore = void 0;
class RoomStore {
    rooms = new Map();
    getOrCreateRoom(roomId, defaultTitle = 'Mock Interview Session', defaultLanguage = 'javascript', initialCode) {
        if (!this.rooms.has(roomId)) {
            const defaultStarter = initialCode || `// Welcome to CodeRoom!
// Start typing below to collaborate in real-time.

function solution() {
  console.log("Hello, collaborative interviewer!");
}

solution();
`;
            this.rooms.set(roomId, {
                roomId,
                title: defaultTitle,
                language: defaultLanguage,
                code: defaultStarter,
                version: 1,
                users: new Map(),
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        return this.rooms.get(roomId);
    }
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    addUser(roomId, user) {
        const room = this.getOrCreateRoom(roomId);
        room.users.set(user.socketId, user);
        room.updatedAt = new Date();
        return room;
    }
    removeUser(socketId) {
        for (const [roomId, room] of this.rooms.entries()) {
            if (room.users.has(socketId)) {
                const user = room.users.get(socketId);
                room.users.delete(socketId);
                room.updatedAt = new Date();
                const remainingUsers = Array.from(room.users.values());
                // We can keep rooms alive or cleanup if empty after long timeout
                return { roomId, user, remainingUsers };
            }
        }
        return null;
    }
    updateCode(roomId, fullCode) {
        const room = this.getOrCreateRoom(roomId);
        room.code = fullCode;
        room.version += 1;
        room.updatedAt = new Date();
        return room.version;
    }
    updateLanguage(roomId, language) {
        const room = this.getOrCreateRoom(roomId);
        room.language = language;
        room.updatedAt = new Date();
        return room;
    }
    updateUserCursor(roomId, socketId, cursor, selection) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const user = room.users.get(socketId);
        if (user) {
            user.cursor = cursor;
            user.selection = selection;
        }
    }
    getUsers(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return [];
        return Array.from(room.users.values());
    }
}
exports.roomStore = new RoomStore();
