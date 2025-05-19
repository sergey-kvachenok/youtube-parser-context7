import { Request } from 'express';

export interface TranscriptItem {
  text: string;
  start: number;
  duration: number;
}

export interface TranscriptRequest {
  url?: string;
  videoId?: string;
  lang?: string;
  generateIfNotFound?: boolean;
  isPlainText?: boolean;
}

export interface TypedRequestBody<T> extends Request {
  body: T;
}

export interface WhisperSegment {
  text: string;
  start: number;
  end: number;
}

export interface WhisperResult {
  segments: WhisperSegment[];
}

export interface TranscriptResponse {
  success: boolean;
  data?: {
    videoId: string;
    transcript: TranscriptItem[] | string;
    generated: boolean;
  };
  error?: string;
  details?: string;
} 