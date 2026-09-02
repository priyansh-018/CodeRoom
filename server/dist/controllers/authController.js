"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_js_1 = require("../db.js");
const JWT_SECRET = process.env.JWT_SECRET || 'coderoom_super_secret_jwt_key_2026';
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
        // Check both candidate and interviewer tables for duplicate email
        const existingInterviewer = await db_js_1.prisma.interviewer.findUnique({ where: { email } });
        const existingCandidate = await db_js_1.prisma.candidate.findUnique({ where: { email } });
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
                    name,
                    email,
                    passwordHash,
                    title: 'Senior Technical Interviewer',
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
                    github: true,
                    linkedin: true,
                    createdAt: true
                }
            });
        }
        else {
            user = await db_js_1.prisma.candidate.create({
                data: {
                    name,
                    email,
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
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        // Check interviewer table first, then candidate table
        let user = await db_js_1.prisma.interviewer.findUnique({ where: { email } });
        let role = 'HOST';
        if (!user) {
            user = await db_js_1.prisma.candidate.findUnique({ where: { email } });
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
                role,
                avatarUrl: user.avatarUrl,
                bio: user.bio,
                title: user.title,
                company: user.company,
                university: user.university,
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
                avatarUrl: true,
                bio: true,
                title: true,
                company: true,
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
                    avatarUrl: true,
                    bio: true,
                    title: true,
                    university: true,
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
const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { name, avatarUrl, bio, title, company, university, github, linkedin, currentPassword, newPassword } = req.body;
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
        if (isInterviewer) {
            updated = await db_js_1.prisma.interviewer.update({
                where: { id: userId },
                data: {
                    name: name !== undefined ? name : existing.name,
                    avatarUrl: avatarUrl !== undefined ? avatarUrl : existing.avatarUrl,
                    bio: bio !== undefined ? bio : existing.bio,
                    title: title !== undefined ? title : existing.title,
                    company: company !== undefined ? company : existing.company,
                    github: github !== undefined ? github : existing.github,
                    linkedin: linkedin !== undefined ? linkedin : existing.linkedin,
                    passwordHash
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    bio: true,
                    title: true,
                    company: true,
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
                    university: university !== undefined ? university : existing.university,
                    github: github !== undefined ? github : existing.github,
                    linkedin: linkedin !== undefined ? linkedin : existing.linkedin,
                    passwordHash
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    bio: true,
                    title: true,
                    university: true,
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
