"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const claudeService_js_1 = require("../services/claudeService.js");
const router = (0, express_1.Router)();
router.post('/generate-question', async (req, res) => {
    try {
        const { topic = 'Arrays & Hashing', difficulty = 'Medium', language = 'javascript', excludeTitles = [] } = req.body;
        const question = await (0, claudeService_js_1.generateQuestion)(topic, difficulty, language, Array.isArray(excludeTitles) ? excludeTitles : []);
        res.json(question);
    }
    catch (error) {
        console.error('generate-question route error:', error);
        res.status(500).json({ error: 'Failed to generate question' });
    }
});
router.post('/analyze-code', async (req, res) => {
    try {
        const { question, code, language = 'javascript', isDisqualified = false } = req.body;
        if (!code) {
            res.status(400).json({ error: 'Code is required' });
            return;
        }
        const feedback = await (0, claudeService_js_1.analyzeCode)(question, code, language, isDisqualified);
        res.json(feedback);
    }
    catch (error) {
        console.error('analyze-code route error:', error);
        res.status(500).json({ error: 'Failed to analyze code' });
    }
});
exports.default = router;
