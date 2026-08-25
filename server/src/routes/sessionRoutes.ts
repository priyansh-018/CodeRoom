import { Router } from 'express';
import { getSessions, getSessionById, saveSession } from '../controllers/sessionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateToken as any, getSessions as any);
router.get('/:id', getSessionById as any);
router.post('/', authenticateToken as any, saveSession as any);
router.post('/end', authenticateToken as any, saveSession as any);
router.post('/save', authenticateToken as any, saveSession as any);

export default router;
