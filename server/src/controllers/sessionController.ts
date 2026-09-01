import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { roomStore } from '../sockets/roomStore.js';

export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const sessions = await prisma.session.findMany({
      where: {
        AND: [
          userId ? { OR: [{ hostId: userId }, { guestId: userId }] } : {},
          {
            NOT: {
              AND: [
                { roomId: { startsWith: 'ai-mock' } },
                {
                  OR: [
                    { score: 0 },
                    { summary: { contains: 'disqualified', mode: 'insensitive' } },
                    { summary: { contains: 'violation', mode: 'insensitive' } }
                  ]
                }
              ]
            }
          }
        ]
      },
      orderBy: { startedAt: 'desc' },
      include: {
        host: { select: { id: true, name: true, email: true, avatarUrl: true, title: true, company: true } },
        guest: { select: { id: true, name: true, email: true, avatarUrl: true, title: true, university: true } },
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
        host: { select: { id: true, name: true, email: true, avatarUrl: true, title: true, company: true } },
        guest: { select: { id: true, name: true, email: true, avatarUrl: true, title: true, university: true } },
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

    const currentUserId = req.userId;
    let validHostId: string | undefined = undefined;
    let validGuestId: string | undefined = candidateId || undefined;

    // Determine whether caller is Interviewer or Candidate
    if (currentUserId) {
      const interviewer = await prisma.interviewer.findUnique({ where: { id: currentUserId } });
      if (interviewer) {
        validHostId = interviewer.id;
      } else {
        const candidate = await prisma.candidate.findUnique({ where: { id: currentUserId } });
        if (candidate) {
          validGuestId = candidate.id;
        }
      }
    }

    // If candidateId not explicitly resolved, check active room participants
    if (!validGuestId) {
      const activeRoom = roomStore.getRoom(roomId);
      if (activeRoom) {
        for (const user of activeRoom.users.values()) {
          if (user.userId && user.userId !== validHostId) {
            const isCand = await prisma.candidate.findUnique({ where: { id: user.userId } });
            if (isCand) {
              validGuestId = isCand.id;
              break;
            }
          }
        }
      }
    }

    // Ensure Room entity exists
    let room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      room = await prisma.room.create({
        data: {
          id: roomId,
          title: problemName || 'Technical Mock Interview',
          language: language || 'javascript',
          creatorId: validHostId
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
        hostId: validHostId,
        guestId: validGuestId,
        language: language || 'javascript',
        problemName: problemName || 'Live Technical Interview',
        summary: summary || 'Completed live technical interview session with proctoring.',
        score: typeof score === 'number' ? score : 85,
        violationCount: typeof violationCount === 'number' ? violationCount : 0,
        startedAt: new Date(Date.now() - 25 * 60 * 1000),
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

    console.log(`✅ Interview session saved [${session.id}] for Room: ${roomId} (Host: ${validHostId}, Candidate: ${validGuestId}, Score: ${score})`);

    // Lock room in roomStore
    roomStore.endRoom(roomId, {
      roomId,
      sessionId: session.id,
      score: session.score,
      summary: session.summary,
      problemName: session.problemName,
      violationCount: session.violationCount,
      endedAt: session.endedAt ? session.endedAt.toISOString() : new Date().toISOString()
    });

    res.status(201).json({
      message: 'Session saved and room ended successfully',
      session
    });
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
        host: { select: { id: true, name: true, email: true, avatarUrl: true } },
        guest: { select: { id: true, name: true, email: true, avatarUrl: true } },
        events: { orderBy: { timestamp: 'asc' } }
      }
    });

    if (!session) {
      res.status(404).json({ error: 'Session for this room not found' });
      return;
    }

    res.json({ session });
  } catch (error: any) {
    console.error('getSessionByRoomId error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
};

export const checkRoomStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const roomId = String(req.params.roomId);
    if (!roomId) {
      res.status(400).json({ error: 'Room ID required' });
      return;
    }

    if (roomId.startsWith('ai-mock')) {
      res.json({ exists: true, isEnded: roomStore.isRoomEnded(roomId), isAi: true });
      return;
    }

    const inMemoryExists = roomStore.hasRoom(roomId);
    const isEnded = roomStore.isRoomEnded(roomId);

    if (inMemoryExists) {
      res.json({ exists: true, isEnded, isAi: false });
      return;
    }

    const dbSession = await prisma.session.findFirst({
      where: { roomId }
    });

    if (dbSession) {
      res.json({ exists: true, isEnded: Boolean(dbSession.endedAt), isAi: false });
      return;
    }

    res.json({ exists: false, isEnded: false, isAi: false });
  } catch (error: any) {
    console.error('checkRoomStatus error:', error);
    res.status(500).json({ error: 'Failed to check room status' });
  }
};

export const getCompletedProblems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.json({ completed: [] });
      return;
    }

    const sessions = await prisma.session.findMany({
      where: {
        AND: [
          {
            OR: [{ hostId: userId }, { guestId: userId }]
          },
          {
            OR: [
              { score: { gte: 70 } },
              { summary: { contains: 'Completed', mode: 'insensitive' } },
              { summary: { contains: 'passed', mode: 'insensitive' } },
              { summary: { contains: 'COMPLETED' } }
            ]
          }
        ]
      },
      select: { problemName: true }
    });

    const completed = Array.from(new Set(sessions.map((s) => s.problemName).filter(Boolean) as string[]));
    res.json({ completed });
  } catch (error: any) {
    console.error('getCompletedProblems error:', error);
    res.status(500).json({ error: 'Failed to fetch completed problems' });
  }
};
