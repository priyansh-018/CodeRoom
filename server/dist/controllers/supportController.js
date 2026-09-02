"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serveAdminReplyPage = exports.handleAdminReply = exports.handleContactSupport = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'priyansh191882@gmail.com';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'service@gmail.com';
const ADMIN_SECRET = process.env.JWT_SECRET || 'coderoom_super_secret_jwt_key_2026';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
function getTransporter() {
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
// ─── USER SUBMITS A SUPPORT TICKET ───
const handleContactSupport = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required.' });
        }
        const ticketId = 'CR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const emailSubject = subject
            ? `[CodeRoom Support] ${subject} - from ${name} [${ticketId}]`
            : `[CodeRoom Support] Inquiry from ${name} [${ticketId}]`;
        // Build reply link for admin (opens the reply page with pre-filled params)
        const replyParams = new URLSearchParams({
            to: email,
            name: name,
            ticket: ticketId,
            subject: subject || 'Support Request',
            secret: ADMIN_SECRET
        });
        const replyLink = `${SERVER_URL}/api/support/reply?${replyParams.toString()}`;
        const htmlContent = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f0; padding: 24px; color: #0a0a0a;">
  <div style="max-width: 600px; margin: 0 auto; background: #0e0e0e; border-radius: 20px; padding: 32px; color: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 20px;">
      <h1 style="font-size: 22px; margin: 0; color: #72f000; font-weight: 900;">CodeRoom Support</h1>
      <span style="font-size: 11px; background: rgba(114,240,0,0.15); color: #72f000; padding: 3px 8px; border-radius: 9999px; font-weight: bold; font-family: monospace;">TICKET #${ticketId}</span>
    </div>

    <div style="background: #161616; border-radius: 12px; padding: 16px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.05);">
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #aaaaaa;"><strong>From:</strong> <span style="color: #ffffff;">${name}</span> &lt;<a href="mailto:${email}" style="color: #72f000; text-decoration: none;">${email}</a>&gt;</p>
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #aaaaaa;"><strong>Subject:</strong> <span style="color: #ffffff;">${subject || 'General Inquiry'}</span></p>
      <p style="margin: 0; font-size: 13px; color: #aaaaaa;"><strong>Received:</strong> <span style="color: #ffffff;">${new Date().toLocaleString()}</span></p>
    </div>

    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #72f000; margin: 0 0 8px 0;">Message Content</h3>
      <div style="background: #141414; padding: 18px; border-radius: 12px; font-size: 14px; line-height: 1.6; color: #e5e5e5; white-space: pre-wrap; border: 1px solid rgba(255,255,255,0.05);">${message}</div>
    </div>

    <div style="text-align: center; padding: 16px 0;">
      <a href="${replyLink}" style="display: inline-block; padding: 12px 32px; background: #72f000; color: #000000; font-weight: 900; font-size: 14px; border-radius: 9999px; text-decoration: none; letter-spacing: -0.02em;">↩ Reply as CodeRoom</a>
    </div>

    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; font-size: 11px; color: #555;">
      <p style="margin: 0;">⚠️ <strong>Do NOT hit Reply in Gmail.</strong> Use the green button above to reply as "CodeRoom &lt;${SUPPORT_EMAIL}&gt;" so your personal info stays hidden.</p>
    </div>
  </div>
</div>
`;
        // Confirmation email to user
        const userConfirmationHtml = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f0; padding: 24px; color: #0a0a0a;">
  <div style="max-width: 600px; margin: 0 auto; background: #0e0e0e; border-radius: 20px; padding: 32px; color: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
    <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 20px;">
      <h1 style="font-size: 22px; margin: 0; color: #72f000; font-weight: 900;">CodeRoom</h1>
    </div>
    <p style="font-size: 15px; color: #ffffff; margin-top: 0;">Hello <strong>${name}</strong>,</p>
    <p style="font-size: 14px; color: #cccccc; line-height: 1.6;">
      Thank you for reaching out. We have received your support ticket <strong style="color: #72f000;">#${ticketId}</strong> and our team is reviewing it. You'll receive a response at this email address shortly.
    </p>
    <div style="background: #161616; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid rgba(255,255,255,0.05);">
      <p style="margin: 0 0 6px 0; font-size: 12px; color: #888;"><strong>Subject:</strong> <span style="color: #fff;">${subject || 'Support Request'}</span></p>
      <p style="margin: 0; font-size: 12px; color: #888;"><strong>Ticket:</strong> <span style="color: #72f000; font-family: monospace;">#${ticketId}</span></p>
    </div>
    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; font-size: 11px; color: #666; text-align: center;">
      © 2026 CodeRoom • <a href="${FRONTEND_URL}" style="color: #72f000; text-decoration: none;">coderoom.dev</a>
    </div>
  </div>
</div>
`;
        const transporter = getTransporter();
        if (transporter) {
            // Send to admin
            await transporter.sendMail({
                from: `"CodeRoom" <${process.env.SMTP_USER}>`,
                to: ADMIN_EMAIL,
                replyTo: `"${name}" <${email}>`,
                subject: emailSubject,
                html: htmlContent
            });
            console.log(`✅ [Ticket ${ticketId}] Admin notification sent to ${ADMIN_EMAIL}`);
            // Send confirmation to user
            try {
                await transporter.sendMail({
                    from: `"CodeRoom" <${process.env.SMTP_USER}>`,
                    to: email,
                    subject: `[CodeRoom] Support Request Received - #${ticketId}`,
                    html: userConfirmationHtml
                });
                console.log(`✅ [Ticket ${ticketId}] User confirmation sent to ${email}`);
            }
            catch (err) {
                console.warn('Could not send user confirmation:', err);
            }
        }
        else {
            console.log(`📬 [Mock] Ticket ${ticketId} from ${name} <${email}>: ${message}`);
        }
        return res.status(200).json({ success: true, ticketId, message: 'Support ticket sent!' });
    }
    catch (error) {
        console.error('Support ticket error:', error);
        return res.status(500).json({ error: 'Failed to send support ticket.' });
    }
};
exports.handleContactSupport = handleContactSupport;
// ─── ADMIN REPLIES TO A USER (via the Reply page) ───
const handleAdminReply = async (req, res) => {
    try {
        const { to, name, ticketId, subject, message, secret } = req.body;
        // Simple auth check
        if (secret !== ADMIN_SECRET) {
            return res.status(403).json({ error: 'Unauthorized.' });
        }
        if (!to || !message) {
            return res.status(400).json({ error: 'Recipient and message are required.' });
        }
        const replySubject = `Re: [CodeRoom Support] ${subject || 'Your Inquiry'} [${ticketId || 'N/A'}]`;
        const replyHtml = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f0; padding: 24px; color: #0a0a0a;">
  <div style="max-width: 600px; margin: 0 auto; background: #0e0e0e; border-radius: 20px; padding: 32px; color: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 20px;">
      <h1 style="font-size: 22px; margin: 0; color: #72f000; font-weight: 900;">CodeRoom</h1>
      ${ticketId ? `<span style="font-size: 11px; background: rgba(114,240,0,0.15); color: #72f000; padding: 3px 8px; border-radius: 9999px; font-weight: bold; font-family: monospace;">RE: #${ticketId}</span>` : ''}
    </div>
    <p style="font-size: 15px; color: #ffffff; margin-top: 0;">Hello${name ? ` <strong>${name}</strong>` : ''},</p>
    <div style="font-size: 14px; color: #e0e0e0; line-height: 1.7; white-space: pre-wrap; margin: 16px 0;">${message}</div>
    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; margin-top: 24px; font-size: 11px; color: #666; text-align: center;">
      <p style="margin: 0;">CodeRoom Support Team • <a href="${FRONTEND_URL}" style="color: #72f000; text-decoration: none;">coderoom.dev</a></p>
    </div>
  </div>
</div>
`;
        const transporter = getTransporter();
        if (!transporter) {
            return res.status(500).json({ error: 'Email service not configured on server.' });
        }
        await transporter.sendMail({
            from: `"CodeRoom" <${process.env.SMTP_USER}>`,
            to: to,
            subject: replySubject,
            html: replyHtml,
            text: `Hello ${name || ''},\n\n${message}\n\n— CodeRoom Support Team`
        });
        console.log(`✅ [Admin Reply] Sent to ${to} for ticket ${ticketId}`);
        return res.status(200).json({ success: true, message: 'Reply sent successfully as CodeRoom.' });
    }
    catch (error) {
        console.error('Admin reply error:', error);
        return res.status(500).json({ error: 'Failed to send reply.' });
    }
};
exports.handleAdminReply = handleAdminReply;
// ─── ADMIN REPLY PAGE (serves a simple HTML form) ───
const serveAdminReplyPage = async (req, res) => {
    const { to, name, ticket, subject, secret } = req.query;
    if (secret !== ADMIN_SECRET) {
        return res.status(403).send('<h1>Unauthorized</h1>');
    }
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CodeRoom Admin Reply</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { min-height: 100vh; background: #F4F4F0; display: flex; align-items: center; justify-content: center; font-family: 'Plus Jakarta Sans', sans-serif; padding: 24px; }
    .card { width: 100%; max-width: 560px; background: #0E0E0E; border-radius: 28px; padding: 40px; color: #fff; box-shadow: 0 20px 60px rgba(0,0,0,0.25); }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(114,240,0,0.15); border: 1px solid rgba(114,240,0,0.3); color: #72F000; font-size: 11px; font-family: monospace; font-weight: 700; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; }
    h1 { font-size: 24px; font-weight: 900; letter-spacing: -0.03em; margin-bottom: 4px; }
    .meta { font-size: 12px; color: #888; margin-bottom: 24px; }
    .meta strong { color: #72F000; }
    label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #999; margin-bottom: 6px; }
    textarea { width: 100%; min-height: 160px; background: #161616; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 16px; color: #fff; font-size: 14px; font-family: inherit; line-height: 1.6; resize: vertical; outline: none; }
    textarea:focus { border-color: #72F000; }
    .actions { display: flex; gap: 12px; margin-top: 20px; }
    .btn { flex: 1; padding: 14px 20px; border: none; border-radius: 9999px; font-size: 13px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
    .btn-cancel { background: rgba(255,255,255,0.05); color: #999; }
    .btn-cancel:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .btn-send { background: #72F000; color: #000; }
    .btn-send:hover { background: #65D600; }
    .btn-send:disabled { opacity: 0.5; cursor: not-allowed; }
    .success { text-align: center; padding: 40px 0; }
    .success .icon { width: 56px; height: 56px; border-radius: 50%; background: #72F000; color: #000; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 28px; }
    .success h2 { font-size: 18px; font-weight: 900; margin-bottom: 8px; }
    .success p { font-size: 13px; color: #888; }
  </style>
</head>
<body>
  <div class="card" id="replyCard">
    <div class="badge">↩ ADMIN REPLY</div>
    <h1>Reply as CodeRoom</h1>
    <div class="meta">
      To: <strong>${name || 'User'}</strong> &lt;${to || ''}&gt; • Ticket: <strong>${ticket || 'N/A'}</strong>
    </div>
    <label>Your Response</label>
    <textarea id="replyMessage" placeholder="Type your response to the user..."></textarea>
    <div class="actions">
      <button class="btn btn-cancel" onclick="window.close()">Cancel</button>
      <button class="btn btn-send" id="sendBtn" onclick="sendReply()">Send as CodeRoom</button>
    </div>
  </div>

  <div class="card success" id="successCard" style="display:none;">
    <div class="icon">✓</div>
    <h2>Reply Sent!</h2>
    <p>Your response was delivered to <strong>${to || ''}</strong> from <strong>CodeRoom</strong>. You can close this tab.</p>
  </div>

  <script>
    async function sendReply() {
      const btn = document.getElementById('sendBtn');
      const msg = document.getElementById('replyMessage').value.trim();
      if (!msg) { alert('Please type a response.'); return; }
      btn.disabled = true;
      btn.textContent = 'Sending...';
      try {
        const res = await fetch('/api/support/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: '${to || ''}',
            name: '${(name || '').replace(/'/g, "\\'")}',
            ticketId: '${ticket || ''}',
            subject: '${(subject || '').replace(/'/g, "\\'")}',
            message: msg,
            secret: '${ADMIN_SECRET}'
          })
        });
        if (res.ok) {
          document.getElementById('replyCard').style.display = 'none';
          document.getElementById('successCard').style.display = 'block';
        } else {
          const data = await res.json();
          alert('Error: ' + (data.error || 'Failed to send'));
          btn.disabled = false;
          btn.textContent = 'Send as CodeRoom';
        }
      } catch (e) {
        alert('Network error');
        btn.disabled = false;
        btn.textContent = 'Send as CodeRoom';
      }
    }
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
};
exports.serveAdminReplyPage = serveAdminReplyPage;
