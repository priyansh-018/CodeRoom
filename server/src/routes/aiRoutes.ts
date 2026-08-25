import { Router, Request, Response } from 'express';
import { generateQuestion, analyzeCode } from '../services/claudeService.js';

const router = Router();

router.post('/generate-question', async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic = 'Arrays & Hashing', difficulty = 'Medium', language = 'javascript' } = req.body;
    const question = await generateQuestion(topic, difficulty, language);
    res.json(question);
  } catch (error: any) {
    console.error('generate-question route error:', error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

router.post('/analyze-code', async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, code, language = 'javascript', isDisqualified = false } = req.body;
    if (!code) {
      res.status(400).json({ error: 'Code is required' });
      return;
    }
    const feedback = await analyzeCode(question, code, language, isDisqualified);
    res.json(feedback);
  } catch (error: any) {
    console.error('analyze-code route error:', error);
    res.status(500).json({ error: 'Failed to analyze code' });
  }
});

export default router;
