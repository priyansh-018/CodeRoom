import { Router } from 'express';
import { getSessions, getSessionById, getSessionByRoomId, saveSession, checkRoomStatus, getCompletedProblems } from '../controllers/sessionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateToken as any, getSessions as any);
router.get('/completed-problems', authenticateToken as any, getCompletedProblems as any);
router.get('/check-room/:roomId', checkRoomStatus as any);
router.get('/room/:roomId', getSessionByRoomId as any);
router.get('/:id', getSessionById as any);
router.post('/', authenticateToken as any, saveSession as any);
router.post('/end', authenticateToken as any, saveSession as any);
router.post('/save', authenticateToken as any, saveSession as any);

export default router;
