"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const judge0Service_js_1 = require("../services/judge0Service.js");
const router = (0, express_1.Router)();
router.post('/execute', async (req, res) => {
    try {
        const { sourceCode, languageId = 63, language = 'javascript', sqlSchema } = req.body;
        if (!sourceCode) {
            res.status(400).json({ error: 'sourceCode is required' });
            return;
        }
        const result = await (0, judge0Service_js_1.executeCode)(sourceCode, languageId, language, sqlSchema);
        res.json(result);
    }
    catch (error) {
        console.error('Execute route error:', error);
        res.status(500).json({ error: 'Code execution failed' });
    }
});
exports.default = router;
