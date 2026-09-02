"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomStore = void 0;
class RoomStore {
    rooms = new Map();
    endedRooms = new Map();
    getOrCreateRoom(roomId, defaultTitle = 'Mock Interview Session', defaultLanguage = 'javascript', initialCode) {
        if (!this.rooms.has(roomId)) {
            const defaultStarter = initialCode || '';
            this.rooms.set(roomId, {
                roomId,
                title: defaultTitle,
                language: defaultLanguage,
                code: defaultStarter,
                version: 1,
                users: new Map(),
                createdAt: new Date(),
                updatedAt: new Date(),
                isEnded: this.endedRooms.has(roomId),
                endedSessionData: this.endedRooms.get(roomId)
            });
        }
        const room = this.rooms.get(roomId);
        if (this.endedRooms.has(roomId)) {
            room.isEnded = true;
            room.endedSessionData = this.endedRooms.get(roomId);
        }
        return room;
    }
    hasRoom(roomId) {
        return this.rooms.has(roomId);
    }
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    endRoom(roomId, sessionData) {
        this.endedRooms.set(roomId, sessionData);
        const room = this.rooms.get(roomId);
        if (room) {
            room.isEnded = true;
            room.endedSessionData = sessionData;
            room.updatedAt = new Date();
        }
    }
    isRoomEnded(roomId) {
        if (this.endedRooms.has(roomId))
            return true;
        const room = this.rooms.get(roomId);
        return !!(room && room.isEnded);
    }
    getEndedSessionData(roomId) {
        return this.endedRooms.get(roomId) || this.rooms.get(roomId)?.endedSessionData;
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
    updateTitle(roomId, title) {
        const room = this.getOrCreateRoom(roomId);
        room.title = title;
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
