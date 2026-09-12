import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import dns from 'node:dns/promises';
import net from 'node:net';

let cachedTransporter: Transporter | null = null;
let lastResolvedHost = '';
let lastResolvedAt = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

/**
 * Resolves a hostname specifically to an IPv4 address.
 * Prevents "connect ENETUNREACH" on cloud environments lacking IPv6 egress.
 */
async function resolveIPv4(hostname: string): Promise<string> {
  if (net.isIP(hostname)) {
    return hostname;
  }

  try {
    const addresses = await dns.resolve4(hostname);
    if (addresses && addresses.length > 0) {
      return addresses[0];
    }
  } catch (err: any) {
    console.warn(`[emailService] dns.resolve4 failed for ${hostname}:`, err.message);
  }

  try {
    const res = await (dns as any).lookup(hostname, { family: 4 });
    if (res && res.address) {
      return res.address;
    }
  } catch (err: any) {
    console.warn(`[emailService] dns.lookup family 4 failed for ${hostname}:`, err.message);
  }

  return hostname;
}

/**
 * Creates a Nodemailer transport with configured port and timeout
 */
async function createSmtpTransporter(port: number): Promise<Transporter | null> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, '');

  if (!user || !pass) {
    return null;
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const resolvedIp = await resolveIPv4(host);
  const secure = port === 465;

  return nodemailer.createTransport({
    host: resolvedIp,
    port,
    secure,
    auth: {
      user,
      pass
    },
    family: 4,
    servername: host,
    tls: {
      servername: host,
      rejectUnauthorized: false
    },
    connectionTimeout: 4500, // 4.5s fail-fast if cloud host blocks the port
    greetingTimeout: 4500,
    socketTimeout: 6000
  } as any);
}

/**
 * Gets or creates the primary cached Nodemailer transporter
 */
export async function getEmailTransporter(preferredPort?: number): Promise<Transporter | null> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, '');

  if (!user || !pass) {
    return null;
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = preferredPort || Number(process.env.SMTP_PORT) || 465;
  const now = Date.now();

  if (cachedTransporter && lastResolvedHost === `${host}:${port}` && now - lastResolvedAt < CACHE_TTL_MS) {
    return cachedTransporter;
  }

  const transporter = await createSmtpTransporter(port);
  if (transporter) {
    cachedTransporter = transporter;
    lastResolvedHost = `${host}:${port}`;
    lastResolvedAt = now;
  }

  return transporter;
}

export function resetEmailTransporter(): void {
  cachedTransporter = null;
  lastResolvedAt = 0;
}

/**
 * Send email via Resend HTTP API (works over port 443 HTTPS, never blocked by Render / cloud firewalls)
 */
async function sendViaResend(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const fromAddress = options.from || process.env.RESEND_FROM || 'CodeRoom <onboarding@resend.dev>';
  
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      reply_to: options.replyTo
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend API failed (${res.status}): ${errText}`);
  }

  console.log(`✅ [Resend API] Email sent to ${options.to}`);
  return true;
}

/**
 * Universal email dispatcher:
 * 1. Tries Resend API (HTTPS port 443) if RESEND_API_KEY is defined
 * 2. Otherwise tries SMTP port 465 with IPv4
 * 3. Falls back to SMTP port 587 if port 465 times out
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Option 1: Resend HTTP API
  if (process.env.RESEND_API_KEY) {
    return await sendViaResend(options);
  }

  const user = process.env.SMTP_USER;
  const from = options.from || `"CodeRoom" <${user || 'noreply@coderoom.dev'}>`;

  if (!user || !process.env.SMTP_PASS) {
    console.warn('[emailService] No SMTP or Resend credentials configured.');
    return false;
  }

  // Option 2: Try primary SMTP port
  const primaryPort = Number(process.env.SMTP_PORT) || 465;
  const secondaryPort = primaryPort === 465 ? 587 : 465;

  let lastError: any = null;

  try {
    const transporter = await getEmailTransporter(primaryPort);
    if (transporter) {
      await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo
      });
      return true;
    }
  } catch (err: any) {
    console.warn(`[emailService] SMTP port ${primaryPort} failed (${err.message}). Trying port ${secondaryPort}...`);
    lastError = err;
    resetEmailTransporter();
  }

  // Option 3: Fallback to alternate SMTP port
  try {
    const fallbackTransporter = await createSmtpTransporter(secondaryPort);
    if (fallbackTransporter) {
      await fallbackTransporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo
      });
      console.log(`✅ [emailService] SMTP delivered via fallback port ${secondaryPort}`);
      return true;
    }
  } catch (fallbackErr: any) {
    console.warn(`[emailService] SMTP port ${secondaryPort} also failed (${fallbackErr.message})`);
    lastError = fallbackErr;
  }

  throw new Error(
    `Outbound email blocked by host network (${lastError?.message || 'Connection timeout'}). Render/Cloud free tiers block SMTP ports 25, 465, and 587.`
  );
}
