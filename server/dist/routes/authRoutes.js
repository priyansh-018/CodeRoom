"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_js_1 = require("../controllers/authController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = (0, express_1.Router)();
// OTP Authentication & Registration
router.post('/send-otp', authController_js_1.sendSignupOtp);
router.post('/verify-otp-and-register', authController_js_1.verifyOtpAndRegister);
// Standard auth
router.post('/register', authController_js_1.register);
router.post('/login', authController_js_1.login);
// Profile
router.get('/me', authMiddleware_js_1.authenticateToken, authController_js_1.getMe);
router.put('/profile', authMiddleware_js_1.authenticateToken, authController_js_1.updateProfile);
// Candidate profile inspection for interviewers
router.get('/candidate-profile/:id', authController_js_1.getCandidateProfile);
exports.default = router;
