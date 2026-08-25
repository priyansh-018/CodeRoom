"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_js_1 = require("../db.js");
const JWT_SECRET = process.env.JWT_SECRET || 'coderoom_super_secret_jwt_key_2026';
const localUsers = new Map();
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ error: 'Name, email, and password are required' });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        let user;
        try {
            // Try Prisma/PostgreSQL first
            const existingUser = await db_js_1.prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                res.status(400).json({ error: 'User with this email already exists' });
                return;
            }
            const created = await db_js_1.prisma.user.create({
                data: { name, email, passwordHash }
            });
            user = { id: created.id, name: created.name, email: created.email, createdAt: created.createdAt };
        }
        catch (dbErr) {
            // Fallback to local store
            if (localUsers.has(email)) {
                res.status(400).json({ error: 'User with this email already exists' });
                return;
            }
            const newUser = {
                id: 'user_' + Math.random().toString(36).substring(2, 9),
                name,
                email,
                passwordHash,
                createdAt: new Date()
            };
            localUsers.set(email, newUser);
            user = { id: newUser.id, name: newUser.name, email: newUser.email, createdAt: newUser.createdAt };
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            message: 'Account registered successfully',
            token,
            user
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
        let user = null;
        try {
            user = await db_js_1.prisma.user.findUnique({ where: { email } });
        }
        catch (dbErr) {
            user = localUsers.get(email) || null;
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
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
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
    res.json({
        user: {
            id: req.userId,
            email: req.userEmail,
            name: req.userName
        }
    });
};
exports.getMe = getMe;
