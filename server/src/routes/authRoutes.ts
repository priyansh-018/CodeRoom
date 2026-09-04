import { Router } from 'express';
import { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  sendSignupOtp, 
  verifyOtpAndRegister, 
  getCandidateProfile 
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// OTP Authentication & Registration
router.post('/send-otp', sendSignupOtp);
router.post('/verify-otp-and-register', verifyOtpAndRegister);

// Standard auth
router.post('/register', register);
router.post('/login', login);

// Profile
router.get('/me', authenticateToken as any, getMe as any);
router.put('/profile', authenticateToken as any, updateProfile as any);

// Candidate profile inspection for interviewers
router.get('/candidate-profile/:id', getCandidateProfile);

export default router;
