import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { roomStore } from '../sockets/roomStore.js';

export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const sessions = await prisma.session.findMany({
      where: userId ? {
        OR: [{ hostId: userId }, { guestId: userId }]
      } : undefined,
      orderBy: { startedAt: 'desc' },
      include: {
        host: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
        guest: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
      }
    });

    res.json({ sessions });
  } catch (error: any) {
    console.error('getSessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

export const getSessionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        host: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
        guest: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
        events: { orderBy: { timestamp: 'asc' } }
      }
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({ session });
  } catch (error: any) {
    console.error('getSessionById error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
};

export const saveSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      roomId, 
      language, 
      problemName, 
      summary, 
      score, 
      violationCount,
      events,
      candidateId,
      finalCode
    } = req.body;

    if (!roomId) {
      res.status(400).json({ error: 'Room ID is required' });
      return;
    }

    // Determine Host & Candidate IDs
    const hostId = req.userId || undefined;
    let guestId = candidateId || undefined;

    // If candidateId not explicitly provided, look up candidate from active room participants
    if (!guestId) {
      const activeRoom = roomStore.getRoom(roomId);
      if (activeRoom) {
        for (const user of activeRoom.users.values()) {
          if (user.userId && user.userId !== hostId && user.role === 'CANDIDATE') {
            guestId = user.userId;
            break;
          }
        }
      }
    }

    // Ensure the Room entity exists in DB
    let room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      room = await prisma.room.create({
        data: {
          id: roomId,
          title: problemName || 'Technical Mock Interview',
          language: language || 'javascript',
          creatorId: hostId
        }
      });
    }

    // Prepare session events for replay
    const sessionEvents: any[] = events && events.length > 0 ? [...events] : [];
    if (finalCode) {
      sessionEvents.push({
        type: 'DELTA',
        payload: { fullCode: finalCode },
        timestamp: new Date()
      });
    }

    const session = await prisma.session.create({
      data: {
        roomId: room.id,
        hostId,
        guestId,
        language: language || 'javascript',
        problemName: problemName || 'Live Technical Interview',
        summary: summary || 'Completed live technical interview session with proctoring.',
        score: typeof score === 'number' ? score : 85,
        violationCount: typeof violationCount === 'number' ? violationCount : 0,
        startedAt: new Date(Date.now() - 25 * 60 * 1000), // ~25 mins ago
        endedAt: new Date(),
        events: sessionEvents.length > 0 ? {
          create: sessionEvents.map((ev: any) => ({
            type: ev.type || 'DELTA',
            payload: ev.payload || {},
            timestamp: ev.timestamp ? new Date(ev.timestamp) : new Date()
          }))
        } : undefined
      },
      include: {
        events: true,
        host: { select: { id: true, name: true, email: true, avatarUrl: true } },
        guest: { select: { id: true, name: true, email: true, avatarUrl: true } }
      }
    });

    console.log(`✅ Interview session saved [${session.id}] for Room: ${roomId} (Host: ${hostId}, Candidate: ${guestId}, Score: ${score})`);

    // Lock the room in roomStore so no one can re-enter
    roomStore.endRoom(roomId, {
      roomId,
      sessionId: session.id,
      score: session.score,
      summary: session.summary,
      problemName: session.problemName,
      violationCount: session.violationCount,
      endedAt: session.endedAt ? session.endedAt.toISOString() : new Date().toISOString()
    });

    res.status(201).json({ message: 'Session saved successfully', session });
  } catch (error: any) {
    console.error('saveSession error:', error);
    res.status(500).json({ error: 'Failed to save session' });
  }
};

export const getSessionByRoomId = async (req: Request, res: Response): Promise<void> => {
  try {
    const roomId = String(req.params.roomId);
    const session = await prisma.session.findFirst({
      where: { roomId },
      orderBy: { startedAt: 'desc' },
      include: {
        host: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
        guest: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
        events: { orderBy: { timestamp: 'asc' } }
      }
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found for room' });
      return;
    }

    res.json({ session });
  } catch (error: any) {
    console.error('getSessionByRoomId error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
};
