import { Request } from 'express';

// Interface for transcript
export interface TranscriptItem {
  text: string;
  start: number;
  duration: number;
}

// Interface for transcript request
export interface TranscriptRequest {
  url?: string;
  videoId?: string;
  lang?: string;
  generateIfNotFound?: boolean;
}

// Extended request interface with typed body
export interface TypedRequestBody<T> extends Request {
  body: T;
}

// Interface for Whisper speech recognition result
export interface WhisperSegment {
  text: string;
  start: number;
  end: number;
}

export interface WhisperResult {
  segments: WhisperSegment[];
}

// Interface for transcript response
export interface TranscriptResponse {
  success: boolean;
  data?: {
    videoId: string;
    transcript: TranscriptItem[];
    generated: boolean;
  };
  error?: string;
  details?: string;
} 