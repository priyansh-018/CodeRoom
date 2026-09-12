import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import dns from 'node:dns/promises';
import net from 'node:net';

let cachedTransporter: Transporter | null = null;
let lastResolvedHost = '';
let lastResolvedAt = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Resolves a hostname specifically to an IPv4 address.
 * This completely prevents "connect ENETUNREACH ... (:::0)" on cloud hosting platforms
 * (Render, Railway, AWS, DigitalOcean) that lack outbound IPv6 routing.
 */
async function resolveIPv4(hostname: string): Promise<string> {
  // If it's already an IP address, return it
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
 * Creates or returns a cached Nodemailer transporter configured strictly for IPv4.
 */
export async function getEmailTransporter(): Promise<Transporter | null> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, '');

  if (!user || !pass) {
    return null;
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = port === 465;
  const now = Date.now();

  // Return cached transporter if fresh and host hasn't changed
  if (cachedTransporter && lastResolvedHost === host && now - lastResolvedAt < CACHE_TTL_MS) {
    return cachedTransporter;
  }

  // Resolve to IPv4 to bypass Nodemailer's IPv6 randomizer
  const resolvedIp = await resolveIPv4(host);

  const transporter = nodemailer.createTransport({
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
    }
  } as any);

  cachedTransporter = transporter;
  lastResolvedHost = host;
  lastResolvedAt = now;

  return transporter;
}

/**
 * Invalidate the transporter cache in case of socket failure
 */
export function resetEmailTransporter(): void {
  cachedTransporter = null;
  lastResolvedAt = 0;
}
