export interface RoomUser {
  socketId: string;
  userId?: string;
  name: string;
  role?: 'HOST' | 'CANDIDATE';
  avatarUrl?: string;
  color: string;
  cursor?: {
    lineNumber: number;
    column: number;
  };
  selection?: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  isTyping?: boolean;
}

export interface StoredRoom {
  roomId: string;
  title: string;
  language: string;
  code: string;
  version: number;
  users: Map<string, RoomUser>;
  createdAt: Date;
  updatedAt: Date;
  isEnded?: boolean;
  endedSessionData?: any;
}

class RoomStore {
  private rooms: Map<string, StoredRoom> = new Map();
  private endedRooms: Map<string, any> = new Map();

  public getOrCreateRoom(roomId: string, defaultTitle = 'Mock Interview Session', defaultLanguage = 'javascript', initialCode?: string): StoredRoom {
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

    const room = this.rooms.get(roomId)!;
    if (this.endedRooms.has(roomId)) {
      room.isEnded = true;
      room.endedSessionData = this.endedRooms.get(roomId);
    }
    return room;
  }

  public getRoom(roomId: string): StoredRoom | undefined {
    return this.rooms.get(roomId);
  }

  public endRoom(roomId: string, sessionData: any): void {
    this.endedRooms.set(roomId, sessionData);
    const room = this.rooms.get(roomId);
    if (room) {
      room.isEnded = true;
      room.endedSessionData = sessionData;
      room.updatedAt = new Date();
    }
  }

  public isRoomEnded(roomId: string): boolean {
    if (this.endedRooms.has(roomId)) return true;
    const room = this.rooms.get(roomId);
    return !!(room && room.isEnded);
  }

  public getEndedSessionData(roomId: string): any {
    return this.endedRooms.get(roomId) || this.rooms.get(roomId)?.endedSessionData;
  }

  public addUser(roomId: string, user: RoomUser): StoredRoom {
    const room = this.getOrCreateRoom(roomId);
    room.users.set(user.socketId, user);
    room.updatedAt = new Date();
    return room;
  }

  public removeUser(socketId: string): { roomId: string; user: RoomUser; remainingUsers: RoomUser[] } | null {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.users.has(socketId)) {
        const user = room.users.get(socketId)!;
        room.users.delete(socketId);
        room.updatedAt = new Date();
        const remainingUsers = Array.from(room.users.values());

        // We can keep rooms alive or cleanup if empty after long timeout
        return { roomId, user, remainingUsers };
      }
    }
    return null;
  }

  public updateCode(roomId: string, fullCode: string): number {
    const room = this.getOrCreateRoom(roomId);
    room.code = fullCode;
    room.version += 1;
    room.updatedAt = new Date();
    return room.version;
  }

  public updateLanguage(roomId: string, language: string): StoredRoom {
    const room = this.getOrCreateRoom(roomId);
    room.language = language;
    room.updatedAt = new Date();
    return room;
  }

  public updateTitle(roomId: string, title: string): StoredRoom {
    const room = this.getOrCreateRoom(roomId);
    room.title = title;
    room.updatedAt = new Date();
    return room;
  }

  public updateUserCursor(
    roomId: string, 
    socketId: string, 
    cursor?: { lineNumber: number; column: number }, 
    selection?: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number }
  ) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const user = room.users.get(socketId);
    if (user) {
      user.cursor = cursor;
      user.selection = selection;
    }
  }

  public getUsers(roomId: string): RoomUser[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.users.values());
  }
}

export const roomStore = new RoomStore();
