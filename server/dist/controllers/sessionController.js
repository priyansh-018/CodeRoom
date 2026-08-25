"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSession = exports.getSessionById = exports.getSessions = void 0;
const db_js_1 = require("../db.js");
const localSessions = [
    {
        id: 'demo-session-1',
        roomId: 'room-interview-101',
        language: 'javascript',
        problemName: 'Two Sum & Hash Map Lookup',
        summary: 'Candidate solved the problem within 22 minutes with optimal O(N) linear time and clean modular test cases.',
        score: 92,
        startedAt: new Date(Date.now() - 3600000 * 24 * 2),
        endedAt: new Date(Date.now() - 3600000 * 24 * 2 + 1800000),
        events: [
            {
                id: 'ev-1',
                type: 'DELTA',
                payload: { deltaText: '// Starter setup', fullCode: '// Starter code\nfunction twoSum(nums, target) {}' },
                timestamp: new Date(Date.now() - 3600000 * 24 * 2)
            },
            {
                id: 'ev-2',
                type: 'DELTA',
                payload: { deltaText: 'Added map logic', fullCode: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}' },
                timestamp: new Date(Date.now() - 3600000 * 24 * 2 + 600000)
            },
            {
                id: 'ev-3',
                type: 'RUN',
                payload: { stdout: 'Result: [0, 1]\nAll test cases passed.', status: 'Accepted' },
                timestamp: new Date(Date.now() - 3600000 * 24 * 2 + 1200000)
            }
        ]
    },
    {
        id: 'demo-session-2',
        roomId: 'room-interview-102',
        language: 'python',
        problemName: 'Valid Palindrome & Two Pointers',
        summary: 'Strong handling of regex filtering and dual-pointer string traversal.',
        score: 85,
        startedAt: new Date(Date.now() - 3600000 * 24 * 5),
        endedAt: new Date(Date.now() - 3600000 * 24 * 5 + 1500000),
        events: []
    }
];
const getSessions = async (req, res) => {
    try {
        const userId = req.userId;
        try {
            const dbSessions = await db_js_1.prisma.session.findMany({
                where: userId ? {
                    OR: [{ hostId: userId }, { guestId: userId }]
                } : undefined,
                orderBy: { startedAt: 'desc' },
                include: {
                    host: { select: { id: true, name: true, email: true } },
                    guest: { select: { id: true, name: true, email: true } },
                }
            });
            if (dbSessions.length > 0) {
                res.json({ sessions: dbSessions });
                return;
            }
        }
        catch (dbErr) {
            // Fall through to in-memory fallback
        }
        res.json({ sessions: localSessions });
    }
    catch (error) {
        console.error('getSessions error:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
};
exports.getSessions = getSessions;
const getSessionById = async (req, res) => {
    try {
        const id = String(req.params.id);
        try {
            const dbSession = await db_js_1.prisma.session.findUnique({
                where: { id },
                include: {
                    host: { select: { id: true, name: true, email: true } },
                    guest: { select: { id: true, name: true, email: true } },
                    events: { orderBy: { timestamp: 'asc' } }
                }
            });
            if (dbSession) {
                res.json({ session: dbSession });
                return;
            }
        }
        catch (dbErr) {
            // Fallback
        }
        const local = localSessions.find(s => s.id === id);
        if (local) {
            res.json({ session: local });
            return;
        }
        res.status(404).json({ error: 'Session not found' });
    }
    catch (error) {
        console.error('getSessionById error:', error);
        res.status(500).json({ error: 'Failed to fetch session' });
    }
};
exports.getSessionById = getSessionById;
const saveSession = async (req, res) => {
    try {
        const { roomId, language, problemName, summary, score, events } = req.body;
        const newSession = {
            id: 'session_' + Math.random().toString(36).substring(2, 9),
            roomId: roomId || 'room-default',
            hostId: req.userId,
            language: language || 'javascript',
            problemName: problemName || 'Mock Coding Challenge',
            summary: summary || 'Collaborative coding interview session.',
            score: score || 85,
            startedAt: new Date(Date.now() - 1800000),
            endedAt: new Date(),
            events: events || []
        };
        try {
            const created = await db_js_1.prisma.session.create({
                data: {
                    roomId: newSession.roomId,
                    hostId: newSession.hostId,
                    language: newSession.language,
                    problemName: newSession.problemName,
                    summary: newSession.summary,
                    score: newSession.score,
                    startedAt: newSession.startedAt,
                    endedAt: newSession.endedAt,
                }
            });
            res.status(201).json({ message: 'Session saved successfully', session: created });
            return;
        }
        catch (dbErr) {
            localSessions.unshift(newSession);
            res.status(201).json({ message: 'Session saved successfully', session: newSession });
        }
    }
    catch (error) {
        console.error('saveSession error:', error);
        res.status(500).json({ error: 'Failed to save session' });
    }
};
exports.saveSession = saveSession;
