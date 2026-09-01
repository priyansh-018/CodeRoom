import { Router } from 'express';
import { handleContactSupport, handleAdminReply, serveAdminReplyPage } from '../controllers/supportController.js';

const router = Router();

router.post('/contact', handleContactSupport);

// Admin reply endpoints
router.get('/reply', serveAdminReplyPage);   // Serves the reply form (accessed from email link)
router.post('/reply', handleAdminReply);     // Processes the reply submission

export default router;
