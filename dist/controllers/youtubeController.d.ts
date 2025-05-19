import { Response, NextFunction } from 'express';
import { TypedRequestBody, TranscriptRequest } from '../types';
/**
 * @desc    Получить транскрипцию YouTube видео
 * @route   POST /api/youtube/transcript
 * @access  Public
 */
export declare const getTranscript: (req: TypedRequestBody<TranscriptRequest>, res: Response, next: NextFunction) => Promise<Response | void>;
