import { Router, Request, Response } from 'express';
import { executeCode } from '../services/judge0Service.js';

const router = Router();

router.post('/execute', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sourceCode, languageId = 63, language = 'javascript', sqlSchema } = req.body;
    if (!sourceCode) {
      res.status(400).json({ error: 'sourceCode is required' });
      return;
    }

    const result = await executeCode(sourceCode, languageId, language, sqlSchema);
    res.json(result);
  } catch (error: any) {
    console.error('Execute route error:', error);
    res.status(500).json({ error: 'Code execution failed' });
  }
});

export default router;
