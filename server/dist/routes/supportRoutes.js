"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supportController_js_1 = require("../controllers/supportController.js");
const router = (0, express_1.Router)();
router.post('/contact', supportController_js_1.handleContactSupport);
// Admin reply endpoints
router.get('/reply', supportController_js_1.serveAdminReplyPage); // Serves the reply form (accessed from email link)
router.post('/reply', supportController_js_1.handleAdminReply); // Processes the reply submission
exports.default = router;
