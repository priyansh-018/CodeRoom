import { Router } from 'express';

const router = Router();

const DEFAULT_ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' }
];

// Endpoint to dynamically provide ICE (STUN + TURN) servers
router.get('/ice-servers', async (req, res) => {
  try {
    const meteredApiKey = process.env.METERED_API_KEY;
    const meteredAppName = process.env.METERED_APP_NAME;

    // 1. If Metered TURN credentials are provided in env
    if (meteredApiKey && meteredAppName) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const response = await fetch(
          `https://code_room.metered.live/api/v1/turn/credentials?apiKey=94cc41a856d9b225516f6e158686e876a10e`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            return res.json({ iceServers: data });
          }
        }
      } catch (err: any) {
        console.warn('Metered TURN fetch failed, using fallback:', err.message);
      }
    }

    // 2. If static custom TURN credentials are provided
    if (process.env.TURN_URL && process.env.TURN_USERNAME && process.env.TURN_PASSWORD) {
      const turnServers = [
        ...DEFAULT_ICE_SERVERS,
        {
          urls: process.env.TURN_URL.split(',').map((u) => u.trim()),
          username: process.env.TURN_USERNAME,
          credential: process.env.TURN_PASSWORD
        }
      ];
      return res.json({ iceServers: turnServers });
    }

    // 3. Fallback to Google and Twilio public STUN servers
    return res.json({ iceServers: DEFAULT_ICE_SERVERS });
  } catch (error) {
    return res.json({ iceServers: DEFAULT_ICE_SERVERS });
  }
});

export default router;
