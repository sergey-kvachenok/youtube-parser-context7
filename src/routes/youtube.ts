import express, { Router, Request, Response, NextFunction } from 'express';
import { getTranscript } from '../controllers/youtubeController';

const router: Router = express.Router();

/**
 * @route   POST /api/youtube/transcript
 * @desc    Get YouTube video transcript
 * @access  Public
 */
router.post('/transcript', async (req: Request, res: Response, next: NextFunction) => {
  await getTranscript(req as any, res, next);
});

export default router; 