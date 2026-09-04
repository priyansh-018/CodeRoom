"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCandidateProfile = exports.updateProfile = exports.getMe = exports.login = exports.register = exports.verifyOtpAndRegister = exports.sendSignupOtp = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const db_js_1 = require("../db.js");
const JWT_SECRET = process.env.JWT_SECRET || 'coderoom_super_secret_jwt_key_2026';
function getEmailTransporter() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS)
        return null;
    return nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS.replace(/\s+/g, '')
        }
    });
}
// ─── 1. SEND REAL EMAIL OTP ───
const sendSignupOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || typeof email !== 'string') {
            res.status(400).json({ error: 'Valid email address is required' });
            return;
        }
        const cleanEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            res.status(400).json({ error: 'Please enter a valid, legitimate email address' });
            return;
        }
        // Verify if account already exists
        const existingInterviewer = await db_js_1.prisma.interviewer.findUnique({ where: { email: cleanEmail } });
        const existingCandidate = await db_js_1.prisma.candidate.findUnique({ where: { email: cleanEmail } });
        if (existingInterviewer || existingCandidate) {
            res.status(400).json({ error: 'An account with this email address already exists. Please sign in instead.' });
            return;
        }
        // Generate secure 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // Store in Database
        await db_js_1.prisma.emailOtp.upsert({
            where: { email: cleanEmail },
            create: {
                email: cleanEmail,
                otp,
                expiresAt
            },
            update: {
                otp,
                expiresAt
            }
        });
        const transporter = getEmailTransporter();
        if (transporter) {
            const emailHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050505; padding: 40px 20px; color: #ffffff;">
  <div style="max-width: 480px; margin: 0 auto; background: #0e0e0e; border-radius: 28px; padding: 36px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 60px rgba(0,0,0,0.8);">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
      <div style="width: 40px; height: 40px; border-radius: 12px; background: #7CFC00; display: flex; align-items: center; justify-content: center; color: #000000; font-weight: 900; font-size: 20px; box-shadow: 0 0 20px rgba(124,252,0,0.4);">
        &gt;_
      </div>
      <div>
        <span style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em;">CodeRoom</span>
        <span style="display: block; font-size: 11px; color: #7CFC00; font-family: monospace; font-weight: bold;">SECURITY AUTHENTICATION</span>
      </div>
    </div>

    <h2 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; letter-spacing: -0.01em;">Verify Your Email Address</h2>
    <p style="font-size: 14px; color: #a1a1aa; line-height: 1.6; margin: 0 0 26px 0;">
      Thank you for registering on CodeRoom. Enter the 6-digit verification code below to verify your email and complete your account setup:
    </p>

    <div style="background: #141414; border: 1px solid rgba(124, 252, 0, 0.4); border-radius: 20px; padding: 24px; text-align: center; margin-bottom: 26px; box-shadow: inset 0 0 20px rgba(124,252,0,0.05);">
      <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 12px; color: #7CFC00; display: inline-block;">
        ${otp}
      </span>
      <p style="margin: 10px 0 0 0; font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold;">Expires in 10 minutes</p>
    </div>

    <p style="font-size: 12px; color: #71717a; line-height: 1.5; margin: 0 0 20px 0;">
      If you did not request this verification code, please ignore this email. No account has been created yet.
    </p>

    <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px; font-size: 11px; color: #52525b; text-align: center;">
      © 2026 CodeRoom Platform • Dispatched from ${process.env.SMTP_USER || 'priyansh191882@gmail.com'}
    </div>
  </div>
</div>
`;
            await transporter.sendMail({
                from: `"CodeRoom Security" <${process.env.SMTP_USER}>`,
                to: cleanEmail,
                subject: `[CodeRoom] Your 6-Digit Verification Code is ${otp}`,
                html: emailHtml,
                text: `Your CodeRoom verification code is ${otp}. Valid for 10 minutes.`
            });
            console.log(`✅ [OTP Sent] Email delivered to ${cleanEmail} with code ${otp}`);
        }
        else {
            console.log(`⚠️ [Dev OTP] ${otp} for ${cleanEmail} (Nodemailer transporter not ready)`);
        }
        res.json({ success: true, message: `Verification code successfully sent to ${cleanEmail}` });
    }
    catch (error) {
        console.error('sendSignupOtp error:', error);
        res.status(500).json({ error: error.message || 'Failed to dispatch verification email' });
    }
};
exports.sendSignupOtp = sendSignupOtp;
// ─── 2. VERIFY OTP AND REGISTER USER ───
const verifyOtpAndRegister = async (req, res) => {
    try {
        const { name, email, password, phone, role, otp, 
        // Candidate fields:
        qualificationStatus, degree, skills, resumeUrl, resumeFileName, github, linkedin, 
        // Interviewer fields:
        organization, position } = req.body;
        if (!name || !email || !password || !otp) {
            res.status(400).json({ error: 'Name, email, password, and verification OTP are required' });
            return;
        }
        const cleanEmail = email.trim().toLowerCase();
        const cleanOtp = String(otp).trim();
        // Verify OTP
        const otpRecord = await db_js_1.prisma.emailOtp.findUnique({
            where: { email: cleanEmail }
        });
        if (!otpRecord) {
            res.status(400).json({ error: 'No active verification code found for this email. Please request a new OTP.' });
            return;
        }
        if (new Date() > otpRecord.expiresAt) {
            await db_js_1.prisma.emailOtp.delete({ where: { email: cleanEmail } }).catch(() => { });
            res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
            return;
        }
        if (otpRecord.otp !== cleanOtp) {
            res.status(400).json({ error: 'Invalid verification code. Please check your email inbox and enter the 6-digit code.' });
            return;
        }
        // Verify duplicate email
        const existingInterviewer = await db_js_1.prisma.interviewer.findUnique({ where: { email: cleanEmail } });
        const existingCandidate = await db_js_1.prisma.candidate.findUnique({ where: { email: cleanEmail } });
        if (existingInterviewer || existingCandidate) {
            res.status(400).json({ error: 'An account with this email already exists' });
            return;
        }
        // Delete verified OTP record
        await db_js_1.prisma.emailOtp.delete({ where: { email: cleanEmail } }).catch(() => { });
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const userRole = role === 'HOST' ? 'HOST' : 'CANDIDATE';
        // Format skills JSON string if array
        const skillsString = Array.isArray(skills)
            ? JSON.stringify(skills)
            : (typeof skills === 'string' ? skills : null);
        let user;
        if (userRole === 'HOST') {
            user = await db_js_1.prisma.interviewer.create({
                data: {
                    name: name.trim(),
                    email: cleanEmail,
                    passwordHash,
                    phone: phone || null,
                    organization: organization || null,
                    position: position || null,
                    company: organization || 'CodeRoom Host',
                    title: position || 'Senior Technical Interviewer',
                    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    avatarUrl: true,
                    bio: true,
                    title: true,
                    company: true,
                    organization: true,
                    position: true,
                    github: true,
                    linkedin: true,
                    createdAt: true
                }
            });
        }
        else {
            user = await db_js_1.prisma.candidate.create({
                data: {
                    name: name.trim(),
                    email: cleanEmail,
                    passwordHash,
                    phone: phone || null,
                    qualificationStatus: qualificationStatus || null,
                    degree: degree || null,
                    skills: skillsString,
                    resumeUrl: resumeUrl || null,
                    resumeFileName: resumeFileName || null,
                    github: github || null,
                    linkedin: linkedin || null,
                    title: degree ? `${degree} Candidate` : 'Software Engineering Candidate',
                    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    avatarUrl: true,
                    bio: true,
                    title: true,
                    university: true,
                    qualificationStatus: true,
                    degree: true,
                    skills: true,
                    resumeUrl: true,
                    resumeFileName: true,
                    github: true,
                    linkedin: true,
                    createdAt: true
                }
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role: userRole }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            message: 'Account verified and created successfully',
            token,
            user: { ...user, role: userRole }
        });
    }
    catch (error) {
        console.error('verifyOtpAndRegister error:', error);
        res.status(500).json({ error: error.message || 'Registration failed' });
    }
};
exports.verifyOtpAndRegister = verifyOtpAndRegister;
// ─── 3. STANDARD REGISTRATION (Direct Fallback) ───
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ error: 'Name, email, and password are required' });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters' });
            return;
        }
        const cleanEmail = email.trim().toLowerCase();
        const existingInterviewer = await db_js_1.prisma.interviewer.findUnique({ where: { email: cleanEmail } });
        const existingCandidate = await db_js_1.prisma.candidate.findUnique({ where: { email: cleanEmail } });
        if (existingInterviewer || existingCandidate) {
            res.status(400).json({ error: 'Account with this email already exists' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const userRole = role === 'HOST' ? 'HOST' : 'CANDIDATE';
        let user;
        if (userRole === 'HOST') {
            user = await db_js_1.prisma.interviewer.create({
                data: {
                    name: name.trim(),
                    email: cleanEmail,
                    passwordHash,
                    title: 'Senior Technical Interviewer',
                    company: 'CodeRoom Host',
                    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    bio: true,
                    title: true,
                    company: true,
                    organization: true,
                    position: true,
                    phone: true,
                    github: true,
                    linkedin: true,
                    createdAt: true
                }
            });
        }
        else {
            user = await db_js_1.prisma.candidate.create({
                data: {
                    name: name.trim(),
                    email: cleanEmail,
                    passwordHash,
                    title: 'Software Engineering Candidate',
                    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    bio: true,
                    title: true,
                    university: true,
                    qualificationStatus: true,
                    degree: true,
                    skills: true,
                    resumeUrl: true,
                    resumeFileName: true,
                    phone: true,
                    github: true,
                    linkedin: true,
                    createdAt: true
                }
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role: userRole }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            message: 'Account registered successfully',
            token,
            user: { ...user, role: userRole }
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};
exports.register = register;
// ─── 4. LOGIN ───
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const cleanEmail = email.trim().toLowerCase();
        // Check interviewer table first, then candidate table
        let user = await db_js_1.prisma.interviewer.findUnique({ where: { email: cleanEmail } });
        let role = 'HOST';
        if (!user) {
            user = await db_js_1.prisma.candidate.findUnique({ where: { email: cleanEmail } });
            role = 'CANDIDATE';
        }
        if (!user) {
            res.status(400).json({ error: 'Invalid email or password' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(400).json({ error: 'Invalid email or password' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role,
                avatarUrl: user.avatarUrl,
                bio: user.bio,
                title: user.title,
                company: user.company,
                organization: user.organization,
                position: user.position,
                university: user.university,
                qualificationStatus: user.qualificationStatus,
                degree: user.degree,
                skills: user.skills,
                resumeUrl: user.resumeUrl,
                resumeFileName: user.resumeFileName,
                github: user.github,
                linkedin: user.linkedin,
                createdAt: user.createdAt
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};
exports.login = login;
// ─── 5. GET CURRENT USER (ME) ───
const getMe = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        let user = await db_js_1.prisma.interviewer.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
                bio: true,
                title: true,
                company: true,
                organization: true,
                position: true,
                github: true,
                linkedin: true,
                createdAt: true
            }
        });
        let role = 'HOST';
        if (!user) {
            user = await db_js_1.prisma.candidate.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    avatarUrl: true,
                    bio: true,
                    title: true,
                    university: true,
                    qualificationStatus: true,
                    degree: true,
                    skills: true,
                    resumeUrl: true,
                    resumeFileName: true,
                    github: true,
                    linkedin: true,
                    createdAt: true
                }
            });
            role = 'CANDIDATE';
        }
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ user: { ...user, role } });
    }
    catch (error) {
        console.error('getMe error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};
exports.getMe = getMe;
// ─── 6. UPDATE PROFILE ───
const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { name, avatarUrl, bio, title, phone, company, organization, position, university, qualificationStatus, degree, skills, resumeUrl, resumeFileName, github, linkedin, currentPassword, newPassword } = req.body;
        let isInterviewer = true;
        let existing = await db_js_1.prisma.interviewer.findUnique({ where: { id: userId } });
        if (!existing) {
            existing = await db_js_1.prisma.candidate.findUnique({ where: { id: userId } });
            isInterviewer = false;
        }
        if (!existing) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        let passwordHash = existing.passwordHash;
        if (newPassword) {
            if (!currentPassword) {
                res.status(400).json({ error: 'Current password is required to set a new password' });
                return;
            }
            const isMatch = await bcryptjs_1.default.compare(currentPassword, existing.passwordHash);
            if (!isMatch) {
                res.status(400).json({ error: 'Current password does not match' });
                return;
            }
            if (newPassword.length < 6) {
                res.status(400).json({ error: 'New password must be at least 6 characters' });
                return;
            }
            const salt = await bcryptjs_1.default.genSalt(10);
            passwordHash = await bcryptjs_1.default.hash(newPassword, salt);
        }
        let updated;
        const role = isInterviewer ? 'HOST' : 'CANDIDATE';
        // Format skills if provided as array
        const skillsString = skills !== undefined
            ? (Array.isArray(skills) ? JSON.stringify(skills) : (typeof skills === 'string' ? skills : null))
            : existing.skills;
        if (isInterviewer) {
            updated = await db_js_1.prisma.interviewer.update({
                where: { id: userId },
                data: {
                    name: name !== undefined ? name : existing.name,
                    avatarUrl: avatarUrl !== undefined ? avatarUrl : existing.avatarUrl,
                    bio: bio !== undefined ? bio : existing.bio,
                    title: title !== undefined ? title : existing.title,
                    phone: phone !== undefined ? phone : existing.phone,
                    company: company !== undefined ? company : (organization || existing.company),
                    organization: organization !== undefined ? organization : existing.organization,
                    position: position !== undefined ? position : existing.position,
                    github: github !== undefined ? github : existing.github,
                    linkedin: linkedin !== undefined ? linkedin : existing.linkedin,
                    passwordHash
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    avatarUrl: true,
                    bio: true,
                    title: true,
                    company: true,
                    organization: true,
                    position: true,
                    github: true,
                    linkedin: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
        }
        else {
            updated = await db_js_1.prisma.candidate.update({
                where: { id: userId },
                data: {
                    name: name !== undefined ? name : existing.name,
                    avatarUrl: avatarUrl !== undefined ? avatarUrl : existing.avatarUrl,
                    bio: bio !== undefined ? bio : existing.bio,
                    title: title !== undefined ? title : existing.title,
                    phone: phone !== undefined ? phone : existing.phone,
                    university: university !== undefined ? university : existing.university,
                    qualificationStatus: qualificationStatus !== undefined ? qualificationStatus : existing.qualificationStatus,
                    degree: degree !== undefined ? degree : existing.degree,
                    skills: (skillsString !== undefined ? (typeof skillsString === 'string' ? skillsString : JSON.stringify(skillsString)) : existing.skills),
                    resumeUrl: resumeUrl !== undefined ? resumeUrl : existing.resumeUrl,
                    resumeFileName: resumeFileName !== undefined ? resumeFileName : existing.resumeFileName,
                    github: github !== undefined ? github : existing.github,
                    linkedin: linkedin !== undefined ? linkedin : existing.linkedin,
                    passwordHash
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    avatarUrl: true,
                    bio: true,
                    title: true,
                    university: true,
                    qualificationStatus: true,
                    degree: true,
                    skills: true,
                    resumeUrl: true,
                    resumeFileName: true,
                    github: true,
                    linkedin: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
        }
        res.json({
            message: 'Profile updated successfully',
            user: { ...updated, role }
        });
    }
    catch (error) {
        console.error('updateProfile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
exports.updateProfile = updateProfile;
// ─── 7. GET CANDIDATE PROFILE FOR INTERVIEWER ───
const getCandidateProfile = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            res.status(400).json({ error: 'Candidate ID is required' });
            return;
        }
        const candidate = await db_js_1.prisma.candidate.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
                bio: true,
                title: true,
                qualificationStatus: true,
                degree: true,
                skills: true,
                resumeUrl: true,
                resumeFileName: true,
                github: true,
                linkedin: true,
                createdAt: true
            }
        });
        if (!candidate) {
            res.status(404).json({ error: 'Candidate profile not found' });
            return;
        }
        res.json({ candidate });
    }
    catch (error) {
        console.error('getCandidateProfile error:', error);
        res.status(500).json({ error: 'Failed to fetch candidate profile' });
    }
};
exports.getCandidateProfile = getCandidateProfile;
